"use client";

import { useEffect } from "react";

export function useAutoScroll(
  ref: React.RefObject<HTMLElement | null>,
  enabled: boolean,
  deps: Array<unknown> = [],
  speedPxPerSecond = 18,
) {
  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;

    let rafId = 0;
    let lastTs = 0;
    let direction: 1 | -1 = 1;
    let pauseUntil = 0;

    const step = (ts: number) => {
      const node = ref.current;
      if (!node) return;

      const maxScroll = Math.max(0, node.scrollHeight - node.clientHeight);
      if (maxScroll <= 1) return;

      if (lastTs === 0) lastTs = ts;
      const dt = (ts - lastTs) / 1000;
      lastTs = ts;

      if (ts < pauseUntil) {
        rafId = window.requestAnimationFrame(step);
        return;
      }

      const nextTop = node.scrollTop + direction * speedPxPerSecond * dt;

      if (nextTop >= maxScroll) {
        node.scrollTop = maxScroll;
        direction = -1;
        pauseUntil = ts + 1200;
      } else if (nextTop <= 0) {
        node.scrollTop = 0;
        direction = 1;
        pauseUntil = ts + 1200;
      } else {
        node.scrollTop = nextTop;
      }

      rafId = window.requestAnimationFrame(step);
    };

    el.scrollTop = 0;
    rafId = window.requestAnimationFrame(step);

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, speedPxPerSecond, ...deps]);
}
