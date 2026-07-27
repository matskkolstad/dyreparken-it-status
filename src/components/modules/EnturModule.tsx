"use client";

import { BusFront } from "lucide-react";
import { useMemo, useRef } from "react";

import type { EnturDepartures } from "@/lib/types";
import { DEFAULT_REFRESH_INTERVAL_MS } from "@/lib/dashboard-config";
import { useApiData } from "@/lib/hooks/use-api-data";
import { useAutoScroll } from "@/lib/hooks/use-auto-scroll";
import { useDynamicListLimit } from "@/lib/hooks/use-dynamic-list-limit";
import { ModuleCard } from "@/components/ui/ModuleCard";

function formatMinutes(minutes: number) {
  if (minutes <= 0) return "Nå";
  return `${minutes} min`;
}

function formatClockTime(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleTimeString("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function EnturModule(props: { refreshToken: number; dynamicMode?: boolean }) {
  const dynamicMode = props.dynamicMode ?? false;
  const { data, error } = useApiData<EnturDepartures>("/api/entur/departures", {
    intervalMs: DEFAULT_REFRESH_INTERVAL_MS,
    refreshToken: props.refreshToken,
  });

  const departures = useMemo(() => data?.departures ?? [], [data?.departures]);
  const dynamicLimit = useDynamicListLimit(dynamicMode, 3, {
    min: 4,
    max: 14,
    rowHeight: 60,
    reservedHeight: 360,
    moduleId: "entur",
    reservedCardHeight: 140,
  });
  const staticScrollRef = useRef<HTMLDivElement>(null);

  const pageDepartures = useMemo(() => {
    if (dynamicMode) {
      return departures.slice(0, dynamicLimit);
    }
    return departures;
  }, [departures, dynamicLimit, dynamicMode]);

  useAutoScroll(staticScrollRef, !dynamicMode && departures.length > 2, [data?.lastUpdatedAt, dynamicMode], 16);

  const hasDepartures = departures.length > 0;
  const severity = error ? "unknown" : hasDepartures ? "ok" : "degraded";
  const rowSpan = severity === "degraded" ? 2 : 1;
  const statusText = error
    ? "Feil"
    : data?.isDummyData
      ? "Dummy"
      : hasDepartures
        ? "Live"
        : "Ingen avganger";

  return (
    <ModuleCard
       moduleId="entur"
      title="Kollektiv"
      subtitle={data?.stopName ? `Stopp: ${data.stopName}` : undefined}
      severity={severity}
      statusText={statusText}
      pulseKey={data?.lastUpdatedAt}
      dynamicMode={dynamicMode}
      rowSpan={rowSpan}
      right={<BusFront className="h-5 w-5 text-white/75" aria-hidden="true" />}
    >
      {error ? (
        <div className="flex h-full items-center text-white/70">{error}</div>
      ) : (
        <div className="flex h-full flex-col justify-between">
          <div
            ref={dynamicMode ? undefined : staticScrollRef}
            key={`entur-list-${dynamicMode ? "dynamic" : "static"}`}
            className={dynamicMode ? "space-y-1.5 overflow-hidden" : "dp-auto-scroll space-y-1.5 overflow-y-auto pr-1"}
          >
            {pageDepartures.map((departure) => {
              const isDelayed = (departure.delayMinutes ?? 0) > 0;
              const aimedTime = formatClockTime(departure.aimedDepartureTime);
              const expectedTime = formatClockTime(departure.departureTime);

              return (
                <div
                  key={departure.id}
                  className="flex items-center justify-between gap-3 rounded-lg bg-white/5 px-2.5 py-1.5 ring-1 ring-inset ring-white/10"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex shrink-0 rounded-md bg-[color:rgba(15,184,137,0.2)] px-1.5 py-0.5 text-[11px] font-semibold text-[color:rgba(170,255,230,0.95)] ring-1 ring-inset ring-[color:rgba(15,184,137,0.35)]">
                        {departure.line}
                      </span>
                      <span className="truncate text-xs text-white/90">{departure.destination}</span>
                    </div>
                    <div className="truncate text-[11px] text-white/55">
                      {departure.stopName}
                      {departure.platform ? ` · Plattform ${departure.platform}` : ""}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-white/95">
                      {formatMinutes(departure.minutesUntilDeparture)}
                    </div>
                    <div className="text-xs">
                      {isDelayed ? (
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-white/45 line-through">{aimedTime}</span>
                          <span className="text-red-300">{expectedTime}</span>
                        </div>
                      ) : (
                        <span className="text-emerald-300">{expectedTime}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {!hasDepartures ? (
              <div className="rounded-xl bg-white/5 px-3 py-2 text-sm text-white/65 ring-1 ring-inset ring-white/10">
                Ingen kommende bussavganger funnet.
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
