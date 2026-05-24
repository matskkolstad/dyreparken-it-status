"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play, RefreshCw, SkipForward, Timer } from "lucide-react";
import { cloneElement, useEffect, useState } from "react";

import {
  DASHBOARD_PAGES,
  DEFAULT_PAGE_DURATION_SECONDS,
  DEFAULT_REFRESH_INTERVAL_MS,
  DEFAULT_ROTATION_ENABLED,
} from "@/lib/dashboard-config";
import type { DashboardModuleId, OpeningHours, WeatherCurrent } from "@/lib/types";
import { useNow } from "@/lib/hooks/use-now";
import { useApiData } from "@/lib/hooks/use-api-data";

import { AsanaModule } from "@/components/modules/AsanaModule";
import { EnturModule } from "@/components/modules/EnturModule";
import { EsperModule } from "@/components/modules/EsperModule";
import { LibreNmsModule } from "@/components/modules/LibreNmsModule";
import { MonotreeModule } from "@/components/modules/MonotreeModule";
import { NinjaOneModule } from "@/components/modules/NinjaOneModule";
import { WeatherModule } from "@/components/modules/WeatherModule";
import { ZoinedModule } from "@/components/modules/ZoinedModule";

function renderModule(id: DashboardModuleId, refreshToken: number, dynamicMode: boolean) {
  switch (id) {
    case "weather":
      return <WeatherModule refreshToken={refreshToken} dynamicMode={dynamicMode} />;
    case "asana":
      return <AsanaModule refreshToken={refreshToken} dynamicMode={dynamicMode} />;
    case "monotree":
      return <MonotreeModule refreshToken={refreshToken} dynamicMode={dynamicMode} />;
    case "librenms":
      return <LibreNmsModule refreshToken={refreshToken} dynamicMode={dynamicMode} />;
    case "ninjaone":
      return <NinjaOneModule refreshToken={refreshToken} dynamicMode={dynamicMode} />;
    case "esper":
      return <EsperModule refreshToken={refreshToken} dynamicMode={dynamicMode} />;
    case "zoined":
      return <ZoinedModule refreshToken={refreshToken} dynamicMode={dynamicMode} />;
    case "entur":
      return <EnturModule refreshToken={refreshToken} dynamicMode={dynamicMode} />;
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

function WeatherWidget(props: { refreshToken: number }) {
  const { data, error, isLoading } = useApiData<WeatherCurrent>("/api/weather/current", {
    intervalMs: DEFAULT_REFRESH_INTERVAL_MS,
    refreshToken: props.refreshToken,
  });

  if (error) {
    return (
      <div className="dp-header-widget rounded-2xl bg-white/5 px-4 py-2 text-sm text-white/55 ring-1 ring-inset ring-white/10">
        Vær: feil
      </div>
    );
  }

  return (
    <div className="dp-header-widget rounded-2xl bg-white/5 px-4 py-2 ring-1 ring-inset ring-white/10">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-white/45">
        Vær
        <span className="h-1.5 w-1.5 rounded-full bg-[color:#0fb889]" aria-hidden="true" />
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <div className="text-lg font-semibold text-white/95">
          {isLoading ? "…" : `${data?.temperatureC ?? "—"}°`}
        </div>
        <div className="text-xs text-white/60">
          {data?.condition ?? "—"}
        </div>
      </div>
    </div>
  );
}

function OpeningHoursWidget(props: { refreshToken: number }) {
  const { data, error, isLoading } = useApiData<OpeningHours>("/api/opening-hours", {
    intervalMs: DEFAULT_REFRESH_INTERVAL_MS,
    refreshToken: props.refreshToken,
  });

  if (error) {
    return (
      <div className="dp-header-widget rounded-2xl bg-white/5 px-4 py-2 text-sm text-white/55 ring-1 ring-inset ring-white/10">
        Åpningstider: feil
      </div>
    );
  }

  return (
    <div className="dp-header-widget rounded-2xl bg-white/5 px-4 py-2 ring-1 ring-inset ring-white/10">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-white/45">
        Åpningstider
        <span className="h-1.5 w-1.5 rounded-full bg-[color:#62b6ff]" aria-hidden="true" />
      </div>
      <div className="mt-1 flex items-center justify-between gap-3 text-xs text-white/80">
        <span className="text-white/60">Dyreparken</span>
        <span className="font-semibold text-white/90">
          {isLoading ? "…" : data?.dyreparken ?? "—"}
        </span>
      </div>
      <div className="mt-0.5 flex items-center justify-between gap-3 text-xs text-white/80">
        <span className="text-white/60">Badeland</span>
        <span className="font-semibold text-white/90">
          {isLoading ? "…" : data?.badeland ?? "—"}
        </span>
      </div>
    </div>
  );
}

const STORAGE_KEYS = {
  rotationEnabled: "dp.status.rotationEnabled",
  pageDurationSeconds: "dp.status.pageDurationSeconds",
  dynamicMode: "dp.status.dynamicMode",
};

export function Dashboard() {
  const now = useNow(1000);
  const pages = DASHBOARD_PAGES;

  const [isClient, setIsClient] = useState(false);

  const [refreshToken, setRefreshToken] = useState(0);
  const [activePageIndex, setActivePageIndex] = useState(0);

  const [rotationEnabled, setRotationEnabled] = useState(DEFAULT_ROTATION_ENABLED);
  const [pageDurationSeconds, setPageDurationSeconds] = useState(
    DEFAULT_PAGE_DURATION_SECONDS,
  );
  const [dynamicMode, setDynamicMode] = useState(true);
  const [controlsHidden, setControlsHidden] = useState(false);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.rotationEnabled, String(rotationEnabled));
  }, [rotationEnabled]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.pageDurationSeconds, String(pageDurationSeconds));
  }, [pageDurationSeconds]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.dynamicMode, String(dynamicMode));
  }, [dynamicMode]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const storedRotation = window.localStorage.getItem(STORAGE_KEYS.rotationEnabled);
    if (storedRotation !== null) {
      setRotationEnabled(storedRotation === "true");
    }

    const storedDuration = window.localStorage.getItem(STORAGE_KEYS.pageDurationSeconds);
    if (storedDuration !== null) {
      const parsed = Number(storedDuration);
      if (Number.isFinite(parsed) && parsed >= 5 && parsed <= 300) {
        setPageDurationSeconds(parsed);
      }
    }

    const storedDynamicMode = window.localStorage.getItem(STORAGE_KEYS.dynamicMode);
    if (storedDynamicMode !== null) {
      setDynamicMode(storedDynamicMode === "true");
    }
  }, []);

  const activePage = pages[activePageIndex] ?? pages[0]!;

  useEffect(() => {
    document.body.dataset.pageId = activePage.id;
    document.body.dataset.dynamicMode = dynamicMode ? "true" : "false";
    document.documentElement.dataset.pageId = activePage.id;
    document.documentElement.dataset.dynamicMode = dynamicMode ? "true" : "false";
  }, [activePage.id, dynamicMode]);

  useEffect(() => {
    document.body.dataset.controlsHidden = controlsHidden ? "true" : "false";
    document.documentElement.dataset.controlsHidden = controlsHidden ? "true" : "false";
  }, [controlsHidden]);

  useEffect(() => {
    if (!isClient) return;
    let idleTimer: number | undefined;

    const setIdleTimer = () => {
      if (idleTimer) window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => setControlsHidden(true), 10_000);
    };

    const markActive = () => {
      setControlsHidden(false);
      setIdleTimer();
    };

    markActive();
    window.addEventListener("mousemove", markActive, { passive: true });
    window.addEventListener("mousedown", markActive, { passive: true });
    window.addEventListener("keydown", markActive);
    window.addEventListener("touchstart", markActive, { passive: true });

    return () => {
      if (idleTimer) window.clearTimeout(idleTimer);
      window.removeEventListener("mousemove", markActive);
      window.removeEventListener("mousedown", markActive);
      window.removeEventListener("keydown", markActive);
      window.removeEventListener("touchstart", markActive);
    };
  }, [isClient]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    window.dispatchEvent(new Event("resize"));
  }, [activePage.id]);

  useEffect(() => {
    if (!isClient) return;
    let timerA: number | undefined;
    let timerB: number | undefined;
    let intervalId: number | undefined;
    let stopId: number | undefined;

    const checkOverflow = () => {
      const shouldCheck = activePage.id === "oversikt" && dynamicMode;
      if (!shouldCheck) {
        document.body.dataset.forceFit = "false";
        document.documentElement.dataset.forceFit = "false";
        return;
      }

      const doc = document.documentElement;
      const overflow = doc.scrollHeight > window.innerHeight + 2;
      document.body.dataset.forceFit = overflow ? "true" : "false";
      document.documentElement.dataset.forceFit = overflow ? "true" : "false";
    };

    timerA = window.setTimeout(checkOverflow, 120);
    timerB = window.setTimeout(checkOverflow, 800);
    intervalId = window.setInterval(checkOverflow, 1000);
    stopId = window.setTimeout(() => {
      if (intervalId) window.clearInterval(intervalId);
    }, 12_000);
    window.addEventListener("resize", checkOverflow);

    return () => {
      if (timerA) window.clearTimeout(timerA);
      if (timerB) window.clearTimeout(timerB);
      if (intervalId) window.clearInterval(intervalId);
      if (stopId) window.clearTimeout(stopId);
      window.removeEventListener("resize", checkOverflow);
    };
  }, [activePage.id, dynamicMode, isClient]);
  const rotationIsActive = rotationEnabled && pages.length > 1;
  const rotationIsActiveForRender = isClient ? rotationIsActive : DEFAULT_ROTATION_ENABLED;

  useEffect(() => {
    if (!rotationIsActive) return;
    const timer = window.setTimeout(() => {
      setActivePageIndex((idx) => (idx + 1) % pages.length);
    }, pageDurationSeconds * 1000);
    return () => window.clearTimeout(timer);
  }, [pageDurationSeconds, pages.length, rotationIsActive, activePageIndex]);

  return (
    <div
      className="dp-page-shell min-h-screen w-full px-5 py-5 md:px-9 md:py-8"
      data-page-id={activePage.id}
      data-dynamic-mode={dynamicMode ? "true" : "false"}
      data-controls-hidden={controlsHidden ? "true" : "false"}
    >
      <header className="dp-page-header flex items-start justify-between gap-6">
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
          {isClient ? (
            <>
              <div className="dp-controls-hideable hidden md:flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 ring-1 ring-inset ring-white/10">
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
                className="dp-controls-hideable inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 ring-1 ring-inset ring-white/10 hover:bg-white/10 transition-colors"
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
                className="dp-controls-hideable inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 ring-1 ring-inset ring-white/10 hover:bg-white/10 transition-colors disabled:opacity-40"
                onClick={() => setActivePageIndex((i) => (i + 1) % pages.length)}
                disabled={pages.length < 2}
              >
                <SkipForward className="h-4 w-4" aria-hidden="true" />
                Neste
              </button>

              <button
                type="button"
                className="dp-controls-hideable inline-flex items-center gap-2 rounded-full bg-[color:rgba(15,184,137,0.16)] px-4 py-2 text-sm font-semibold text-white/95 ring-1 ring-inset ring-[color:rgba(15,184,137,0.35)] hover:bg-[color:rgba(15,184,137,0.22)] transition-colors"
                onClick={() => setRefreshToken((t) => t + 1)}
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Oppdater
              </button>

              <button
                type="button"
                className={[
                  "dp-controls-hideable",
                  "inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-inset transition-colors",
                  dynamicMode
                    ? "bg-[color:rgba(98,182,255,0.16)] text-white/95 ring-[color:rgba(98,182,255,0.35)] hover:bg-[color:rgba(98,182,255,0.24)]"
                    : "bg-white/5 text-white/90 ring-white/10 hover:bg-white/10",
                ].join(" ")}
                onClick={() => setDynamicMode((v) => !v)}
                aria-pressed={dynamicMode}
              >
                Dynamisk
              </button>

              <div className="flex items-center gap-3">
                <div className="hidden md:block">
                  <WeatherWidget refreshToken={refreshToken} />
                </div>
                <div className="hidden md:block">
                  <OpeningHoursWidget refreshToken={refreshToken} />
                </div>
                {/* Clock */}
                <div className="dp-header-widget ml-1 rounded-2xl bg-white/5 px-5 py-2 text-right ring-1 ring-inset ring-white/10 min-w-[130px]">
                  <div className="text-xl font-bold tabular-nums text-white/95 md:text-2xl leading-tight">
                    {formatClock(now)}
                  </div>
                  <div className="text-xs text-white/50 capitalize">
                    {formatDate(now)}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="h-10 w-[320px]" aria-hidden="true" />
          )}
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
      <div className={rotationIsActive ? "dp-page-main mt-3" : "dp-page-main mt-5"}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage.id}
            className="dp-page-motion"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
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

            {dynamicMode ? (
              <div
                className="dp-page-content dp-columns mt-4 columns-1 md:columns-2 xl:columns-3 [column-fill:_balance]"
                style={activePage.id === "oversikt" ? { columnGap: "1.2rem" } : undefined}
              >
                {activePage.modules.map((id) =>
                  cloneElement(renderModule(id, refreshToken, true), { key: id }),
                )}
              </div>
            ) : (
              <div className="dp-page-content dp-grid mt-4 grid gap-4 md:gap-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 auto-rows-[240px] md:auto-rows-[260px]">
                {activePage.modules.map((id) =>
                  cloneElement(renderModule(id, refreshToken, false), { key: id }),
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <footer className="dp-page-footer mt-6 text-xs text-white/35">
        Auto-oppdatering: {Math.round(DEFAULT_REFRESH_INTERVAL_MS / 1000)}s •{" "}
        {new Date().getFullYear()} Dyreparken Kristiansand
      </footer>
    </div>
  );
}
