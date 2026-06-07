"use client";

import { PawPrint } from "lucide-react";
import { useMemo, useRef } from "react";

import type { DailyProgrammeFeed } from "@/lib/types";
import { DEFAULT_REFRESH_INTERVAL_MS } from "@/lib/dashboard-config";
import { useApiData } from "@/lib/hooks/use-api-data";
import { useAutoScroll } from "@/lib/hooks/use-auto-scroll";
import { useDynamicListLimit } from "@/lib/hooks/use-dynamic-list-limit";
import { ModuleCard } from "@/components/ui/ModuleCard";

function formatDisplayDate(value?: string) {
  if (!value) return "-";
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day}-${month}-${year}`;
}

export function DyrepresentasjonerModule(props: { refreshToken: number; dynamicMode?: boolean }) {
  const dynamicMode = props.dynamicMode ?? false;
  const { data, error } = useApiData<DailyProgrammeFeed>("/api/dagsprogram", {
    intervalMs: DEFAULT_REFRESH_INTERVAL_MS,
    refreshToken: props.refreshToken,
  });

  const items = useMemo(() => data?.dyrepresentasjoner ?? [], [data?.dyrepresentasjoner]);
  const dynamicLimit = useDynamicListLimit(dynamicMode, 3, {
    min: 3,
    max: 9,
    rowHeight: 88,
    reservedHeight: 350,
  });

  const pageItems = useMemo(() => {
    if (dynamicMode) {
      return items.slice(0, dynamicLimit);
    }
    return items;
  }, [dynamicLimit, dynamicMode, items]);

  const staticScrollRef = useRef<HTMLDivElement>(null);
  useAutoScroll(staticScrollRef, !dynamicMode && items.length > 0, [data?.lastUpdatedAt, dynamicMode], 14);

  const hasActivePresentations = useMemo(
    () => items.some((item) => item.times.some((time) => !time.cancelled)),
    [items],
  );

  const severity = error ? "unknown" : hasActivePresentations ? "ok" : items.length > 0 ? "degraded" : "degraded";
  const statusText = error
    ? "Feil"
    : data?.isDummyData
      ? "Dummy"
      : hasActivePresentations
        ? "Live"
        : items.length > 0
          ? "Avlyst"
          : "Ingen funn";

  return (
    <ModuleCard
      moduleId="dyrepresentasjoner"
      title="Dyrepresentasjoner"
      subtitle={data?.date ? `Dato: ${formatDisplayDate(data.date)}` : undefined}
      severity={severity}
      statusText={statusText}
      pulseKey={data?.lastUpdatedAt}
      dynamicMode={dynamicMode}
      right={<PawPrint className="h-5 w-5 text-white/75" aria-hidden="true" />}
    >
      {error ? (
        <div className="flex h-full items-center text-white/70">{error}</div>
      ) : (
        <div
          ref={dynamicMode ? undefined : staticScrollRef}
          className={
            dynamicMode
              ? "space-y-2 overflow-hidden"
              : "dp-auto-scroll space-y-2 overflow-y-auto pr-1"
          }
        >
          {pageItems.map((item) => (
            <div
              key={item.id}
              className="rounded-xl bg-white/5 px-3 py-2 ring-1 ring-inset ring-white/10"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="truncate text-sm font-semibold text-white/95">{item.name}</div>
                {item.hasCancelledTimes ? (
                  <span className="shrink-0 text-xs font-semibold text-red-300">Avlyst</span>
                ) : null}
              </div>
              <div className="truncate text-xs text-white/55">{item.location}</div>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {item.times.map((time) => (
                  <span
                    key={`${item.id}-${time.label}`}
                    className={
                      time.cancelled
                        ? "rounded-md bg-red-500/20 px-2 py-0.5 text-xs text-red-200 line-through ring-1 ring-inset ring-red-400/30"
                        : "rounded-md bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-200 ring-1 ring-inset ring-emerald-400/30"
                    }
                  >
                    {time.label}
                  </span>
                ))}
              </div>
            </div>
          ))}
          {items.length ? null : (
            <div className="rounded-xl bg-white/5 px-3 py-2 text-sm text-white/65 ring-1 ring-inset ring-white/10">
              Ingen dyrepresentasjoner funnet for valgt dato.
            </div>
          )}
        </div>
      )}
    </ModuleCard>
  );
}
