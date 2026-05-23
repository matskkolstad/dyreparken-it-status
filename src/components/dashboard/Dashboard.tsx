"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play, RefreshCw, SkipForward, Timer } from "lucide-react";
import { useEffect, useState } from "react";

import {
  DASHBOARD_PAGES,
  DEFAULT_PAGE_DURATION_SECONDS,
  DEFAULT_REFRESH_INTERVAL_MS,
  DEFAULT_ROTATION_ENABLED,
} from "@/lib/dashboard-config";
import type { DashboardModuleId } from "@/lib/types";
import { useNow } from "@/lib/hooks/use-now";

import { AsanaModule } from "@/components/modules/AsanaModule";
import { EsperModule } from "@/components/modules/EsperModule";
import { LibreNmsModule } from "@/components/modules/LibreNmsModule";
import { MonotreeModule } from "@/components/modules/MonotreeModule";
import { NinjaOneModule } from "@/components/modules/NinjaOneModule";
import { WeatherModule } from "@/components/modules/WeatherModule";
import { ZoinedModule } from "@/components/modules/ZoinedModule";

function renderModule(id: DashboardModuleId, refreshToken: number) {
  switch (id) {
    case "weather":
      return <WeatherModule refreshToken={refreshToken} />;
    case "asana":
      return <AsanaModule refreshToken={refreshToken} />;
    case "monotree":
      return <MonotreeModule refreshToken={refreshToken} />;
    case "librenms":
      return <LibreNmsModule refreshToken={refreshToken} />;
    case "ninjaone":
      return <NinjaOneModule refreshToken={refreshToken} />;
    case "esper":
      return <EsperModule refreshToken={refreshToken} />;
    case "zoined":
      return <ZoinedModule refreshToken={refreshToken} />;
  }
}

