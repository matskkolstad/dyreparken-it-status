import { NextResponse } from "next/server";

import { dummyOpeningHours } from "@/lib/dummy-data";
import { isDummyDataEnabled } from "@/lib/server/env";
import type { OpeningHours } from "@/lib/types";

const SOURCE_URL = "https://www.dyreparken.no/apningstider-og-priser/";

function extractHours(html: string, label: string) {
  const pattern = new RegExp(`${label}:\\s*</b>\\s*([^<]+)`, "i");
  const match = html.match(pattern);
  return match?.[1]?.trim() ?? "—";
}

export async function GET() {
  if (isDummyDataEnabled()) {
    return NextResponse.json(dummyOpeningHours());
  }

  const response = await fetch(SOURCE_URL, { cache: "no-store" });
  if (!response.ok) {
    return NextResponse.json(
      {
        lastUpdatedAt: new Date().toISOString(),
        isDummyData: false,
        dyreparken: "—",
        badeland: "—",
        sourceUrl: SOURCE_URL,
      } satisfies OpeningHours,
      { status: response.status },
    );
  }

  const html = await response.text();
  const dyreparken = extractHours(html, "Dyreparken");
  const badeland = extractHours(html, "Badelandet");

  const result: OpeningHours = {
    lastUpdatedAt: new Date().toISOString(),
    isDummyData: false,
    dyreparken,
    badeland,
    sourceUrl: SOURCE_URL,
  };

  return NextResponse.json(result);
}
