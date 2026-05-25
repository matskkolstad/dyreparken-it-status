import { NextResponse } from "next/server";

import { dummyEsper } from "@/lib/dummy-data";
import { isDummyDataEnabled, requireEnv } from "@/lib/server/env";
import { fetchJsonServer } from "@/lib/server/fetch";
import type { EsperDevices } from "@/lib/types";

type EsperDevice = {
  id?: string;
  isOnline?: boolean;
  online?: boolean;
  is_active?: boolean;
  status?: string | number;
  state?: string | number;
  name?: string;
  deviceName?: string;
  displayName?: string;
  device_name?: string;
  alias_name?: string;
  serial?: string;
};

type EsperDevicesResponse =
  | { devices?: EsperDevice[] }
  | { data?: EsperDevice[] }
  | { results?: EsperDevice[]; count?: number; next?: string | null }
  | { results?: EsperDevice[] }
  | EsperDevice[];

type EsperHeartbeat = {
  device_id?: string;
  timestamp?: string;
  status?: number | string;
};

type EsperHeartbeatResponse = {
  content?: {
    count?: number;
    next?: string | null;
    results?: EsperHeartbeat[];
  };
};

let cachedEsper: { data: EsperDevices; fetchedAt: number } | null = null;
let inflightEsper: Promise<EsperDevices> | null = null;

function normalizeList(raw: EsperDevicesResponse): EsperDevice[] {
  if (Array.isArray(raw)) return raw;
  if (Array.isArray((raw as { devices?: EsperDevice[] }).devices))
    return (raw as { devices: EsperDevice[] }).devices;
  if (Array.isArray((raw as { data?: EsperDevice[] }).data))
    return (raw as { data: EsperDevice[] }).data;
  if (Array.isArray((raw as { results?: EsperDevice[] }).results))
    return (raw as { results: EsperDevice[] }).results;
  return [];
}

function isOnline(device: EsperDevice) {
  if (typeof device?.isOnline === "boolean") return device.isOnline;
  if (typeof device?.online === "boolean") return device.online;
  if (device?.status === 1 || device?.status === "1" || device?.status === 60 || device?.status === "60") {
    return true;
  }
  if (device?.state === 1 || device?.state === "1") return true;
  if (device?.status === 20 || device?.status === "20") return false;
  if (device?.state === 20 || device?.state === "20") return false;
  const s = typeof device?.status === "string" ? device.status.toLowerCase() : "";
  return ["online", "connected", "active"].includes(s);
}

function deviceName(device: EsperDevice, index: number) {
  return (
    device.alias_name ??
    device.device_name ??
    device.displayName ??
    device.deviceName ??
    device.name ??
    device.serial ??
    `Device-${index + 1}`
  );
}

function heartbeatBaseUrl(devicesUrl: string) {
  const base = new URL(devicesUrl);
  base.pathname = "/api/v2/heartbeat/";
  base.search = "";
  return base;
}

