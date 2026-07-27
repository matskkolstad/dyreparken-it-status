"use client";

import { Smartphone } from "lucide-react";
import { useRef } from "react";

import type { EsperDevices } from "@/lib/types";
import { DEFAULT_REFRESH_INTERVAL_MS } from "@/lib/dashboard-config";
import { useApiData } from "@/lib/hooks/use-api-data";
import { useAutoScroll } from "@/lib/hooks/use-auto-scroll";
import { useDynamicListLimit } from "@/lib/hooks/use-dynamic-list-limit";
import { ModuleCard } from "@/components/ui/ModuleCard";

function severityFromCounts(offline?: number, error?: string) {
  if (error) return "unknown";
  if (offline === undefined) return "unknown";
  if (offline >= 5) return "down";
  if (offline >= 1) return "degraded";
  return "ok";
}

function formatLastSeen(value?: string) {
  if (!value) return "Ukjent";
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) return "Ukjent";
  return new Date(parsed).toLocaleString("nb-NO", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function EsperModule(props: { refreshToken: number; dynamicMode?: boolean }) {
  const dynamicMode = props.dynamicMode ?? false;
  const { data, error, isLoading } = useApiData<EsperDevices>("/api/esper/devices", {
    intervalMs: DEFAULT_REFRESH_INTERVAL_MS,
    refreshToken: props.refreshToken,
  });
  const offlineLimit = useDynamicListLimit(dynamicMode, 0, {
    min: 3,
    max: 12,
    rowHeight: 28,
    reservedHeight: 400,
    moduleId: "esper",
    reservedCardHeight: 230,
  });

  const severity = severityFromCounts(data?.offlineCount, error);
  const rowSpan = severity === "down" || severity === "degraded" ? 2 : 1;
  const statusText = error ? "Feil" : data?.isDummyData ? "Dummy" : "Live";
  const staticScrollRef = useRef<HTMLDivElement>(null);

  useAutoScroll(staticScrollRef, !dynamicMode, [data?.lastUpdatedAt, dynamicMode], 14);

  return (
    <ModuleCard
      moduleId="esper"
      title="Esper"
      severity={severity}
      statusText={statusText}
      pulseKey={data?.lastUpdatedAt}
      dynamicMode={dynamicMode}
      rowSpan={rowSpan}
      right={<Smartphone className="h-5 w-5 text-white/75" aria-hidden="true" />}
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
              <div className="text-xs text-white/65">Online</div>
              <div className="mt-1 text-4xl font-semibold text-white/95">
                {isLoading ? "…" : data?.onlineCount ?? "—"}
              </div>
            </div>
            <div className="rounded-2xl bg-white/5 px-4 py-3 ring-1 ring-inset ring-white/10">
              <div className="text-xs text-white/65">Offline</div>
              <div className="mt-1 text-4xl font-semibold text-white/95">
                {isLoading ? "…" : data?.offlineCount ?? "—"}
              </div>
            </div>
          </div>

          {(dynamicMode || (data?.offline?.length ?? 0) > 0) ? (
            <div className="rounded-2xl bg-white/5 ring-1 ring-inset ring-white/10">
              <div className="px-4 py-2 text-xs font-semibold text-white/60">Offline enheter</div>
              <div className="px-4 pb-3">
                {(data?.offline ?? []).slice(0, dynamicMode ? offlineLimit : Math.max(data?.offline?.length ?? 0, 20)).map((device) => (
                  <div key={device.name} className="flex items-center justify-between py-1 text-sm text-white/85">
                    <span className="truncate">{device.name}</span>
                    <span className="ml-3 shrink-0 text-xs text-white/55">
                      {formatLastSeen(device.lastSeenAt)}
                    </span>
                  </div>
                ))}
                {(data?.offline?.length ?? 0) > 0 ? null : (
                  <div className="py-1 text-sm text-white/55">Ingen offline enheter.</div>
                )}
              </div>
            </div>
          ) : null}

          <div className="module-updated text-xs text-white/45">
            Oppdatert: {data?.lastUpdatedAt ? new Date(data.lastUpdatedAt).toLocaleTimeString("nb-NO") : "—"}
          </div>
        </div>
      )}
    </ModuleCard>
  );
}
