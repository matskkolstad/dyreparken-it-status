"use client";

import { BusFront } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type { EnturDepartures } from "@/lib/types";
import { DEFAULT_REFRESH_INTERVAL_MS } from "@/lib/dashboard-config";
import { useApiData } from "@/lib/hooks/use-api-data";
import { useDynamicListLimit } from "@/lib/hooks/use-dynamic-list-limit";
import { ModuleCard } from "@/components/ui/ModuleCard";

function formatMinutes(minutes: number) {
  if (minutes <= 0) return "Nå";
  return `${minutes} min`;
}

function formatRealtimeStatus(delayMinutes: number | undefined, isRealtime: boolean) {
  if (!isRealtime) return "Plan";
  if ((delayMinutes ?? 0) <= 0) return "I rute";
  return `+${delayMinutes} min`;
}

export function EnturModule(props: { refreshToken: number; dynamicMode?: boolean }) {
  const dynamicMode = props.dynamicMode ?? false;
  const { data, error } = useApiData<EnturDepartures>("/api/entur/departures", {
    intervalMs: DEFAULT_REFRESH_INTERVAL_MS,
    refreshToken: props.refreshToken,
  });

  const departures = useMemo(() => data?.departures ?? [], [data?.departures]);
  const dynamicLimit = useDynamicListLimit(dynamicMode, 2, {
    min: 3,
    max: 10,
    rowHeight: 74,
    reservedHeight: 360,
  });
  const staticLimit = 2;
  const pageCount = Math.max(1, Math.ceil(departures.length / staticLimit));
  const [pageIndex, setPageIndex] = useState(0);

  const pageDepartures = useMemo(() => {
    if (dynamicMode) {
      return departures.slice(0, dynamicLimit);
    }
    const start = pageIndex * staticLimit;
    return departures.slice(start, start + staticLimit);
  }, [departures, dynamicLimit, dynamicMode, pageIndex]);

  useEffect(() => {
    setPageIndex(0);
  }, [data?.lastUpdatedAt]);

  useEffect(() => {
    if (dynamicMode) return;
    if (pageCount <= 1) return;
    const timer = window.setInterval(() => {
      setPageIndex((idx) => (idx + 1) % pageCount);
    }, 8000);
    return () => window.clearInterval(timer);
  }, [dynamicMode, pageCount]);

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
          <div key={`entur-page-${dynamicMode ? "dynamic" : pageIndex}`} className="space-y-2 overflow-hidden">
            {pageDepartures.map((departure) => (
              <div
                key={departure.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-3 py-2 ring-1 ring-inset ring-white/10"
              >
                <div className="min-w-0">
                  <div className="inline-flex rounded-md bg-[color:rgba(15,184,137,0.2)] px-2 py-0.5 text-xs font-semibold text-[color:rgba(170,255,230,0.95)] ring-1 ring-inset ring-[color:rgba(15,184,137,0.35)]">
                    Linje {departure.line}
                  </div>
                  <div className="mt-1 truncate text-sm text-white/90">{departure.destination}</div>
                  <div className="truncate text-xs text-white/55">{departure.stopName}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-white/95">
                    {formatMinutes(departure.minutesUntilDeparture)}
                  </div>
                  <div className="text-xs text-white/50">
                    {formatRealtimeStatus(departure.delayMinutes, departure.isRealtime)}
                  </div>
                </div>
              </div>
            ))}
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