function formatClock(now: Date) {
  return now.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(now: Date) {
  return now.toLocaleDateString("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

const STORAGE_KEYS = {
  rotationEnabled: "dp.status.rotationEnabled",
  pageDurationSeconds: "dp.status.pageDurationSeconds",
};

export function Dashboard() {
  const now = useNow(1000);
  const pages = DASHBOARD_PAGES;

  const [refreshToken, setRefreshToken] = useState(0);
  const [activePageIndex, setActivePageIndex] = useState(0);

  const [rotationEnabled, setRotationEnabled] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_ROTATION_ENABLED;
    const stored = window.localStorage.getItem(STORAGE_KEYS.rotationEnabled);
    return stored !== null ? stored === "true" : DEFAULT_ROTATION_ENABLED;
  });
  const [pageDurationSeconds, setPageDurationSeconds] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_PAGE_DURATION_SECONDS;
    const stored = window.localStorage.getItem(STORAGE_KEYS.pageDurationSeconds);
    if (stored !== null) {
      const parsed = Number(stored);
      if (Number.isFinite(parsed) && parsed >= 5 && parsed <= 300) return parsed;
    }
    return DEFAULT_PAGE_DURATION_SECONDS;
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.rotationEnabled, String(rotationEnabled));
  }, [rotationEnabled]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.pageDurationSeconds, String(pageDurationSeconds));
  }, [pageDurationSeconds]);

  const activePage = pages[activePageIndex] ?? pages[0]!;
  const rotationIsActive = rotationEnabled && pages.length > 1;

  useEffect(() => {
    if (!rotationIsActive) return;
    const timer = window.setTimeout(() => {
      setActivePageIndex((idx) => (idx + 1) % pages.length);
    }, pageDurationSeconds * 1000);
    return () => window.clearTimeout(timer);
  }, [pageDurationSeconds, pages.length, rotationIsActive, activePageIndex]);

  return (
    <div className="min-h-screen w-full px-5 py-5 md:px-9 md:py-8">
      <header className="flex items-start justify-between gap-6">
        {/* Branding */}
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:rgba(247,181,0,0.16)] ring-1 ring-inset ring-[color:rgba(247,181,0,0.4)] text-xl select-none">
              🦁
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-bold tracking-tight text-white/95 md:text-3xl">
                Dyreparken IT Status
              </h1>
              <p className="truncate text-sm text-white/55">
                Dyreparken Kristiansand · IT-avdelingen
              </p>
            </div>
          </div>
        </div>

        {/* Controls + Clock */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden md:flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 ring-1 ring-inset ring-white/10">
            <Timer className="h-4 w-4 text-white/70" aria-hidden="true" />
            <input
              className="w-12 bg-transparent text-right text-sm font-semibold text-white/90 outline-none"
              value={pageDurationSeconds}
              onChange={(e) => {
                const next = Number(e.target.value);
                if (Number.isFinite(next)) setPageDurationSeconds(next);
              }}
              inputMode="numeric"
              aria-label="Sekunder per side"
            />
            <span className="text-sm text-white/70">sek</span>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 ring-1 ring-inset ring-white/10 hover:bg-white/10 transition-colors"
            onClick={() => setRotationEnabled((v) => !v)}
            aria-pressed={rotationEnabled}
          >
            {rotationEnabled ? (
              <>
                <Pause className="h-4 w-4" aria-hidden="true" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4" aria-hidden="true" />
                Spill
              </>
            )}
          </button>

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 ring-1 ring-inset ring-white/10 hover:bg-white/10 transition-colors disabled:opacity-40"
            onClick={() => setActivePageIndex((i) => (i + 1) % pages.length)}
            disabled={pages.length < 2}
          >
            <SkipForward className="h-4 w-4" aria-hidden="true" />
            Neste
          </button>

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-[color:rgba(15,184,137,0.16)] px-4 py-2 text-sm font-semibold text-white/95 ring-1 ring-inset ring-[color:rgba(15,184,137,0.35)] hover:bg-[color:rgba(15,184,137,0.22)] transition-colors"
            onClick={() => setRefreshToken((t) => t + 1)}
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Oppdater
          </button>

          {/* Clock */}
          <div className="ml-1 rounded-2xl bg-white/5 px-5 py-2 text-right ring-1 ring-inset ring-white/10 min-w-[130px]">
            <div className="text-xl font-bold tabular-nums text-white/95 md:text-2xl leading-tight">
              {formatClock(now)}
            </div>
            <div className="text-xs text-white/50 capitalize">
              {formatDate(now)}
            </div>
          </div>
        </div>
      </header>

      {/* CSS-animated rotation progress bar – resets on key change */}
      {rotationIsActive && (
        <div className="mt-4 h-0.5 w-full rounded-full bg-white/10 overflow-hidden">
          <div
            key={`progress-${activePageIndex}-${pageDurationSeconds}`}
            className="h-full rounded-full bg-[color:#0fb889]"
            style={{
              animation: `progress-fill ${pageDurationSeconds}s linear forwards`,
            }}
          />
        </div>
      )}

      {/* Page content */}
      <div className={rotationIsActive ? "mt-3" : "mt-5"}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage.id}
            initial={{ opacity: 0, y: 12, filter: "blur(3px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(2px)" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-base font-semibold tracking-tight text-white/60 md:text-lg">
                {activePage.title}
              </h2>
              {/* Page indicator dots */}
              <div className="flex items-center gap-1.5">
                {pages.map((page, i) => (
                  <button
                    key={page.id}
                    type="button"
                    onClick={() => setActivePageIndex(i)}
                    aria-label={`Gå til side: ${page.title}`}
                    className={[
                      "h-2 rounded-full transition-all duration-300",
                      i === activePageIndex
                        ? "w-6 bg-[color:#0fb889]"
                        : "w-2 bg-white/25 hover:bg-white/40",
                    ].join(" ")}
                  />
                ))}
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:gap-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 auto-rows-[240px] md:auto-rows-[260px]">
              {activePage.modules.map((id) => (
                <div key={id} className="h-full">
                  {renderModule(id, refreshToken)}
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <footer className="mt-6 text-xs text-white/35">
        Auto-oppdatering: {Math.round(DEFAULT_REFRESH_INTERVAL_MS / 1000)}s •{" "}
        {new Date().getFullYear()} Dyreparken Kristiansand
      </footer>
    </div>
  );
}
