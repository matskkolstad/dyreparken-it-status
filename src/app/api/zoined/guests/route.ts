import { NextResponse } from "next/server";

import { dummyZoined } from "@/lib/dummy-data";
import { isDummyDataEnabled, requireEnv } from "@/lib/server/env";
import { fetchJsonServer } from "@/lib/server/fetch";
import type { ZoinedGuests } from "@/lib/types";

type ZoinedGuestData = { dyreparkenGuests?: number; badelandGuests?: number };

type ZoinedResponse = ZoinedGuestData | { data?: ZoinedGuestData };

type ZoinedPublicReportConfig = {
  components?: Array<{
    custom_title?: string;
    chart_token?: string;
    request_params?: Record<string, unknown>;
  }>;
};

type ZoinedPublicComponent = NonNullable<ZoinedPublicReportConfig["components"]>[number];

type ZoinedSnippetResponse = {
  value?: number | string;
};

let cachedReportConfig:
  | { fetchedAt: number; config: ZoinedPublicReportConfig }
  | null = null;
let cachedGuests: { fetchedAt: number; data: ZoinedGuests } | null = null;
let inflightGuests: Promise<ZoinedGuests> | null = null;

function parseReportConfig(html: string): ZoinedPublicReportConfig | null {
  const match = html.match(/window\.publicReportConfig\s*=\s*(\{[\s\S]*?\});/);
  if (!match?.[1]) return null;
  try {
    return JSON.parse(match[1]) as ZoinedPublicReportConfig;
  } catch {
    return null;
  }
}

async function loadReportConfig(url: string) {
  const now = Date.now();
  if (cachedReportConfig && now - cachedReportConfig.fetchedAt < 60_000) {
    return cachedReportConfig.config;
  }

  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Zoined report fetch failed: ${response.status} ${response.statusText}`);
  }
  const html = await response.text();
  const config = parseReportConfig(html);
  if (!config) {
    throw new Error("Zoined report config not found");
  }
  cachedReportConfig = { fetchedAt: now, config };
  return config;
}

async function fetchSnippetValue(
  reportUrl: string,
  component: ZoinedPublicComponent,
) {
  const token = component.chart_token;
  const requestParams = component.request_params;
  if (!token || !requestParams) {
    throw new Error("Zoined chart token missing");
  }

  const snippetUrl = new URL("/api/v1/snippets/visits.json", reportUrl);
  snippetUrl.searchParams.set("locale", "nb");

  const payload = { chart_token: token, ...requestParams };
  const result = await fetchJsonServer<ZoinedSnippetResponse>(snippetUrl.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return Number(result.value ?? 0);
}

export async function GET() {
  if (isDummyDataEnabled()) {
    return NextResponse.json(dummyZoined());
  }

  const cacheTtlMs = Number(process.env.ZOINED_CACHE_TTL_MS ?? "60000");
  const now = Date.now();
  if (cachedGuests && now - cachedGuests.fetchedAt < cacheTtlMs) {
    return NextResponse.json(cachedGuests.data);
  }

  if (inflightGuests) {
    if (cachedGuests) return NextResponse.json(cachedGuests.data);
    const data = await inflightGuests;
    return NextResponse.json(data);
  }

  const publicReportUrl = process.env.ZOINED_PUBLIC_REPORT_URL;
  let data: ZoinedGuestData | undefined;

  if (publicReportUrl) {
    const config = await loadReportConfig(publicReportUrl);
    const components = config.components ?? [];
    const dyreTitle = process.env.ZOINED_DYREPARKEN_TITLE ?? "Gjester i dag - Dyreparken";
    const badelandTitle = process.env.ZOINED_BADELAND_TITLE ?? "Gjester i dag - Badelandet";
    const dyreComponent = components.find((c) => c.custom_title === dyreTitle);
    const badelandComponent = components.find((c) => c.custom_title === badelandTitle);
    if (!dyreComponent || !badelandComponent) {
      throw new Error("Zoined report components not found");
    }

    const [dyreparkenGuests, badelandGuests] = await Promise.all([
      fetchSnippetValue(publicReportUrl, dyreComponent),
      fetchSnippetValue(publicReportUrl, badelandComponent),
    ]);

    data = { dyreparkenGuests, badelandGuests };
  } else {
    // Integration mode: provide a URL that returns guest counts.
    // Example: ZOINED_GUESTS_URL=https://zoined.com/zapi/<...>/guest-count
    const url = requireEnv("ZOINED_GUESTS_URL");
    const apiKey = process.env.ZOINED_API_KEY;

    const raw = await fetchJsonServer<ZoinedResponse>(url, {
      headers: apiKey ? { Authorization: "Bearer " + apiKey } : undefined,
    });

    data = (raw as { data?: ZoinedGuestData }).data ?? (raw as ZoinedGuestData);
  }

  inflightGuests = Promise.resolve(data)
    .then((resolved) => {
      const result: ZoinedGuests = {
        lastUpdatedAt: new Date().toISOString(),
        isDummyData: false,
        dyreparkenGuests: Number(resolved?.dyreparkenGuests ?? 0),
        badelandGuests: Number(resolved?.badelandGuests ?? 0),
      };
      cachedGuests = { fetchedAt: Date.now(), data: result };
      return result;
    })
    .finally(() => {
      inflightGuests = null;
    });

  const result = await inflightGuests;
  return NextResponse.json(result);
}
