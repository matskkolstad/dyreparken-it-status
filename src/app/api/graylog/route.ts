import { NextResponse } from "next/server";

import { dummyGraylog } from "@/lib/dummy-data";
import { fetchJsonServer } from "@/lib/server/fetch";
import type { GraylogEntry, GraylogLogs } from "@/lib/types";

type GraylogMessageEnvelope = {
  message?: Record<string, unknown>;
};

type GraylogSearchResponse = {
  messages?: GraylogMessageEnvelope[];
};

function normalizeBaseUrl(value: string) {
  const trimmed = value.replace(/\/$/, "");
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
}

function buildAuthHeader() {
  const token = process.env.GRAYLOG_API_TOKEN;
  if (token) {
    const encoded = Buffer.from(`${token}:token`).toString("base64");
    return `Basic ${encoded}`;
  }

  const username = process.env.GRAYLOG_USERNAME;
  const password = process.env.GRAYLOG_PASSWORD;
  if (username && password) {
    const encoded = Buffer.from(`${username}:${password}`).toString("base64");
    return `Basic ${encoded}`;
  }

  return undefined;
}

function formatLevel(value: unknown) {
  if (typeof value === "number") {
    const labels: Record<number, string> = {
      0: "Emergency",
      1: "Alert",
      2: "Critical",
      3: "Error",
      4: "Warning",
      5: "Notice",
      6: "Informational",
      7: "Debug",
    };
    return `(${value}) ${labels[value] ?? "Unknown"}`;
  }
  if (typeof value === "string" && value.length > 0) {
    return value;
  }
  return undefined;
}

function toEntry(envelope: GraylogMessageEnvelope, index: number): GraylogEntry {
  const message = envelope.message ?? {};
  const id = message._id;
  const source = message.source;
  const origin = message.gl2_source_input;
  const text = message.message;
  const timestamp = message.timestamp;
  const level = message.level;
  const facility = message.facility_string ?? message.facility;

  return {
    id: typeof id === "string" && id.length > 0 ? id : `graylog-${index}`,
    origin: typeof origin === "string" && origin.length > 0
      ? origin
      : typeof source === "string" && source.length > 0
      ? source
      : "Ukjent",
    timestamp: typeof timestamp === "string" && timestamp.length > 0
      ? timestamp
      : new Date().toISOString(),
    level: formatLevel(level),
    source: typeof source === "string" ? source : undefined,
    message: typeof text === "string" && text.length > 0 ? text : "Ukjent melding",
    facility: typeof facility === "string" ? facility : undefined,
  };
}

export async function GET() {
  const allowDummy = (process.env.GRAYLOG_ALLOW_DUMMY ?? "false").toLowerCase() === "true";
  if (allowDummy) {
    return NextResponse.json(dummyGraylog());
  }

  const baseUrl = process.env.GRAYLOG_BASE_URL;
  const authHeader = buildAuthHeader();
  if (!baseUrl) {
    return NextResponse.json(
      { error: "Graylog is not configured (missing GRAYLOG_BASE_URL)." },
      { status: 503 },
    );
  }
  if (!authHeader) {
    return NextResponse.json(
      { error: "Graylog is not configured (missing GRAYLOG_API_TOKEN or username/password)." },
      { status: 503 },
    );
  }

  const query = process.env.GRAYLOG_QUERY ?? "*";
  const range = Number(process.env.GRAYLOG_RANGE_SECONDS ?? "1800");
  const limit = Number(process.env.GRAYLOG_LIMIT ?? "10");
  const sort = process.env.GRAYLOG_SORT ?? "timestamp:desc";
  const fields = process.env.GRAYLOG_FIELDS ?? "timestamp,source,level,message,facility,facility_string,gl2_source_input,_id";

  const safeRange = Number.isFinite(range) && range > 0 ? Math.floor(range) : 1800;
  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(Math.floor(limit), 100) : 10;

  const searchParams = new URLSearchParams({
    query,
    range: String(safeRange),
    limit: String(safeLimit),
    sort,
    fields,
    decorate: "true",
    track_total_hits: "false",
  });

  const url = `${normalizeBaseUrl(baseUrl)}/search/universal/relative?${searchParams.toString()}`;

  try {
    const raw = await fetchJsonServer<GraylogSearchResponse>(url, {
      headers: {
        Accept: "application/json",
        Authorization: authHeader,
        "X-Requested-By": "dyreparken-it-status",
      },
    });

    const entries = (raw.messages ?? []).map((row, index) => toEntry(row, index));

    return NextResponse.json({
      lastUpdatedAt: new Date().toISOString(),
      isDummyData: false,
      entries,
    } satisfies GraylogLogs);
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Graylog request failed: ${detail}` },
      { status: 502 },
    );
  }
}
