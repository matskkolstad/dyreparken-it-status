"use client";

import { Users } from "lucide-react";

import type { ZoinedGuests } from "@/lib/types";
import { DEFAULT_REFRESH_INTERVAL_MS } from "@/lib/dashboard-config";
import { useApiData } from "@/lib/hooks/use-api-data";
import { ModuleCard } from "@/components/ui/ModuleCard";

export function ZoinedModule(props: { refreshToken: number; dynamicMode?: boolean }) {
  const dynamicMode = props.dynamicMode ?? false;
  const { data, error, isLoading } = useApiData<ZoinedGuests>("/api/zoined/guests", {
    intervalMs: DEFAULT_REFRESH_INTERVAL_MS,
    refreshToken: props.refreshToken,
  });

  const severity = error ? "unknown" : "ok";
  const rowSpan = 1;
  const statusText = error ? "Feil" : data?.isDummyData ? "Dummy" : "Live";

  return (
    <ModuleCard
      moduleId="zoined"
      title="Zoined"
      severity={severity}
      statusText={statusText}
      pulseKey={data?.lastUpdatedAt}
      dynamicMode={dynamicMode}
      rowSpan={rowSpan}
      right={<Users className="h-5 w-5 text-white/75" aria-hidden="true" />}
    >
      {error ? (
        <div className="flex h-full items-center text-white/70">{error}</div>
      ) : (
        <div className="flex h-full flex-col justify-between">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/5 px-4 py-3 ring-1 ring-inset ring-white/10">
              <div className="text-xs text-white/65">Dyreparken</div>
              <div className="mt-1 text-4xl font-semibold text-white/95">
                {isLoading ? "…" : data?.dyreparkenGuests ?? "—"}
              </div>
            </div>
            <div className="rounded-2xl bg-white/5 px-4 py-3 ring-1 ring-inset ring-white/10">
              <div className="text-xs text-white/65">Badeland</div>
              <div className="mt-1 text-4xl font-semibold text-white/95">
                {isLoading ? "…" : data?.badelandGuests ?? "—"}
              </div>
            </div>
          </div>

          {dynamicMode ? (
            <div className="zoined-total mt-4 rounded-2xl bg-white/5 px-4 py-3 ring-1 ring-inset ring-white/10">
              <div className="text-xs text-white/65">Totalt gjester</div>
              <div className="mt-1 text-2xl font-semibold text-white/95">
                {(data?.dyreparkenGuests ?? 0) + (data?.badelandGuests ?? 0)}
              </div>
            </div>
          ) : null}

          <div className="zoined-updated text-xs text-white/45">
            Oppdatert: {data?.lastUpdatedAt ? new Date(data.lastUpdatedAt).toLocaleTimeString("nb-NO") : "—"}
          </div>
        </div>
      )}
    </ModuleCard>
  );
}
