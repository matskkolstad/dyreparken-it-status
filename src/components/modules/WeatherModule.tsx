"use client";

import { Wind } from "lucide-react";

import type { WeatherCurrent } from "@/lib/types";
import { DEFAULT_REFRESH_INTERVAL_MS } from "@/lib/dashboard-config";
import { useApiData } from "@/lib/hooks/use-api-data";

import { ModuleCard } from "@/components/ui/ModuleCard";

function conditionEmoji(condition?: string) {
  if (!condition) return "🌡️";
  const c = condition.toLowerCase();
  if (c.includes("tordenvær") || c.includes("torden")) return "⛈️";
  if (c.includes("snø")) return "❄️";
  if (c.includes("regn")) return "🌧️";
  if (c.includes("yr")) return "🌦️";
  if (c.includes("tåke")) return "🌫️";
  if (c.includes("skyet") || c.includes("skyt")) return "⛅";
  if (c.includes("klarvær") || c.includes("sol")) return "☀️";
  return "🌤️";
}

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
      right={
        <span className="text-2xl" aria-hidden="true">
          {conditionEmoji(data?.condition)}
        </span>
      }
    >
      {error ? (
        <div className="flex h-full items-center text-white/70">{error}</div>
      ) : (
        <div className="flex h-full flex-col justify-between">
          <div>
            <div className="text-sm text-white/55">{data?.locationName ?? "—"}</div>
            <div className="mt-1 text-6xl font-bold tracking-tight text-white/95">
              {isLoading ? "…" : `${data?.temperatureC ?? "—"}°`}
            </div>
            <div className="mt-2 text-lg font-semibold text-white/80">
              {data?.condition ?? "—"}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3 ring-1 ring-inset ring-white/10">
            <div className="text-sm text-white/60">Vind</div>
            <div className="flex items-center gap-2 text-sm font-semibold text-white/90">
              <Wind className="h-4 w-4 text-white/60" aria-hidden="true" />
              {data ? `${data.windMs.toFixed(1)} m/s` : "—"}
            </div>
          </div>
        </div>
      )}
    </ModuleCard>
  );
}
