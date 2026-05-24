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
  const showLoading = isLoading && !data;

  const severity = severityFromMetrics(data, error);
  const rowSpan = severity === "degraded" ? 2 : 1;
  const statusText = error ? "Feil" : data?.isDummyData ? "Dummy" : "Live";
  const latestTasks = data?.latestTasks ?? [];

  return (
    <ModuleCard
      moduleId="asana"
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
        <div className="flex h-full min-h-0 flex-col">
          <div className="asana-stats grid grid-cols-3 gap-3">
            <div className="asana-stat rounded-2xl bg-white/5 px-4 py-3 ring-1 ring-inset ring-white/10">
              <div className="text-xs text-white/65">Aktive saker</div>
              <div className="asana-stat-value mt-1 text-3xl font-semibold text-white/95">
                {showLoading ? "…" : data?.activeCount ?? "—"}
              </div>
            </div>
            <div className="asana-stat rounded-2xl bg-white/5 px-4 py-3 ring-1 ring-inset ring-white/10">
              <div className="text-xs text-white/65">Nye i dag</div>
              <div className="asana-stat-value mt-1 text-3xl font-semibold text-white/95">
                {showLoading ? "…" : data?.newTodayCount ?? "—"}
              </div>
            </div>
            <div className="asana-stat rounded-2xl bg-white/5 px-4 py-3 ring-1 ring-inset ring-white/10">
              <div className="text-xs text-white/65">Lukket (7d)</div>
              <div className="asana-stat-value mt-1 text-3xl font-semibold text-white/95">
                {showLoading ? "…" : data?.closedLast7DaysCount ?? "—"}
              </div>
            </div>
          </div>

          <div className="asana-latest mt-3 flex min-h-0 flex-1 flex-col rounded-2xl bg-white/5 px-4 py-3 ring-1 ring-inset ring-white/10">
            <div className="asana-latest-title text-xs text-white/65">Nyeste saker (åpne)</div>
            {latestTasks.length === 0 ? (
              <div className="asana-latest-empty mt-1 text-xs text-white/70">Ingen nye saker.</div>
            ) : (
              <ul className="asana-latest-list mt-2 flex-1 space-y-2 overflow-y-auto pr-1 text-xs text-white/85">
                {latestTasks.map((task) => (
                  <li
                    key={task.id}
                    className="flex items-start justify-between gap-3 rounded-xl bg-white/5 px-3 py-2 ring-1 ring-inset ring-white/10"
                  >
                    <span className="line-clamp-2 leading-snug">{task.name}</span>
                    <span className="shrink-0 text-[11px] text-white/45">
                      {new Date(task.createdAt).toLocaleTimeString("nb-NO", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="asana-updated mt-2 text-xs text-white/45">
            Oppdatert: {data?.lastUpdatedAt ? new Date(data.lastUpdatedAt).toLocaleTimeString("nb-NO") : "—"}
          </div>
        </div>
      )}
    </ModuleCard>
  );
}
