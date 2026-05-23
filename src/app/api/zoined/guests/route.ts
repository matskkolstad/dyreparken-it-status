import { NextResponse } from "next/server";

import { dummyZoined } from "@/lib/dummy-data";
import { isDummyDataEnabled, requireEnv } from "@/lib/server/env";
import { fetchJsonServer } from "@/lib/server/fetch";
import type { ZoinedGuests } from "@/lib/types";

type ZoinedGuestData = { dyreparkenGuests?: number; badelandGuests?: number };

type ZoinedResponse = ZoinedGuestData | { data?: ZoinedGuestData };

export async function GET() {
  if (isDummyDataEnabled()) {
    return NextResponse.json(dummyZoined());
  }

  // Integration mode: provide a URL that returns guest counts.
  // Example: ZOINED_GUESTS_URL=https://zoined.com/zapi/<...>/guest-count
  const url = requireEnv("ZOINED_GUESTS_URL");
  const apiKey = process.env.ZOINED_API_KEY;

  const raw = await fetchJsonServer<ZoinedResponse>(url, {
    headers: apiKey ? { Authorization: "Bearer " + apiKey } : undefined,
  });

  const data: ZoinedGuestData =
    (raw as { data?: ZoinedGuestData }).data ?? (raw as ZoinedGuestData);

  const result: ZoinedGuests = {
    lastUpdatedAt: new Date().toISOString(),
    isDummyData: false,
    dyreparkenGuests: Number(data?.dyreparkenGuests ?? 0),
    badelandGuests: Number(data?.badelandGuests ?? 0),
  };

  return NextResponse.json(result);
}
