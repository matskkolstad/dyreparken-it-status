"use client";

import { Newspaper } from "lucide-react";
import { useMemo, useRef } from "react";

import type { NewsFeed } from "@/lib/types";
import { DEFAULT_REFRESH_INTERVAL_MS } from "@/lib/dashboard-config";
import { useApiData } from "@/lib/hooks/use-api-data";
import { useAutoScroll } from "@/lib/hooks/use-auto-scroll";
import { useDynamicListLimit } from "@/lib/hooks/use-dynamic-list-limit";
import { ModuleCard } from "@/components/ui/ModuleCard";

function formatTime(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("nb-NO", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function NewsModule(props: { refreshToken: number; dynamicMode?: boolean }) {
  const dynamicMode = props.dynamicMode ?? false;
  const { data, error, isLoading } = useApiData<NewsFeed>("/api/news", {
    intervalMs: DEFAULT_REFRESH_INTERVAL_MS,
    refreshToken: props.refreshToken,
  });

  const items = useMemo(() => (data?.items ?? []).slice(0, 10), [data?.items]);
  const dynamicLimit = useDynamicListLimit(dynamicMode, 3, {
    min: 3,
    max: 10,
    rowHeight: 108,
    reservedHeight: 340,
    moduleId: "news",
    reservedCardHeight: 120,
  });

  const pageItems = useMemo(() => {
    if (dynamicMode) {
      return items.slice(0, dynamicLimit);
    }
    return items;
  }, [dynamicLimit, dynamicMode, items]);

  const severity = error ? "unknown" : "ok";
  const rowSpan = 1;
  const statusText = error ? "Feil" : data?.isDummyData ? "Dummy" : "Live";
  const staticScrollRef = useRef<HTMLDivElement>(null);

  useAutoScroll(staticScrollRef, !dynamicMode && items.length > 0, [data?.lastUpdatedAt, dynamicMode], 14);

  return (
    <ModuleCard
      moduleId="news"
      title="Nyheter"
      severity={severity}
      statusText={statusText}
      subtitle={isLoading ? "Henter..." : "Siste nytt"}
      pulseKey={data?.lastUpdatedAt}
      dynamicMode={dynamicMode}
      rowSpan={rowSpan}
      right={<Newspaper className="h-5 w-5 text-white/75" aria-hidden="true" />}
    >
      {error ? (
        <div className="flex h-full items-center text-white/70">{error}</div>
      ) : (
        <div
          ref={dynamicMode ? undefined : staticScrollRef}
          className={
            dynamicMode
              ? "flex h-full flex-col"
              : "dp-auto-scroll flex h-full min-h-0 flex-col overflow-y-auto pr-1"
          }
        >
          <div className="mt-2 pb-3">
            <div
              key={`news-page-${dynamicMode ? "dynamic" : "static"}`}
              className="space-y-3"
            >
              {pageItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl bg-white/5 px-4 py-3 ring-1 ring-inset ring-white/10"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs font-semibold uppercase tracking-wide text-white/50">
                      {item.source}
                    </div>
                    <div className="text-xs text-white/45">
                      {formatTime(item.publishedAt)}
                    </div>
                  </div>
                  <div className="mt-1 truncate text-sm font-semibold text-white/90">
                    {item.title}
                  </div>
                  <div className="mt-1 line-clamp-2 text-xs text-white/60">
                    {item.summary || "Ingen forhåndsvisning tilgjengelig."}
                  </div>
                </div>
              ))}
              {items.length ? null : (
                <div className="flex h-full items-center text-white/55">Ingen nyheter.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </ModuleCard>
  );
}
