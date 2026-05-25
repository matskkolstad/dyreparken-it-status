import { NextResponse } from "next/server";

import { dummyLibreGraylog } from "@/lib/dummy-data";
import { isDummyDataEnabled, requireEnv } from "@/lib/server/env";
import { fetchJsonServer } from "@/lib/server/fetch";
import type { LibreNmsGraylog, LibreNmsGraylogEntry } from "@/lib/types";

type LibreNmsSyslogRow = {
  id?: string | number;
  device_id?: string | number;
  hostname?: string;
  sysName?: string;
  host?: string;
  datetime?: string;
  level?: string | number;
  severity?: string | number;
  facility?: string;
  program?: string;
  msg?: string;
  message?: string;
};

type LibreNmsSyslogResponse = {
  logs?: LibreNmsSyslogRow[];
};

function normalizeTimestamp(value?: string) {
  if (!value) return new Date().toISOString();
  return value;
}

function toGraylogEntry(row: LibreNmsSyslogRow, index: number): LibreNmsGraylogEntry {
  const origin = row.sysName ?? row.hostname ?? row.host ?? "Ukjent";
  const source = row.host ?? row.program ?? row.hostname ?? row.sysName;
  const message = row.msg ?? row.message ?? "Ukjent melding";
  const level = row.level ? String(row.level) : row.severity ? String(row.severity) : undefined;
  const facility = row.facility;

  return {
    id: String(row.id ?? `${origin}-${index}`),
    origin,
    timestamp: normalizeTimestamp(row.datetime),
    level,
    source,
    message,
    facility,
  };
}

export async function GET() {
  if (isDummyDataEnabled()) {
    return NextResponse.json(dummyLibreGraylog());
  }

  const baseUrl = requireEnv("LIBRENMS_BASE_URL").replace(/\/$/, "");
  const token = requireEnv("LIBRENMS_API_TOKEN");
  const hostname = process.env.LIBRENMS_GRAYLOG_HOSTNAME ?? "all";
  const limit = Number(process.env.LIBRENMS_GRAYLOG_LIMIT ?? "10");
  const limitValue = Number.isFinite(limit) && limit > 0 ? limit : 10;

  const url = `${baseUrl}/api/v0/logs/syslog/${hostname}?limit=${limitValue}&sortorder=DESC`;
  const raw = await fetchJsonServer<LibreNmsSyslogResponse>(url, {
    headers: { "X-Auth-Token": token },
  });

  const entries = (raw.logs ?? [])
    .map((row, index) => toGraylogEntry(row, index))
    .slice(0, limitValue);

  const result: LibreNmsGraylog = {
    lastUpdatedAt: new Date().toISOString(),
    isDummyData: false,
    entries,
  };

  return NextResponse.json(result);
}
