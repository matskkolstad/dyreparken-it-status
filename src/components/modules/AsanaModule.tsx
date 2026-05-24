"use client";

import { ListTodo } from "lucide-react";

import type { AsanaMetrics } from "@/lib/types";
import { DEFAULT_REFRESH_INTERVAL_MS } from "@/lib/dashboard-config";
import { useApiData } from "@/lib/hooks/use-api-data";
import { ModuleCard } from "@/components/ui/ModuleCard";

function severityFromMetrics(m?: AsanaMetrics, error?: string) {
  if (error) return "unknown";
  if (!m) return "unknown";
  if (m.activeCount >= 30) return "degraded";
  return "ok";
}

export function AsanaModule(props: { refreshToken: number; dynamicMode?: boolean }) {
  const dynamicMode = props.dynamicMode ?? false;
  const { data, error, isLoading } = useApiData<AsanaMetrics>("/api/asana/metrics", {
    intervalMs: DEFAULT_REFRESH_INTERVAL_MS,
    refreshToken: props.refreshToken,
  });

  const severity = severityFromMetrics(data, error);
  const rowSpan = severity === "degraded" ? 2 : 1;
  const statusText = error ? "Feil" : data?.isDummyData ? "Dummy" : "Live";

  return (
    <ModuleCard
      title="Asana"
      severity={severity}
      statusText={statusText}
      pulseKey={data?.lastUpdatedAt}
      dynamicMode={dynamicMode}
      rowSpan={rowSpan}
      right={<ListTodo className="h-5 w-5 text-white/75" aria-hidden="true" />}
    >
      {error ? (
        <div className="flex h-full items-center text-white/70">{error}</div>
      ) : (
        <div className="flex h-full flex-col justify-between">
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-white/5 px-4 py-3 ring-1 ring-inset ring-white/10">
              <div className="text-xs text-white/65">Aktive saker</div>
              <div className="mt-1 text-3xl font-semibold text-white/95">
                {isLoading ? "…" : data?.activeCount ?? "—"}
              </div>
            </div>
            <div className="rounded-2xl bg-white/5 px-4 py-3 ring-1 ring-inset ring-white/10">
              <div className="text-xs text-white/65">Nye i dag</div>
              <div className="mt-1 text-3xl font-semibold text-white/95">
                {isLoading ? "…" : data?.newTodayCount ?? "—"}
              </div>
            </div>
            <div className="rounded-2xl bg-white/5 px-4 py-3 ring-1 ring-inset ring-white/10">
              <div className="text-xs text-white/65">Lukket (7d)</div>
              <div className="mt-1 text-3xl font-semibold text-white/95">
                {isLoading ? "…" : data?.closedLast7DaysCount ?? "—"}
              </div>
            </div>
          </div>

          {dynamicMode ? (
            <div className="mt-4 rounded-2xl bg-white/5 px-4 py-3 ring-1 ring-inset ring-white/10">
              <div className="text-xs text-white/65">Arbeidstrykk</div>
              <div className="mt-1 text-sm text-white/85">
                {(data?.activeCount ?? 0) > 25
                  ? "Hoy belastning"
                  : (data?.activeCount ?? 0) > 12
                    ? "Normal belastning"
                    : "Lav belastning"}
              </div>
            </div>
          ) : null}

          <div className="text-xs text-white/45">
            Oppdatert: {data?.lastUpdatedAt ? new Date(data.lastUpdatedAt).toLocaleTimeString("nb-NO") : "—"}
          </div>
        </div>
      )}
    </ModuleCard>
  );
}
