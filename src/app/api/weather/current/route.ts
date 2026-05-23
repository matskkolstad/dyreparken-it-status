import { NextResponse } from "next/server";

import { dummyWeather } from "@/lib/dummy-data";
import { isDummyDataEnabled, requireEnv } from "@/lib/server/env";
import { fetchJsonServer } from "@/lib/server/fetch";
import type { WeatherCurrent } from "@/lib/types";

type OpenMeteoResponse = {
  current?: {
    temperature_2m?: number;
    wind_speed_10m?: number;
    weather_code?: number;
  };
};

function weatherCodeToText(code?: number) {
  if (code === undefined) return "Ukjent";
  if (code === 0) return "Klarvær";
  if ([1, 2, 3].includes(code)) return "Delvis skyet";
  if ([45, 48].includes(code)) return "Tåke";
  if ([51, 53, 55].includes(code)) return "Yr";
  if ([61, 63, 65].includes(code)) return "Regn";
  if ([71, 73, 75].includes(code)) return "Snø";
  if ([80, 81, 82].includes(code)) return "Regnbyger";
  if ([95, 96, 99].includes(code)) return "Tordenvær";
  return "Vær";
}

export async function GET() {
  if (isDummyDataEnabled()) {
    return NextResponse.json(dummyWeather());
  }

  const lat = requireEnv("WEATHER_LAT");
  const lon = requireEnv("WEATHER_LON");
  const locationName = process.env.WEATHER_LOCATION_NAME ?? "Dyreparken, Kristiansand";

  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${encodeURIComponent(lat)}` +
    `&longitude=${encodeURIComponent(lon)}` +
    `&current=temperature_2m,wind_speed_10m,weather_code` +
    `&wind_speed_unit=ms` +
    `&timezone=Europe%2FOslo`;

  const raw = await fetchJsonServer<OpenMeteoResponse>(url);

  const result: WeatherCurrent = {
    lastUpdatedAt: new Date().toISOString(),
    isDummyData: false,
    locationName,
    temperatureC: Math.round(raw.current?.temperature_2m ?? 0),
    windMs: raw.current?.wind_speed_10m ?? 0,
    condition: weatherCodeToText(raw.current?.weather_code),
  };

  return NextResponse.json(result);
}

