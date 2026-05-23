"use client";

import { Smartphone } from "lucide-react";

import type { EsperDevices } from "@/lib/types";
import { DEFAULT_REFRESH_INTERVAL_MS } from "@/lib/dashboard-config";
import { useApiData } from "@/lib/hooks/use-api-data";
import { ModuleCard } from "@/components/ui/ModuleCard";

function severityFromCounts(offline?: number, error?: string) {
  if (error) return "unknown";
  if (offline === undefined) return "unknown";
  if (offline >= 5) return "down";
  if (offline >= 1) return "degraded";
  return "ok";
}

export function EsperModule(props: { refreshToken: number }) {
  const { data, error, isLoading } = useApiData<EsperDevices>("/api/esper/devices", {
    intervalMs: DEFAULT_REFRESH_INTERVAL_MS,
    refreshToken: props.refreshToken,
  });

  const severity = severityFromCounts(data?.offlineCount, error);
  const statusText = error ? "Feil" : data?.isDummyData ? "Dummy" : "Live";

  return (
    <ModuleCard
      title="Esper"
      severity={severity}
      statusText={statusText}
      right={<Smartphone className="h-5 w-5 text-white/75" aria-hidden="true" />}
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

          <div className="text-xs text-white/45">
            Oppdatert: {data?.lastUpdatedAt ? new Date(data.lastUpdatedAt).toLocaleTimeString("nb-NO") : "—"}
          </div>
        </div>
      )}
    </ModuleCard>
  );
}
