import { NextResponse } from "next/server";

import { dummyWeather } from "@/lib/dummy-data";
import { isDummyDataEnabled, requireEnv } from "@/lib/server/env";
import { fetchJsonServer } from "@/lib/server/fetch";
import type { WeatherCurrent } from "@/lib/types";

type MetResponse = {
  properties?: {
    timeseries?: Array<{
      data?: {
        instant?: {
          details?: {
            air_temperature?: number;
            wind_speed?: number;
          };
        };
        next_1_hours?: {
          summary?: { symbol_code?: string };
        };
        next_6_hours?: {
          summary?: { symbol_code?: string };
        };
        next_12_hours?: {
          summary?: { symbol_code?: string };
        };
      };
    }>;
  };
};

function symbolToText(symbol?: string) {
  if (!symbol) return "Ukjent";
  const normalized = symbol.replace(/_(day|night|polartwilight)$/i, "");
  const map: Record<string, string> = {
    clearsky: "Klarvær",
    fair: "Lettskyet",
    partlycloudy: "Delvis skyet",
    cloudy: "Skyet",
    fog: "Tåke",
    lightdrizzle: "Lett yr",
    drizzle: "Yr",
    heavydrizzle: "Kraftig yr",
    lightrain: "Lett regn",
    rain: "Regn",
    heavyrain: "Kraftig regn",
    lightsleet: "Lett sludd",
    sleet: "Sludd",
    heavysleet: "Kraftig sludd",
    lightsnow: "Lett snø",
    snow: "Snø",
    heavysnow: "Kraftig snø",
    lightrainshowers: "Lette regnbyger",
    rainshowers: "Regnbyger",
    heavyrainshowers: "Kraftige regnbyger",
    lightsleetshowers: "Lette sluddbyger",
    sleetshowers: "Sluddbyger",
    heavysleetshowers: "Kraftige sluddbyger",
    lightsnowshowers: "Lette snøbyger",
    snowshowers: "Snøbyger",
    heavysnowshowers: "Kraftige snøbyger",
    thunder: "Tordenvær",
    lightrainshowersandthunder: "Lette regnbyger og torden",
    rainshowersandthunder: "Regnbyger og torden",
    heavyrainshowersandthunder: "Kraftige regnbyger og torden",
    lightsleetshowersandthunder: "Lette sluddbyger og torden",
    sleetshowersandthunder: "Sluddbyger og torden",
    heavysleetshowersandthunder: "Kraftige sluddbyger og torden",
    lightsnowshowersandthunder: "Lette snøbyger og torden",
    snowshowersandthunder: "Snøbyger og torden",
    heavysnowshowersandthunder: "Kraftige snøbyger og torden",
  };
  return map[normalized] ?? "Vær";
}

export async function GET() {
  if (isDummyDataEnabled()) {
    return NextResponse.json(dummyWeather());
  }

  const lat = requireEnv("WEATHER_LAT");
  const lon = requireEnv("WEATHER_LON");
  const locationName = process.env.WEATHER_LOCATION_NAME ?? "Dyreparken, Kristiansand";
  const userAgent = requireEnv("WEATHER_USER_AGENT");

  const url =
    `https://api.met.no/weatherapi/locationforecast/2.0/compact` +
    `?lat=${encodeURIComponent(lat)}` +
    `&lon=${encodeURIComponent(lon)}`;

  const raw = await fetchJsonServer<MetResponse>(url, {
    headers: {
      "User-Agent": userAgent,
    },
  });

  const timeseries = raw.properties?.timeseries ?? [];
  const current = timeseries[0]?.data;
  const details = current?.instant?.details;
  const symbol =
    current?.next_1_hours?.summary?.symbol_code ??
    current?.next_6_hours?.summary?.symbol_code ??
    current?.next_12_hours?.summary?.symbol_code;

  const result: WeatherCurrent = {
    lastUpdatedAt: new Date().toISOString(),
    isDummyData: false,
    locationName,
    temperatureC: Math.round(details?.air_temperature ?? 0),
    windMs: details?.wind_speed ?? 0,
    condition: symbolToText(symbol),
  };

  return NextResponse.json(result);
}

