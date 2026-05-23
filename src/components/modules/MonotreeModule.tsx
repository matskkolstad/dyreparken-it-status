"use client";

import { Newspaper } from "lucide-react";

import type { MonotreeFeed } from "@/lib/types";
import { DEFAULT_REFRESH_INTERVAL_MS } from "@/lib/dashboard-config";
import { useApiData } from "@/lib/hooks/use-api-data";
import { ModuleCard } from "@/components/ui/ModuleCard";

export function MonotreeModule(props: { refreshToken: number }) {
  const { data, error, isLoading } = useApiData<MonotreeFeed>("/api/monotree/posts", {
    intervalMs: DEFAULT_REFRESH_INTERVAL_MS,
    refreshToken: props.refreshToken,
  });

  const severity = error ? "unknown" : "ok";
  const statusText = error ? "Feil" : data?.isDummyData ? "Dummy" : "Live";

  return (
    <ModuleCard
      title="Monotree"
      severity={severity}
      statusText={statusText}
      right={<Newspaper className="h-5 w-5 text-white/75" aria-hidden="true" />}
    >
      {error ? (
        <div className="flex h-full items-center text-white/70">{error}</div>
      ) : (
        <div className="flex h-full flex-col">
          <div className="text-xs text-white/55">{isLoading ? "Henter..." : "Siste innlegg"}</div>
          <div className="mt-3 flex-1 space-y-3 overflow-hidden">
            {(data?.posts ?? []).slice(0, 4).map((post) => (
              <div
                key={post.id}
                className="rounded-2xl bg-white/5 px-4 py-3 ring-1 ring-inset ring-white/10"
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
            {data?.posts?.length ? null : (
              <div className="flex h-full items-center text-white/55">Ingen innlegg.</div>
            )}
          </div>
        </div>
      )}
    </ModuleCard>
  );
}
