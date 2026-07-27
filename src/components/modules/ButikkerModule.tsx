"use client";

import { ShoppingBag } from "lucide-react";
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

export function ButikkerModule(props: { refreshToken: number; dynamicMode?: boolean }) {
  const dynamicMode = props.dynamicMode ?? false;
  const { data, error } = useApiData<DailyProgrammeFeed>("/api/dagsprogram", {
    intervalMs: DEFAULT_REFRESH_INTERVAL_MS,
    refreshToken: props.refreshToken,
  });

  const items = useMemo(() => data?.butikker ?? [], [data?.butikker]);
  const dynamicLimit = useDynamicListLimit(dynamicMode, 20, {
    min: 20,
    max: 32,
    rowHeight: 66,
    reservedHeight: 300,
    moduleId: "butikker",
    reservedCardHeight: 120,
    itemsPerRow: 4,
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
      subtitle={data?.date ? `Dato: ${formatDisplayDate(data.date)}` : undefined}
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
              ? "overflow-hidden"
              : "dp-auto-scroll h-full min-h-0 overflow-y-auto pr-1"
          }
        >
          <div className="grid grid-cols-4 gap-1.5">
            {pageItems.map((item) => (
              <div
                key={item.id}
                className="min-h-[60px] rounded-lg bg-white/5 px-2 py-1.5 ring-1 ring-inset ring-white/10"
              >
                <div className="line-clamp-2 text-xs leading-snug text-white/90">{item.name}</div>
                <div className="mt-1 inline-flex rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-200 ring-1 ring-inset ring-emerald-400/30">
                  {item.openingTime}
                </div>
              </div>
            ))}
          </div>
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
