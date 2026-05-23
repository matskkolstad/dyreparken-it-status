import { NextResponse } from "next/server";

import { dummyEsper } from "@/lib/dummy-data";
import { isDummyDataEnabled, requireEnv } from "@/lib/server/env";
import { fetchJsonServer } from "@/lib/server/fetch";
import type { EsperDevices } from "@/lib/types";

type EsperDevice = { isOnline?: boolean; online?: boolean; status?: string };

type EsperDevicesResponse =
  | { devices?: EsperDevice[] }
  | { data?: EsperDevice[] }
  | EsperDevice[];

function normalizeList(raw: EsperDevicesResponse): EsperDevice[] {
  if (Array.isArray(raw)) return raw;
  if (Array.isArray((raw as { devices?: EsperDevice[] }).devices))
    return (raw as { devices: EsperDevice[] }).devices;
  if (Array.isArray((raw as { data?: EsperDevice[] }).data))
    return (raw as { data: EsperDevice[] }).data;
  return [];
}

function isOnline(device: EsperDevice) {
  if (typeof device?.isOnline === "boolean") return device.isOnline;
  if (typeof device?.online === "boolean") return device.online;
  const s = typeof device?.status === "string" ? device.status.toLowerCase() : "";
  return ["online", "connected", "active"].includes(s);
}

export async function GET() {
  if (isDummyDataEnabled()) {
    return NextResponse.json(dummyEsper());
  }

  // Integration mode: provide a URL that returns Esper device list, plus an access token if required.
  // Example: ESPER_DEVICES_URL=https://api.esper.io/api/enterprise/<tenant>/device/
  const url = requireEnv("ESPER_DEVICES_URL");
  const token = process.env.ESPER_API_TOKEN;

  const raw = await fetchJsonServer<EsperDevicesResponse>(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  const devices = normalizeList(raw);
  const onlineCount = devices.filter(isOnline).length;
  const offlineCount = Math.max(0, devices.length - onlineCount);

  const result: EsperDevices = {
    lastUpdatedAt: new Date().toISOString(),
    isDummyData: false,
    onlineCount,
    offlineCount,
  };

  return NextResponse.json(result);
}

