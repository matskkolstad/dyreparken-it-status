"use client";

import { CloudSun, Wind } from "lucide-react";

import type { WeatherCurrent } from "@/lib/types";
import { DEFAULT_REFRESH_INTERVAL_MS } from "@/lib/dashboard-config";
import { useApiData } from "@/lib/hooks/use-api-data";

import { ModuleCard } from "@/components/ui/ModuleCard";

export function WeatherModule(props: { refreshToken: number }) {
  const { data, error, isLoading } = useApiData<WeatherCurrent>("/api/weather/current", {
    intervalMs: DEFAULT_REFRESH_INTERVAL_MS,
    refreshToken: props.refreshToken,
  });

  const severity = error ? "unknown" : "ok";
  const statusText = error ? "Feil" : data?.isDummyData ? "Dummy" : "Live";

  return (
    <ModuleCard
      title="Vær"
      severity={severity}
      statusText={statusText}
      right={<CloudSun className="h-5 w-5 text-white/75" aria-hidden="true" />}
    >
      {error ? (
        <div className="flex h-full items-center text-white/70">{error}</div>
      ) : (
        <div className="flex h-full flex-col justify-between">
          <div>
            <div className="text-sm text-white/65">{data?.locationName ?? "—"}</div>
            <div className="mt-1 text-5xl font-semibold tracking-tight text-white/95">
              {isLoading ? "…" : `${data?.temperatureC ?? "—"}°`}
            </div>
            <div className="mt-2 text-lg font-semibold text-white/85">
              {data?.condition ?? "—"}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3 ring-1 ring-inset ring-white/10">
            <div className="text-sm text-white/70">Vind</div>
            <div className="flex items-center gap-2 text-sm font-semibold text-white/90">
              <Wind className="h-4 w-4 text-white/75" aria-hidden="true" />
              {data ? `${data.windMs.toFixed(1)} m/s` : "—"}
            </div>
          </div>
        </div>
      )}
    </ModuleCard>
  );
}
