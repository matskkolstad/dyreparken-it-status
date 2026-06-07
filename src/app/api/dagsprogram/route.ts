import { NextResponse } from "next/server";

import { dummyDailyProgramme } from "@/lib/dummy-data";
import { isDummyDataEnabled } from "@/lib/server/env";
import type {
  DailyProgrammeFeed,
  DailyProgrammeListingItem,
  DailyProgrammePresentation,
  DailyProgrammeTime,
} from "@/lib/types";

const ALGOLIA_APP_ID = "C91UI7S2ES";
const ALGOLIA_API_KEY = "3fccef100b927f0886fb6b019e30984f";
const ALGOLIA_INDEX_NAME = "wp_posts_poi";
const SOURCE_URL = "https://www.dyreparken.no/dagsprogram/";
const ALGOLIA_URL = `https://${ALGOLIA_APP_ID}-dsn.algolia.net/1/indexes/${ALGOLIA_INDEX_NAME}/query`;

type AlgoliaResponse = {
  hits?: AlgoliaHit[];
};

type AlgoliaHit = {
  objectID: string;
  post_title?: string;
  taxonomies?: {
    poi_type?: string[];
    park_area?: string[];
  };
  opening_hours?: Record<string, AlgoliaOpeningWindow[]>;
};

type AlgoliaOpeningWindow = {
  from?: string;
  to?: string;
  allday?: boolean;
  temporarily_closed?: {
    reason?: string;
  };
};

function osloDateIso(date = new Date()) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Oslo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function formatTime(value?: string) {
  if (!value) return "Hele dagen";
  return value.slice(0, 5);
}

function osloClock(date = new Date()) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Oslo",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function isWindowExpired(window: AlgoliaOpeningWindow, date: string, todayDate: string, nowClock: string) {
  if (window.allday) return false;
  if (date < todayDate) return true;
  if (date > todayDate) return false;

  const end = formatTime(window.to ?? window.from);
  if (end === "Hele dagen") return false;
  return end < nowClock;
}

function firstValidTime(windows: AlgoliaOpeningWindow[]) {
  const openWindow = windows.find((window) => !window.temporarily_closed);
  const fallback = windows[0];
  const target = openWindow ?? fallback;
  if (!target) return "Hele dagen";
  if (target.allday) return "Hele dagen";
  return formatTime(target.from);
}

function toDailyTimes(windows: AlgoliaOpeningWindow[], date: string, todayDate: string, nowClock: string) {
  const times: DailyProgrammeTime[] = windows.map((window) => {
    const cancelled = Boolean(window.temporarily_closed) || isWindowExpired(window, date, todayDate, nowClock);

    if (window.allday) {
      return {
        label: "Hele dagen",
        cancelled,
      };
    }

    const from = formatTime(window.from);
    const to = formatTime(window.to);

    return {
      label: to && to !== "Hele dagen" ? `${from}–${to}` : from,
      cancelled,
    };
  });

  return times;
}

async function queryCategory(date: string, category: "Dyrepresentasjoner" | "Spisesteder" | "Butikker") {
  const body = {
    query: "",
    filters: "(NOT hidden_in_calendar=1)",
    facetFilters: [
      `open_or_temporarily_closed_days:${date}`,
      `taxonomies.poi_type:${category}`,
    ],
    hitsPerPage: 999,
    attributesToRetrieve: ["objectID", "post_title", "taxonomies", "opening_hours"],
    attributesToHighlight: [],
  };

  const response = await fetch(ALGOLIA_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Algolia-Application-Id": ALGOLIA_APP_ID,
      "X-Algolia-API-Key": ALGOLIA_API_KEY,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Algolia request failed (${response.status} ${response.statusText})`);
  }

  const parsed = (await response.json()) as AlgoliaResponse;
  return parsed.hits ?? [];
}

function toPresentation(hit: AlgoliaHit, date: string, todayDate: string, nowClock: string): DailyProgrammePresentation | null {
  const windows = hit.opening_hours?.[date] ?? [];
  if (!windows.length) return null;

  const times = toDailyTimes(windows, date, todayDate, nowClock);
  const location = hit.taxonomies?.park_area?.[0]?.trim() || "Ukjent sted";

  return {
    id: hit.objectID,
    name: hit.post_title?.trim() || "Ukjent aktivitet",
    location,
    times,
    hasCancelledTimes: times.every((time) => time.cancelled),
  };
}

function toListingItem(hit: AlgoliaHit, date: string): DailyProgrammeListingItem | null {
  const windows = hit.opening_hours?.[date] ?? [];
  if (!windows.length) return null;
  if (windows.every((window) => Boolean(window.temporarily_closed))) return null;

  return {
    id: hit.objectID,
    name: hit.post_title?.trim() || "Ukjent",
    openingTime: firstValidTime(windows),
  };
}

export async function GET() {
  if (isDummyDataEnabled()) {
    return NextResponse.json(dummyDailyProgramme());
  }

  const date = osloDateIso();
  const nowClock = osloClock();

  try {
    const [presentationsHits, eateriesHits, shopsHits] = await Promise.all([
      queryCategory(date, "Dyrepresentasjoner"),
      queryCategory(date, "Spisesteder"),
      queryCategory(date, "Butikker"),
    ]);

    const dyrepresentasjoner = presentationsHits
      .map((hit) => toPresentation(hit, date, date, nowClock))
      .filter((item): item is DailyProgrammePresentation => item !== null)
      .sort((a, b) => a.times[0]!.label.localeCompare(b.times[0]!.label, "nb"));

    const spisesteder = eateriesHits
      .map((hit) => toListingItem(hit, date))
      .filter((item): item is DailyProgrammeListingItem => item !== null)
      .sort((a, b) => a.openingTime.localeCompare(b.openingTime, "nb"));

    const butikker = shopsHits
      .map((hit) => toListingItem(hit, date))
      .filter((item): item is DailyProgrammeListingItem => item !== null)
      .sort((a, b) => a.openingTime.localeCompare(b.openingTime, "nb"));

    const payload: DailyProgrammeFeed = {
      lastUpdatedAt: new Date().toISOString(),
      isDummyData: false,
      sourceUrl: SOURCE_URL,
      date,
      dyrepresentasjoner,
      spisesteder,
      butikker,
    };

    return NextResponse.json(payload);
  } catch (error) {
    const fallback: DailyProgrammeFeed = {
      lastUpdatedAt: new Date().toISOString(),
      isDummyData: false,
      sourceUrl: SOURCE_URL,
      date,
      dyrepresentasjoner: [],
      spisesteder: [],
      butikker: [],
    };

    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        ...fallback,
        error: message,
      },
      { status: 502 },
    );
  }
}
