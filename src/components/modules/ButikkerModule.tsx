"use client";

import { ShoppingBag } from "lucide-react";
import { useMemo, useRef } from "react";

import type { DailyProgrammeFeed } from "@/lib/types";
import { DEFAULT_REFRESH_INTERVAL_MS } from "@/lib/dashboard-config";
import { useApiData } from "@/lib/hooks/use-api-data";
import { useAutoScroll } from "@/lib/hooks/use-auto-scroll";
import { useDynamicListLimit } from "@/lib/hooks/use-dynamic-list-limit";
import { ModuleCard } from "@/components/ui/ModuleCard";

export function ButikkerModule(props: { refreshToken: number; dynamicMode?: boolean }) {
  const dynamicMode = props.dynamicMode ?? false;
  const { data, error } = useApiData<DailyProgrammeFeed>("/api/dagsprogram", {
    intervalMs: DEFAULT_REFRESH_INTERVAL_MS,
    refreshToken: props.refreshToken,
  });

  const items = useMemo(() => data?.butikker ?? [], [data?.butikker]);
  const dynamicLimit = useDynamicListLimit(dynamicMode, 5, {
    min: 4,
    max: 14,
    rowHeight: 58,
    reservedHeight: 320,
  });

  const pageItems = useMemo(() => {
    if (dynamicMode) {
      return items.slice(0, dynamicLimit);
    }
    return items;
  }, [dynamicLimit, dynamicMode, items]);

  const staticScrollRef = useRef<HTMLDivElement>(null);
  useAutoScroll(staticScrollRef, !dynamicMode && items.length > 0, [data?.lastUpdatedAt, dynamicMode], 16);

  const severity = error ? "unknown" : items.length > 0 ? "ok" : "degraded";
  const statusText = error ? "Feil" : data?.isDummyData ? "Dummy" : items.length ? "Live" : "Ingen åpne";

  return (
    <ModuleCard
      moduleId="butikker"
      title="Butikker"
      subtitle={data?.date ? `Dato: ${data.date}` : undefined}
      severity={severity}
      statusText={statusText}
      pulseKey={data?.lastUpdatedAt}
      dynamicMode={dynamicMode}
      right={<ShoppingBag className="h-5 w-5 text-white/75" aria-hidden="true" />}
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
              className="flex items-center justify-between gap-2 rounded-xl bg-white/5 px-3 py-2 ring-1 ring-inset ring-white/10"
            >
              <div className="truncate text-sm text-white/90">{item.name}</div>
              <div className="shrink-0 rounded-md bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-200 ring-1 ring-inset ring-emerald-400/30">
                {item.openingTime}
              </div>
            </div>
          ))}
          {items.length ? null : (
            <div className="rounded-xl bg-white/5 px-3 py-2 text-sm text-white/65 ring-1 ring-inset ring-white/10">
              Ingen åpne butikker funnet.
            </div>
          )}
        </div>
      )}
    </ModuleCard>
  );
}