async function loadEsperData(): Promise<EsperDevices> {
  // Integration mode: provide a URL that returns Esper device list, plus an access token if required.
  // Example: ESPER_DEVICES_URL=https://api.esper.io/api/enterprise/<tenant>/device/
  const url = requireEnv("ESPER_DEVICES_URL");
  const token = process.env.ESPER_API_TOKEN;
  const offlineAfterMinutes = Number(process.env.ESPER_OFFLINE_AFTER_MINUTES ?? "1440");
  const offlineAfterMs = Number.isFinite(offlineAfterMinutes)
    ? Math.max(5, offlineAfterMinutes) * 60_000
    : 1_440 * 60_000;

  const devices: EsperDevice[] = [];
  const limit = 200;
  let offset = 0;
  let totalCount: number | undefined;

  for (let i = 0; i < 10; i += 1) {
    const pageUrl = new URL(url);
    pageUrl.searchParams.set("limit", String(limit));
    pageUrl.searchParams.set("offset", String(offset));

    const raw = await fetchJsonServer<EsperDevicesResponse>(pageUrl.toString(), {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    if (totalCount === undefined && typeof (raw as { count?: number }).count === "number") {
      totalCount = (raw as { count?: number }).count;
    }

    const pageDevices = normalizeList(raw);
    if (pageDevices.length === 0) break;
    devices.push(...pageDevices);

    offset += limit;
    if (totalCount !== undefined && devices.length >= totalCount) break;
  }
  const heartbeatUrl = heartbeatBaseUrl(url);
  const now = new Date();
  const lastSeenGt = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
  const heartbeatMap = new Map<string, EsperHeartbeat>();

  let heartbeatOffset = 0;
  let heartbeatTotal: number | undefined;
  for (let i = 0; i < 10; i += 1) {
    heartbeatUrl.searchParams.set("limit", "200");
    heartbeatUrl.searchParams.set("offset", String(heartbeatOffset));
    heartbeatUrl.searchParams.set("last_seen_gt", lastSeenGt.toISOString());
    heartbeatUrl.searchParams.set("last_seen_lt", now.toISOString());

    const heartbeatRaw = await fetchJsonServer<EsperHeartbeatResponse>(heartbeatUrl.toString(), {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    if (
      heartbeatTotal === undefined &&
      typeof heartbeatRaw.content?.count === "number"
    ) {
      heartbeatTotal = heartbeatRaw.content.count;
    }

    const page = heartbeatRaw.content?.results ?? [];
    for (const hb of page) {
      if (hb.device_id) heartbeatMap.set(hb.device_id, hb);
    }

    heartbeatOffset += 200;
    if (page.length === 0) break;
    if (heartbeatTotal !== undefined && heartbeatOffset >= heartbeatTotal) break;
  }

  const activeDevices = devices.filter((device) => device.is_active !== false);
  const offlineEntries = activeDevices
    .map((device) => {
      const heartbeat = device.id ? heartbeatMap.get(device.id) : undefined;
      const timestamp = heartbeat?.timestamp;
      const lastSeen = timestamp ? Date.parse(timestamp) : Number.NaN;
      const ageMs = Number.isFinite(lastSeen) ? now.getTime() - lastSeen : Number.POSITIVE_INFINITY;
      const status = heartbeat?.status;
      const isOffline =
        !timestamp ||
        !Number.isFinite(lastSeen) ||
        status === 0 ||
        status === "0" ||
        ageMs > offlineAfterMs;
      return {
        device,
        isOffline,
        lastSeenMs: Number.isFinite(lastSeen) ? lastSeen : 0,
        lastSeenAt: timestamp,
      };
    })
    .filter((entry) => entry.isOffline)
    .sort((a, b) => b.lastSeenMs - a.lastSeenMs);

  const offlineCount = offlineEntries.length;
  const onlineCount = Math.max(0, activeDevices.length - offlineCount);
  const offline = offlineEntries.slice(0, 20).map((entry, index) => ({
    name: deviceName(entry.device, index),
    lastSeenAt: entry.lastSeenAt,
  }));

  const result: EsperDevices = {
    lastUpdatedAt: new Date().toISOString(),
    isDummyData: false,
    onlineCount,
    offlineCount,
    offline,
  };

  return result;
}

export async function GET() {
  if (isDummyDataEnabled()) {
    return NextResponse.json(dummyEsper());
  }

  const cacheTtlMs = Number(process.env.ESPER_CACHE_TTL_MS ?? "30000");
  const now = Date.now();
  if (cachedEsper && now - cachedEsper.fetchedAt < cacheTtlMs) {
    return NextResponse.json(cachedEsper.data);
  }

  if (inflightEsper) {
    if (cachedEsper) return NextResponse.json(cachedEsper.data);
    const data = await inflightEsper;
    return NextResponse.json(data);
  }

  inflightEsper = loadEsperData()
    .then((data) => {
      cachedEsper = { data, fetchedAt: Date.now() };
      return data;
    })
    .finally(() => {
      inflightEsper = null;
    });

  const data = await inflightEsper;
  return NextResponse.json(data);
}

