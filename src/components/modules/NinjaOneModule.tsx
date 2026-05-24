"use client";

import { Laptop } from "lucide-react";

import type { NinjaOneAgents } from "@/lib/types";
import { DEFAULT_REFRESH_INTERVAL_MS } from "@/lib/dashboard-config";
import { useApiData } from "@/lib/hooks/use-api-data";
import { useDynamicListLimit } from "@/lib/hooks/use-dynamic-list-limit";
import { ModuleCard } from "@/components/ui/ModuleCard";

function severityFromCounts(offline?: number, error?: string) {
  if (error) return "unknown";
  if (offline === undefined) return "unknown";
  if (offline >= 15) return "down";
  if (offline >= 5) return "degraded";
  return "ok";
}

export function NinjaOneModule(props: { refreshToken: number; dynamicMode?: boolean }) {
  const dynamicMode = props.dynamicMode ?? false;
  const { data, error, isLoading } = useApiData<NinjaOneAgents>("/api/ninjaone/agents", {
    intervalMs: DEFAULT_REFRESH_INTERVAL_MS,
    refreshToken: props.refreshToken,
  });
  const offlineLimit = useDynamicListLimit(dynamicMode, 0, {
    min: 3,
    max: 12,
    rowHeight: 28,
    reservedHeight: 400,
  });

  const severity = severityFromCounts(data?.offlineCount, error);
  const rowSpan = severity === "down" || severity === "degraded" ? 2 : 1;
  const statusText = error ? "Feil" : data?.isDummyData ? "Dummy" : "Live";

  return (
    <ModuleCard
      moduleId="ninjaone"
      title="NinjaOne"
      severity={severity}
      statusText={statusText}
      pulseKey={data?.lastUpdatedAt}
      dynamicMode={dynamicMode}
      rowSpan={rowSpan}
      right={<Laptop className="h-5 w-5 text-white/75" aria-hidden="true" />}
    >
      {error ? (
        <div className="flex h-full items-center text-white/70">{error}</div>
      ) : (
        <div className="flex h-full flex-col justify-between">
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

          {dynamicMode ? (
            <div className="mt-4 rounded-2xl bg-white/5 ring-1 ring-inset ring-white/10">
              <div className="px-4 py-2 text-xs font-semibold text-white/60">Offline agenter</div>
              <div className="px-4 pb-3">
                {(data?.offline ?? []).slice(0, offlineLimit).map((agent) => (
                  <div key={agent.name} className="flex items-center justify-between py-1 text-sm text-white/85">
                    <span className="truncate">{agent.name}</span>
                    <span className="ml-3 shrink-0 text-xs text-white/55">{agent.status ?? "offline"}</span>
                  </div>
                ))}
                {(data?.offline?.length ?? 0) > 0 ? null : (
                  <div className="py-1 text-sm text-white/55">Ingen offline agenter.</div>
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
