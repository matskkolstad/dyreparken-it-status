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

    let virtualTop = el.scrollTop;
    let direction: 1 | -1 = 1;
    let pauseUntilMs = 0;
    const tickMs = 50;
    const stepPx = speedPxPerSecond * (tickMs / 1000);

    const step = () => {
      const node = ref.current;
      if (!node) return;

      const maxScroll = Math.max(0, node.scrollHeight - node.clientHeight);
      if (maxScroll <= 1) return;

      const now = Date.now();
      if (now < pauseUntilMs) {
        return;
      }

      const nextTop = virtualTop + direction * stepPx;

      if (nextTop >= maxScroll) {
        virtualTop = maxScroll;
        node.scrollTop = maxScroll;
        direction = -1;
        pauseUntilMs = now + 1200;
      } else if (nextTop <= 0) {
        virtualTop = 0;
        node.scrollTop = 0;
        direction = 1;
        pauseUntilMs = now + 1200;
      } else {
        virtualTop = nextTop;
        node.scrollTop = nextTop;
      }
    };

    const intervalId = window.setInterval(step, tickMs);

    virtualTop = 0;
    el.scrollTop = 0;
    return () => {
      window.clearInterval(intervalId);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, speedPxPerSecond, ...deps]);
}
