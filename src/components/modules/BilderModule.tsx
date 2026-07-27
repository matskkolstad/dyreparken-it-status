"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Images } from "lucide-react";
import { useEffect, useState } from "react";

import type { BilderFeed } from "@/lib/types";
import { DEFAULT_REFRESH_INTERVAL_MS } from "@/lib/dashboard-config";
import { useApiData } from "@/lib/hooks/use-api-data";
import { ModuleCard } from "@/components/ui/ModuleCard";

const SLIDE_DURATION_MS = 5000;
const FADE_DURATION_S = 1;

export function BilderModule(props: { refreshToken: number; dynamicMode?: boolean }) {
  const dynamicMode = props.dynamicMode ?? false;
  const { data, error } = useApiData<BilderFeed>("/api/bilder", {
    intervalMs: DEFAULT_REFRESH_INTERVAL_MS,
    refreshToken: props.refreshToken,
  });

  const images = data?.images ?? [];
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    const timer = window.setInterval(() => {
      setSlideIndex((i) => i + 1);
    }, SLIDE_DURATION_MS);
    return () => window.clearInterval(timer);
  }, [images.length]);

  const current = images.length > 0 ? images[slideIndex % images.length] : undefined;

  const severity = error ? "unknown" : images.length > 0 ? "ok" : "degraded";
  const statusText = error
    ? "Feil"
    : data?.isDummyData
      ? "Dummy"
      : images.length > 0
        ? "Live"
        : "Ingen bilder";

  return (
    <ModuleCard
      moduleId="bilder"
      title="Bilder"
      severity={severity}
      statusText={statusText}
      pulseKey={data?.lastUpdatedAt}
      dynamicMode={dynamicMode}
      right={<Images className="h-5 w-5 text-white/75" aria-hidden="true" />}
    >
      {error ? (
        <div className="flex h-full items-center text-white/70">{error}</div>
      ) : current ? (
        <div
          className={[
            "relative w-full overflow-hidden rounded-xl bg-black/40 ring-1 ring-inset ring-white/10",
            dynamicMode ? "aspect-video" : "h-full min-h-0",
          ].join(" ")}
        >
          <AnimatePresence>
            <motion.div
              key={current.id}
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url("${current.url}")` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: FADE_DURATION_S, ease: "easeInOut" }}
            />
          </AnimatePresence>
          {images.length > 1 ? (
            <div className="absolute bottom-2 right-2 z-10 rounded-full bg-black/55 px-2.5 py-0.5 text-[11px] font-semibold tabular-nums text-white/90">
              {(slideIndex % images.length) + 1} / {images.length}
            </div>
          ) : null}
        </div>
      ) : (
        <div
          className={[
            "flex w-full items-center justify-center rounded-xl bg-white/5 px-4 text-center text-sm text-white/60 ring-1 ring-inset ring-white/10",
            dynamicMode ? "aspect-video" : "h-full min-h-0",
          ].join(" ")}
        >
          Ingen bilder funnet. Legg bildefiler i mappen public/bilder på serveren.
        </div>
      )}
    </ModuleCard>
  );
}
