"use client";

import { Newspaper } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type { MonotreeFeed } from "@/lib/types";
import { DEFAULT_REFRESH_INTERVAL_MS } from "@/lib/dashboard-config";
import { useApiData } from "@/lib/hooks/use-api-data";
import { useDynamicListLimit } from "@/lib/hooks/use-dynamic-list-limit";
import { ModuleCard } from "@/components/ui/ModuleCard";

export function MonotreeModule(props: { refreshToken: number; dynamicMode?: boolean }) {
  const dynamicMode = props.dynamicMode ?? false;
  const { data, error, isLoading } = useApiData<MonotreeFeed>("/api/monotree/posts", {
    intervalMs: DEFAULT_REFRESH_INTERVAL_MS,
    refreshToken: props.refreshToken,
  });

  const posts = useMemo(() => (data?.posts ?? []).slice(0, 10), [data?.posts]);
  const dynamicLimit = useDynamicListLimit(dynamicMode, 2, {
    min: 3,
    max: 10,
    rowHeight: 96,
    reservedHeight: 340,
  });
  const staticLimit = 2;
  const pageCount = Math.max(1, Math.ceil(posts.length / staticLimit));

  const [pageIndex, setPageIndex] = useState(0);
  const pagePosts = useMemo(() => {
    if (dynamicMode) {
      return posts.slice(0, dynamicLimit);
    }
    const start = pageIndex * staticLimit;
    return posts.slice(start, start + staticLimit);
  }, [dynamicLimit, dynamicMode, pageIndex, posts]);

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

  const severity = error ? "unknown" : "ok";
  const rowSpan = 1;
  const statusText = error ? "Feil" : data?.isDummyData ? "Dummy" : "Live";

  return (
    <ModuleCard
      title="Monotree"
      severity={severity}
      statusText={statusText}
      subtitle={isLoading ? "Henter..." : "Siste innlegg"}
      pulseKey={data?.lastUpdatedAt}
      dynamicMode={dynamicMode}
      rowSpan={rowSpan}
      right={<Newspaper className="h-5 w-5 text-white/75" aria-hidden="true" />}
    >
      {error ? (
        <div className="flex h-full items-center text-white/70">{error}</div>
      ) : (
        <div className="flex h-full flex-col">
          <div className="mt-2 pb-3">
            <div
              key={`monotree-page-${dynamicMode ? "dynamic" : pageIndex}`}
              className="space-y-3 animate-monotree-scroll"
            >
              {pagePosts.map((post) => (
                <div
                  key={post.id}
                  data-monotree-item
                  className="rounded-2xl bg-white/5 px-4 py-3 ring-1 ring-inset ring-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]"
                >
                  <div className="truncate text-sm font-semibold text-white/90">{post.title}</div>
                  <div className="mt-1 text-xs text-white/55">
                    {new Date(post.publishedAt).toLocaleString("nb-NO", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              ))}
              {posts.length ? null : (
                <div className="flex h-full items-center text-white/55">Ingen innlegg.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </ModuleCard>
  );
}
