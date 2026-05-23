import { NextResponse } from "next/server";

import { dummyLibreNms } from "@/lib/dummy-data";
import { isDummyDataEnabled, requireEnv } from "@/lib/server/env";
import { fetchJsonServer } from "@/lib/server/fetch";
import type { LibreNmsSwitches } from "@/lib/types";

type LibreNmsDevicesResponse = {
  devices?: {
    hostname?: string;
    sysName?: string;
    ip?: string;
    type?: string;
    status?: string | number;
    disabled?: number | string;
  }[];
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

  const devices = (raw.devices ?? []).filter((d) => {
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
      name: d.hostname ?? d.sysName ?? "Ukjent",
      ip: d.ip,
    }));

  const offlineCount = offline.length;
  const onlineCount = Math.max(0, devices.length - offlineCount);

  const result: LibreNmsSwitches = {
    lastUpdatedAt: new Date().toISOString(),
    isDummyData: false,
    onlineCount,
    offlineCount,
    offline,
  };

  return NextResponse.json(result);
}

