"use client";

import { FileText } from "lucide-react";

import type { LibreNmsGraylog } from "@/lib/types";
import { DEFAULT_REFRESH_INTERVAL_MS } from "@/lib/dashboard-config";
import { useApiData } from "@/lib/hooks/use-api-data";
import { useDynamicListLimit } from "@/lib/hooks/use-dynamic-list-limit";
import { ModuleCard } from "@/components/ui/ModuleCard";

function formatLogTime(timestamp?: string) {
  if (!timestamp) return "—";
  const localPattern = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::\d{2})?$/;
  const localMatch = localPattern.exec(timestamp);
  if (localMatch) {
    const [, , month, day, hour, minute] = localMatch;
    return `${day}.${month}., ${hour}:${minute}`;
  }
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("nb-NO", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Oslo",
  });
}

function parseLevelNumber(level?: string) {
  if (!level) return undefined;
  const match = /\d+/.exec(level);
  if (!match) return undefined;
  const value = Number(match[0]);
  return Number.isFinite(value) ? value : undefined;
}

function levelTone(level?: string) {
  const value = level?.toLowerCase() ?? "";
  const number = parseLevelNumber(level);

  if (value.includes("error") || value.includes("critical") || (number !== undefined && number <= 3)) {
    return "bg-red-500/15 text-red-300 ring-red-500/30";
  }
  if (value.includes("warn") || (number !== undefined && number === 4)) {
    return "bg-amber-500/15 text-amber-300 ring-amber-500/30";
  }
  if (value.includes("info") || (number !== undefined && number >= 5)) {
    return "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30";
  }
  return "bg-white/5 text-white/70 ring-white/10";
}

export function LibreGraylogModule(props: { refreshToken: number; dynamicMode?: boolean }) {
  const dynamicMode = props.dynamicMode ?? false;
  const { data, error } = useApiData<LibreNmsGraylog>("/api/librenms/graylog", {
    intervalMs: DEFAULT_REFRESH_INTERVAL_MS,
    refreshToken: props.refreshToken,
  });

  const dynamicLimit = useDynamicListLimit(dynamicMode, 5, {
    min: 5,
    max: 10,
    rowHeight: 56,
    reservedHeight: 320,
  });

  const entries = data?.entries ?? [];
  const displayLimit = dynamicMode ? dynamicLimit : 10;
  const hasEntries = entries.length > 0;
  const severity = error ? "unknown" : hasEntries ? "ok" : "degraded";
  const rowSpan = severity === "degraded" ? 2 : 1;
  const statusText = error ? "Feil" : data?.isDummyData ? "Dummy" : "Live";

  return (
    <ModuleCard
      moduleId="libre-graylog"
      title="Libre Graylog"
      severity={severity}
      statusText={statusText}
      pulseKey={data?.lastUpdatedAt}
      dynamicMode={dynamicMode}
      rowSpan={rowSpan}
      right={<FileText className="h-5 w-5 text-white/75" aria-hidden="true" />}
    >
      {error ? (
        <div className="flex h-full items-center text-white/70">{error}</div>
      ) : (
        <div className="flex h-full flex-col justify-between">
          <div className="space-y-2 overflow-hidden">
            {entries.slice(0, displayLimit).map((entry) => (
              <div
                key={entry.id}
                className="rounded-xl bg-white/5 px-3 py-2 ring-1 ring-inset ring-white/10"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={[
                          "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset",
                          levelTone(entry.level),
                        ].join(" ")}
                      >
                        {entry.level ?? "Log"}
                      </span>
                      <span className="truncate text-xs text-white/60">{entry.origin}</span>
                    </div>
                    <div className="mt-1 truncate text-sm text-white/90">{entry.message}</div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-white/45">
                      {entry.source ? <span className="truncate">{entry.source}</span> : null}
                      {entry.facility ? (
                        <span className="truncate">{entry.source ? "•" : null} {entry.facility}</span>
                      ) : null}
                    </div>
                  </div>
                  <div className="text-xs text-white/55">
                    {formatLogTime(entry.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            {!hasEntries ? (
              <div className="rounded-xl bg-white/5 px-3 py-2 text-sm text-white/65 ring-1 ring-inset ring-white/10">
                Ingen graylog-meldinger funnet.
              </div>
            ) : null}
          </div>

          <div className="module-updated text-xs text-white/45">
            Oppdatert: {data?.lastUpdatedAt ? new Date(data.lastUpdatedAt).toLocaleTimeString("nb-NO") : "-"}
          </div>
        </div>
      )}
    </ModuleCard>
  );
}
