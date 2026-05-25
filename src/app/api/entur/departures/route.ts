import { NextResponse } from "next/server";

import { dummyEntur } from "@/lib/dummy-data";
import { isDummyDataEnabled, requireEnv } from "@/lib/server/env";
import { fetchJsonServer } from "@/lib/server/fetch";
import type { EnturDepartures, EnturDeparture } from "@/lib/types";

type EnturGraphqlResponse = {
  data?: {
    stopPlaces?: Array<{
      id?: string;
      name?: string;
      estimatedCalls?: Array<{
        aimedDepartureTime?: string;
        expectedDepartureTime?: string;
        realtime?: boolean;
        quay?: {
          publicCode?: string;
          name?: string;
        };
        destinationDisplay?: { frontText?: string };
        serviceJourney?: {
          journeyPattern?: {
            line?: {
              publicCode?: string;
            };
          };
        };
      }>;
    }>;
  };
  errors?: Array<{ message?: string }>;
};

const ENTUR_QUERY = `
query GetDepartures($stopPlaceIds: [String!]!, $maxDepartures: Int!) {
  stopPlaces(ids: $stopPlaceIds) {
    id
    name
    estimatedCalls(numberOfDepartures: $maxDepartures, whiteListedModes: [bus]) {
      aimedDepartureTime
      expectedDepartureTime
      realtime
      quay {
        publicCode
        name
      }
      destinationDisplay {
        frontText
      }
      serviceJourney {
        journeyPattern {
          line {
            publicCode
          }
        }
      }
    }
  }
}
`;

function toMinutesUntilDeparture(isoTime?: string) {
  if (!isoTime) return Number.POSITIVE_INFINITY;
  const departureMs = Date.parse(isoTime);
  if (!Number.isFinite(departureMs)) return Number.POSITIVE_INFINITY;
  return Math.ceil((departureMs - Date.now()) / 60_000);
}

function toDelayMinutes(expectedIso?: string, aimedIso?: string) {
  if (!expectedIso || !aimedIso) return 0;
  const expectedMs = Date.parse(expectedIso);
  const aimedMs = Date.parse(aimedIso);
  if (!Number.isFinite(expectedMs) || !Number.isFinite(aimedMs)) return 0;
  return Math.max(0, Math.round((expectedMs - aimedMs) / 60_000));
}

function mapDeparture(
  raw: NonNullable<
    NonNullable<
      NonNullable<NonNullable<EnturGraphqlResponse["data"]>["stopPlaces"]>[number]
    >["estimatedCalls"]
  >[number],
  stopPlaceId: string,
  stopPlaceName: string,
  index: number,
): EnturDeparture | null {
  const departureTime = raw.expectedDepartureTime ?? raw.aimedDepartureTime;
  const minutesUntilDeparture = toMinutesUntilDeparture(departureTime);
  const delayMinutes = toDelayMinutes(raw.expectedDepartureTime, raw.aimedDepartureTime);
  if (!Number.isFinite(minutesUntilDeparture) || minutesUntilDeparture < 0) {
    return null;
  }

  const line = raw.serviceJourney?.journeyPattern?.line?.publicCode ?? "-";
  const destination = raw.destinationDisplay?.frontText ?? "Ukjent destinasjon";
  const platform = raw.quay?.publicCode ?? raw.quay?.name ?? undefined;

  return {
    id: `${stopPlaceId}-${line}-${destination}-${index}`,
    line,
    destination,
    stopName: stopPlaceName,
    platform,
    departureTime: departureTime!,
    aimedDepartureTime: raw.aimedDepartureTime,
    minutesUntilDeparture,
    delayMinutes,
    isRealtime: Boolean(raw.realtime),
  };
}

export async function GET() {
  if (isDummyDataEnabled()) {
    return NextResponse.json(dummyEntur());
  }

  const stopPlaceIdsRaw =
    process.env.ENTUR_STOP_PLACE_IDS ?? requireEnv("ENTUR_STOP_PLACE_ID");
  const stopPlaceIds = stopPlaceIdsRaw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const clientName = requireEnv("ENTUR_CLIENT_NAME");
  const endpoint = process.env.ENTUR_API_URL ?? "https://api.entur.io/journey-planner/v3/graphql";
  const maxDepartures = Number(process.env.ENTUR_MAX_DEPARTURES ?? "10");

  const response = await fetchJsonServer<EnturGraphqlResponse>(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "ET-Client-Name": clientName,
    },
    body: JSON.stringify({
      query: ENTUR_QUERY,
      variables: {
        stopPlaceIds,
        maxDepartures: Number.isFinite(maxDepartures) && maxDepartures > 0 ? maxDepartures : 10,
      },
    }),
  });

  if (response.errors?.length) {
    const messages = response.errors
      .map((error) => error.message)
      .filter((message): message is string => Boolean(message));
    throw new Error(`Entur GraphQL error: ${messages.join("; ") || "Unknown error"}`);
  }

  const stopPlaces = response.data?.stopPlaces ?? [];
  const stopName = stopPlaces
    .map((stop) => stop.name)
    .filter((name): name is string => Boolean(name))
    .join(" + ") || "Dyreparken";
  const departures = stopPlaces
    .flatMap((stop) =>
      (stop.estimatedCalls ?? [])
        .map((call, index) =>
          mapDeparture(call, stop.id ?? "stop", stop.name ?? "Ukjent stopp", index),
        )
        .filter((departure): departure is EnturDeparture => departure !== null),
    )
    .sort((a, b) => a.minutesUntilDeparture - b.minutesUntilDeparture)
    .slice(0, 6);

  const result: EnturDepartures = {
    lastUpdatedAt: new Date().toISOString(),
    isDummyData: false,
    stopName,
    departures,
  };

  return NextResponse.json(result);
}
