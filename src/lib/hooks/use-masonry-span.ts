"use client";

import { useLayoutEffect, useState, type RefObject } from "react";

import { ROW_UNIT } from "@/lib/module-sizes";

/**
 * Måler høyden på kortets indre innhold og regner ut hvor mange mikro-rader
 * (grid-auto-rows) kortet må spenne i .dp-dyngrid. Observerer det indre
 * elementet – aldri selve kortet – for å unngå feedback-loop når span endres.
 */
export function useMasonrySpan(
  innerRef: RefObject<HTMLDivElement | null>,
  cardRef: RefObject<HTMLElement | null>,
  enabled: boolean,
): number | null {
  const [span, setSpan] = useState<number | null>(null);

  useLayoutEffect(() => {
    if (!enabled) return;

    const inner = innerRef.current;
    const card = cardRef.current;
    if (!inner || !card) return;

    const measure = () => {
      const styles = window.getComputedStyle(card);
      const paddingTop = parseFloat(styles.paddingTop) || 0;
      const paddingBottom = parseFloat(styles.paddingBottom) || 0;
      const marginBottom = parseFloat(styles.marginBottom) || 0;
      const total = inner.offsetHeight + paddingTop + paddingBottom + marginBottom;
      const nextSpan = Math.max(1, Math.ceil(total / ROW_UNIT));
      setSpan((prev) => (prev === nextSpan ? prev : nextSpan));
    };

    // ResizeObserver leverer alltid en initiell callback ved observe(),
    // så første måling skjer der (etter layout, før paint).
    const observer = new ResizeObserver(() => measure());
    observer.observe(inner);
    window.addEventListener("resize", measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [innerRef, cardRef, enabled]);

  return enabled ? span : null;
}
