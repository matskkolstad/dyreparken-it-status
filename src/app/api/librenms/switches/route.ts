import { NextResponse } from "next/server";

import { dummyLibreNms } from "@/lib/dummy-data";
import { isDummyDataEnabled, requireEnv } from "@/lib/server/env";
import { fetchJsonServer } from "@/lib/server/fetch";
import type { LibreNmsAlert, LibreNmsSwitches } from "@/lib/types";

type LibreNmsDevicesResponse = {
  devices?: {
    device_id?: number | string;
    hostname?: string;
    sysName?: string;
    ip?: string;
    type?: string;
    status?: string | number;
    disabled?: number | string;
  }[];
};

type LibreNmsAlertRow = {
  id?: string | number;
  device_id?: string | number;
  hostname?: string;
  sysName?: string;
  device?: string;
  alert?: string;
  rule?: string;
  message?: string;
  name?: string;
  severity?: string | number;
  state?: string | number;
  timestamp?: string | number;
  time_logged?: string | number;
  datetime?: string | number;
};

type LibreNmsAlertsResponse = {
  alerts?: LibreNmsAlertRow[];
  alertlog?: LibreNmsAlertRow[];
  logs?: LibreNmsAlertRow[];
  data?: LibreNmsAlertRow[];
};

function isOnline(status: unknown) {
  if (status === 1 || status === "1") return true;
  if (typeof status === "string") {
    const s = status.toLowerCase();
    if (["up", "ok", "online"].includes(s)) return true;
    if (["down", "offline"].includes(s)) return false;
  }
  return false;
}

function normalizeTimestamp(value?: string | number) {
  if (value === undefined || value === null) return new Date().toISOString();
  if (typeof value === "string") {
    const localPattern = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
    if (localPattern.test(value)) return value;
  }
  if (typeof value === "number") {
    const ms = value < 1_000_000_000_000 ? value * 1000 : value;
    return new Date(ms).toISOString();
  }
  const numeric = Number(value);
  if (Number.isFinite(numeric)) {
    const ms = numeric < 1_000_000_000_000 ? numeric * 1000 : numeric;
    return new Date(ms).toISOString();
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function resolveDeviceName(
  row: LibreNmsAlertRow,
  deviceById: Map<string, string>,
  deviceByHost: Map<string, string>,
  deviceByIp: Map<string, string>,
) {
  const idCandidate = row.device_id ?? row.device;
  if (idCandidate !== undefined && idCandidate !== null) {
    const match = deviceById.get(String(idCandidate));
    if (match) return match;
  }

  const hostCandidate = row.hostname ?? row.sysName ?? row.device;
  if (hostCandidate) {
    const hostKey = String(hostCandidate).toLowerCase();
    const hostMatch = deviceByHost.get(hostKey) ?? deviceByIp.get(hostKey);
    if (hostMatch) return hostMatch;
  }

  return row.sysName ?? row.hostname ?? row.device ?? "Ukjent";
}

function toAlert(
  row: LibreNmsAlertRow,
  deviceById: Map<string, string>,
  deviceByHost: Map<string, string>,
  deviceByIp: Map<string, string>,
): LibreNmsAlert {
  const device = resolveDeviceName(row, deviceById, deviceByHost, deviceByIp);
  const message = row.alert ?? row.rule ?? row.message ?? row.name ?? "Varsel";
  const timestamp = normalizeTimestamp(row.timestamp ?? row.time_logged ?? row.datetime);
  return {
    id: String(row.id ?? `${device}-${timestamp}`),
    device,
    message,
    timestamp,
    severity: row.severity ? String(row.severity) : undefined,
    state: row.state ? String(row.state) : undefined,
  };
}

function sortByTimestampDesc(a: LibreNmsAlert, b: LibreNmsAlert) {
  return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
}

function pickAlertRows(raw: LibreNmsAlertsResponse): LibreNmsAlertRow[] {
  return raw.alerts ?? raw.alertlog ?? raw.logs ?? raw.data ?? [];
}

async function fetchAlertRows(baseUrl: string, token: string, path: string) {
  const url = `${baseUrl}${path}`;
  const raw = await fetchJsonServer<LibreNmsAlertsResponse>(url, {
    headers: { "X-Auth-Token": token },
  });
  return pickAlertRows(raw);
}

export async function GET() {
  if (isDummyDataEnabled()) {
    return NextResponse.json(dummyLibreNms());
  }

  const baseUrl = requireEnv("LIBRENMS_BASE_URL").replace(/\/$/, "");
  const token = requireEnv("LIBRENMS_API_TOKEN");
  const switchRegex = process.env.LIBRENMS_SWITCH_REGEX;
  const filter = switchRegex ? new RegExp(switchRegex, "i") : undefined;

  const url = `${baseUrl}/api/v0/devices?order=hostname`;
  const raw = await fetchJsonServer<LibreNmsDevicesResponse>(url, {
    headers: { "X-Auth-Token": token },
  });

  const allDevices = raw.devices ?? [];
  const devices = allDevices.filter((d) => {
    if (d.disabled === 1 || d.disabled === "1") return false;
    const name = d.hostname ?? d.sysName ?? "";
    if (filter) return filter.test(name);
    // Heuristic: "network" is commonly used for switches/routers in LibreNMS.
    return d.type ? d.type.toLowerCase() === "network" : true;
  });

  const offline = devices
    .filter((d) => !isOnline(d.status))
    .slice(0, 10)
    .map((d) => ({
      name: d.sysName ?? d.hostname ?? "Ukjent",
      ip: d.ip,
    }));

  const offlineCount = offline.length;
  const onlineCount = Math.max(0, devices.length - offlineCount);

  const deviceById = new Map<string, string>();
  const deviceByHost = new Map<string, string>();
  const deviceByIp = new Map<string, string>();

  for (const device of allDevices) {
    const name = device.sysName ?? device.hostname ?? "Ukjent";
    if (device.device_id !== undefined && device.device_id !== null) {
      deviceById.set(String(device.device_id), name);
    }
    if (device.hostname) deviceByHost.set(device.hostname.toLowerCase(), name);
    if (device.sysName) deviceByHost.set(device.sysName.toLowerCase(), name);
    if (device.ip) deviceByIp.set(device.ip.toLowerCase(), name);
  }

  let alerts: LibreNmsAlert[] = [];
  let alertHistory: LibreNmsAlert[] = [];
  try {
    const alertRows = await fetchAlertRows(
      baseUrl,
      token,
      `/api/v0/alerts?state=1&order=timestamp%20desc&limit=10`,
    );
    alerts = alertRows
      .map((row) => toAlert(row, deviceById, deviceByHost, deviceByIp))
      .sort(sortByTimestampDesc)
      .slice(0, 5);
  } catch {
    alerts = [];
  }

  try {
    let historyRows = await fetchAlertRows(
      baseUrl,
      token,
      `/api/v0/alerts/log?order=timestamp%20desc&limit=10`,
    );

    if (!historyRows.length) {
      historyRows = await fetchAlertRows(
        baseUrl,
        token,
        `/api/v0/alerts?state=0&order=timestamp%20desc&limit=10`,
      );
    }

    alertHistory = historyRows
      .map((row) => toAlert(row, deviceById, deviceByHost, deviceByIp))
      .sort(sortByTimestampDesc)
      .slice(0, 5);
  } catch {
    alertHistory = [];
  }

  const result: LibreNmsSwitches = {
    lastUpdatedAt: new Date().toISOString(),
    isDummyData: false,
    onlineCount,
    offlineCount,
    offline,
    alerts,
    alertHistory,
  };

  return NextResponse.json(result);
}

