"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

import {
  MAX_HEIGHT,
  MAX_SPAN,
  MIN_HEIGHT,
  MIN_SPAN,
  type ModuleSize,
} from "@/lib/module-sizes";

export type ResizeAxis = "x" | "y" | "xy";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Pointer-basert resize av et kort i .dp-dyngrid. Bredde snapper live til
 * grid-spor (spans), høyde er kontinuerlig i px.
 */
export function useCardResize(opts: {
  cardRef: RefObject<HTMLElement | null>;
  enabled: boolean;
  onResize: (size: ModuleSize) => void;
}) {
  const { cardRef, enabled, onResize } = opts;
  const [isResizing, setIsResizing] = useState(false);
  const frameRef = useRef<number | null>(null);
  const onResizeRef = useRef(onResize);

  useEffect(() => {
    onResizeRef.current = onResize;
  }, [onResize]);

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      document.body.classList.remove("dp-resizing");
    };
  }, []);

  const startResize = useCallback(
    (event: React.PointerEvent<HTMLElement>, axis: ResizeAxis) => {
      const card = cardRef.current;
      const grid = card?.parentElement;
      if (!enabled || !card || !grid) return;

      event.preventDefault();
      event.stopPropagation();

      const handle = event.currentTarget;
      handle.setPointerCapture(event.pointerId);

      const startX = event.clientX;
      const startY = event.clientY;
      const startRect = card.getBoundingClientRect();
      const gridStyles = window.getComputedStyle(grid);
      const track = parseFloat(gridStyles.gridTemplateColumns.split(" ")[0]) || 1;
      const gap = parseFloat(gridStyles.columnGap) || 0;

      document.body.classList.add("dp-resizing");
      setIsResizing(true);

      let latest: PointerEvent | null = null;

      const applyLatest = () => {
        frameRef.current = null;
        if (!latest) return;
        const dx = latest.clientX - startX;
        const dy = latest.clientY - startY;
        const size: ModuleSize = {};
        if (axis !== "y") {
          const desiredWidth = startRect.width + dx;
          size.w = clamp(Math.round((desiredWidth + gap) / (track + gap)), MIN_SPAN, MAX_SPAN);
        }
        if (axis !== "x") {
          size.h = clamp(Math.round(startRect.height + dy), MIN_HEIGHT, MAX_HEIGHT);
        }
        onResizeRef.current(size);
      };

      const onMove = (moveEvent: PointerEvent) => {
        if (moveEvent.pointerId !== event.pointerId) return;
        latest = moveEvent;
        if (frameRef.current === null) {
          frameRef.current = requestAnimationFrame(applyLatest);
        }
      };

      const finish = (endEvent: PointerEvent) => {
        if (endEvent.pointerId !== event.pointerId) return;
        if (frameRef.current !== null) {
          cancelAnimationFrame(frameRef.current);
          frameRef.current = null;
        }
        applyLatest();
        handle.removeEventListener("pointermove", onMove);
        handle.removeEventListener("pointerup", finish);
        handle.removeEventListener("pointercancel", finish);
        if (handle.hasPointerCapture(endEvent.pointerId)) {
          handle.releasePointerCapture(endEvent.pointerId);
        }
        document.body.classList.remove("dp-resizing");
        setIsResizing(false);
      };

      handle.addEventListener("pointermove", onMove);
      handle.addEventListener("pointerup", finish);
      handle.addEventListener("pointercancel", finish);
    },
    [cardRef, enabled],
  );

  return { startResize, isResizing };
}
