"use client";

import { useEffect, useState } from "react";

type DynamicLimitOptions = {
  min: number;
  max: number;
  rowHeight: number;
  reservedHeight: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function useDynamicListLimit(
  enabled: boolean,
  fallback: number,
  options: DynamicLimitOptions,
) {
  const { min, max, rowHeight, reservedHeight } = options;
  const [limit, setLimit] = useState(fallback);

  useEffect(() => {
    if (!enabled) {
      setLimit(fallback);
      return;
    }

    const calculate = () => {
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const available = Math.max(0, viewportHeight - reservedHeight);
      const base = Math.max(1, Math.floor(available / rowHeight));
      const widthFactor = viewportWidth < 768 ? 0.6 : viewportWidth < 1280 ? 0.8 : 1;
      const computed = Math.floor(base * widthFactor);
      setLimit(clamp(computed, min, max));
    };

    calculate();
    window.addEventListener("resize", calculate);
    return () => window.removeEventListener("resize", calculate);
  }, [enabled, fallback, min, max, reservedHeight, rowHeight]);

  return enabled ? limit : fallback;
}
