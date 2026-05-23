import { NextResponse } from "next/server";

import { dummyNinjaOne } from "@/lib/dummy-data";
import { isDummyDataEnabled, requireEnv } from "@/lib/server/env";
import { fetchJsonServer } from "@/lib/server/fetch";
import type { NinjaOneAgents } from "@/lib/types";

type NinjaOneDevice = { status?: string };

type NinjaOneDevicesResponse =
  | { devices?: NinjaOneDevice[] }
  | { data?: NinjaOneDevice[] }
  | NinjaOneDevice[];

function normalizeDeviceList(raw: NinjaOneDevicesResponse): NinjaOneDevice[] {
  if (Array.isArray(raw)) return raw;
  if (Array.isArray((raw as { devices?: NinjaOneDevice[] }).devices))
    return (raw as { devices: NinjaOneDevice[] }).devices;
  if (Array.isArray((raw as { data?: NinjaOneDevice[] }).data))
    return (raw as { data: NinjaOneDevice[] }).data;
  return [];
}

function isOnline(status?: string) {
  if (!status) return false;
  const s = status.toLowerCase();
  return ["online", "connected", "up", "active"].includes(s);
}

export async function GET() {
  if (isDummyDataEnabled()) {
    return NextResponse.json(dummyNinjaOne());
  }

  // Integration mode: provide a URL that returns device/agent list, plus an access token if needed.
  // Example: NINJAONE_DEVICES_URL=https://api.ninjarmm.com/v2/devices
  const url = requireEnv("NINJAONE_DEVICES_URL");
  const token = process.env.NINJAONE_ACCESS_TOKEN;

  const raw = await fetchJsonServer<NinjaOneDevicesResponse>(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  const devices = normalizeDeviceList(raw);
  const onlineCount = devices.filter((d) => isOnline(d.status)).length;
  const offlineCount = Math.max(0, devices.length - onlineCount);

  const result: NinjaOneAgents = {
    lastUpdatedAt: new Date().toISOString(),
    isDummyData: false,
    onlineCount,
    offlineCount,
  };

  return NextResponse.json(result);
}

