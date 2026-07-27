"use client";

import { Network } from "lucide-react";
import { useRef } from "react";

import type { LibreNmsSwitches } from "@/lib/types";
import { DEFAULT_REFRESH_INTERVAL_MS } from "@/lib/dashboard-config";
import { useApiData } from "@/lib/hooks/use-api-data";
import { useAutoScroll } from "@/lib/hooks/use-auto-scroll";
import { useDynamicListLimit } from "@/lib/hooks/use-dynamic-list-limit";
import { ModuleCard } from "@/components/ui/ModuleCard";

function severityFromLibre(m?: LibreNmsSwitches, error?: string) {
  if (error) return "unknown";
  if (!m) return "unknown";
  if (m.offlineCount >= 3 || (m.alerts?.length ?? 0) >= 3) return "down";
  if (m.offlineCount >= 1 || (m.alerts?.length ?? 0) >= 1) return "degraded";
  return "ok";
}

function formatAlertTime(timestamp?: string) {
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

export function LibreNmsModule(props: { refreshToken: number; dynamicMode?: boolean }) {
  const dynamicMode = props.dynamicMode ?? false;
  const { data, error, isLoading } = useApiData<LibreNmsSwitches>("/api/librenms/switches", {
    intervalMs: DEFAULT_REFRESH_INTERVAL_MS,
    refreshToken: props.refreshToken,
  });
  const offlineLimit = useDynamicListLimit(dynamicMode, 4, {
    min: 4,
    max: 10,
    rowHeight: 28,
    reservedHeight: 390,
    moduleId: "librenms",
    reservedCardHeight: 240,
    heightShare: 0.34,
  });
  const alertLimit = useDynamicListLimit(dynamicMode, 5, {
    min: 5,
    max: 5,
    rowHeight: 46,
    reservedHeight: 390,
    moduleId: "librenms",
    reservedCardHeight: 240,
    heightShare: 0.33,
  });
  const historyLimit = useDynamicListLimit(dynamicMode, 5, {
    min: 5,
    max: 5,
    rowHeight: 46,
    reservedHeight: 390,
    moduleId: "librenms",
    reservedCardHeight: 240,
    heightShare: 0.33,
  });

  const severity = severityFromLibre(data, error);
  const rowSpan = severity === "down" || severity === "degraded" ? 2 : 1;
  const statusText = error ? "Feil" : data?.isDummyData ? "Dummy" : "Live";
  const staticScrollRef = useRef<HTMLDivElement>(null);

  useAutoScroll(staticScrollRef, !dynamicMode, [data?.lastUpdatedAt, dynamicMode], 16);

  return (
    <ModuleCard
      moduleId="librenms"
      title="LibreNMS"
      severity={severity}
      statusText={statusText}
      pulseKey={data?.lastUpdatedAt}
      dynamicMode={dynamicMode}
      rowSpan={rowSpan}
      right={<Network className="h-5 w-5 text-white/75" aria-hidden="true" />}
    >
      {error ? (
        <div className="flex h-full items-center text-white/70">{error}</div>
      ) : (
        <div
          ref={dynamicMode ? undefined : staticScrollRef}
          className={
            dynamicMode
              ? "flex h-full flex-col gap-3 justify-between"
              : "dp-auto-scroll flex h-full min-h-0 flex-col gap-3 overflow-y-auto pr-1"
          }
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/5 px-4 py-3 ring-1 ring-inset ring-white/10">
              <div className="text-xs text-white/65">Online switcher</div>
              <div className="mt-1 text-3xl font-semibold text-white/95">
                {isLoading ? "…" : data?.onlineCount ?? "—"}
              </div>
            </div>
            <div className="rounded-2xl bg-white/5 px-4 py-3 ring-1 ring-inset ring-white/10">
              <div className="text-xs text-white/65">Offline switcher</div>
              <div className="mt-1 text-3xl font-semibold text-white/95">
                {isLoading ? "…" : data?.offlineCount ?? "—"}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-hidden rounded-2xl bg-white/5 ring-1 ring-inset ring-white/10">
            <div className="px-4 py-2 text-xs font-semibold text-white/60">Offline</div>
            <div className="px-4 pb-3">
              {(data?.offline ?? []).slice(0, offlineLimit).map((sw) => (
                <div key={sw.name} className="py-1 text-sm text-white/85">
                  <span className="truncate">{sw.name}</span>
                </div>
              ))}
              {data?.offline?.length ? null : (
                <div className="py-2 text-sm text-white/55">Ingen.</div>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-white/5 ring-1 ring-inset ring-white/10">
            <div className="px-4 py-2 text-xs font-semibold text-white/60">Advarsler</div>
            <div className="px-4 pb-3">
              {(data?.alerts ?? []).slice(0, dynamicMode ? alertLimit : 5).map((alert) => (
                <div key={alert.id} className="flex items-start justify-between gap-3 py-1 text-sm text-white/85">
                  <div className="min-w-0">
                    <div className="truncate">{alert.device}</div>
                    <div className="truncate text-xs text-white/55">{alert.message}</div>
                  </div>
                  <span className="ml-3 shrink-0 text-xs text-white/55">
                    {formatAlertTime(alert.timestamp)}
                  </span>
                </div>
              ))}
              {data?.alerts?.length ? null : (
                <div className="py-2 text-sm text-white/55">Ingen.</div>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-white/5 ring-1 ring-inset ring-white/10">
            <div className="px-4 py-2 text-xs font-semibold text-white/60">Alert History</div>
            <div className="px-4 pb-3">
              {(data?.alertHistory ?? []).slice(0, dynamicMode ? historyLimit : 5).map((alert) => (
                <div key={alert.id} className="flex items-start justify-between gap-3 py-1 text-sm text-white/85">
                  <div className="min-w-0">
                    <div className="truncate">{alert.device}</div>
                    <div className="truncate text-xs text-white/55">{alert.message}</div>
                  </div>
                  <span className="ml-3 shrink-0 text-xs text-white/55">
                    {formatAlertTime(alert.timestamp)}
                  </span>
                </div>
              ))}
              {data?.alertHistory?.length ? null : (
                <div className="py-2 text-sm text-white/55">Ingen.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </ModuleCard>
  );
}
