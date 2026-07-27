"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

import type { DropPosition } from "@/lib/module-sizes";

const DRAG_THRESHOLD_PX = 8;

/**
 * Pointer-basert flytting av et kort i .dp-dyngrid. Kortet dras over et annet
 * kort, og plasseres før/etter det basert på pekerposisjonen. Selve
 * omplasseringen skjer live via moveModule (draft-state i redigeringsmodus).
 */
export function useCardMove(opts: {
  cardRef: RefObject<HTMLElement | null>;
  moduleId?: string;
  enabled: boolean;
  moveModule: (dragId: string, targetId: string, position: DropPosition) => void;
  setDragId: (id: string | null) => void;
}) {
  const { cardRef, moduleId, enabled, moveModule, setDragId } = opts;
  const [isMoving, setIsMoving] = useState(false);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      document.body.classList.remove("dp-resizing");
    };
  }, []);

  const startMove = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      const card = cardRef.current;
      if (!enabled || !card || !moduleId) return;
      if (event.button !== 0 && event.pointerType === "mouse") return;

      const handle = event.currentTarget;
      const pointerId = event.pointerId;
      const startX = event.clientX;
      const startY = event.clientY;
      let dragging = false;
      let latest: PointerEvent | null = null;

      const applyLatest = () => {
        frameRef.current = null;
        if (!latest || !dragging) return;
        const elements = document.elementsFromPoint(latest.clientX, latest.clientY);
        for (const el of elements) {
          const target = el.closest<HTMLElement>(".dp-card[data-module-id]");
          if (!target) continue;
          const targetId = target.dataset.moduleId;
          if (!targetId || targetId === moduleId) break;
          const rect = target.getBoundingClientRect();
          const withinRow = latest.clientY >= rect.top && latest.clientY <= rect.bottom;
          const position: DropPosition = withinRow
            ? latest.clientX < rect.left + rect.width / 2
              ? "before"
              : "after"
            : latest.clientY < rect.top + rect.height / 2
              ? "before"
              : "after";
          moveModule(moduleId, targetId, position);
          break;
        }
      };

      const onMove = (moveEvent: PointerEvent) => {
        if (moveEvent.pointerId !== pointerId) return;
        if (!dragging) {
          const dist = Math.hypot(moveEvent.clientX - startX, moveEvent.clientY - startY);
          if (dist < DRAG_THRESHOLD_PX) return;
          dragging = true;
          setDragId(moduleId);
          setIsMoving(true);
          document.body.classList.add("dp-resizing");
        }
        latest = moveEvent;
        if (frameRef.current === null) {
          frameRef.current = requestAnimationFrame(applyLatest);
        }
      };

      const finish = (endEvent: PointerEvent) => {
        if (endEvent.pointerId !== pointerId) return;
        if (frameRef.current !== null) {
          cancelAnimationFrame(frameRef.current);
          frameRef.current = null;
        }
        handle.removeEventListener("pointermove", onMove);
        handle.removeEventListener("pointerup", finish);
        handle.removeEventListener("pointercancel", finish);
        if (handle.hasPointerCapture(endEvent.pointerId)) {
          handle.releasePointerCapture(endEvent.pointerId);
        }
        if (dragging) {
          document.body.classList.remove("dp-resizing");
          setDragId(null);
          setIsMoving(false);
        }
      };

      handle.setPointerCapture(pointerId);
      handle.addEventListener("pointermove", onMove);
      handle.addEventListener("pointerup", finish);
      handle.addEventListener("pointercancel", finish);
    },
    [cardRef, moduleId, enabled, moveModule, setDragId],
  );

  return { startMove, isMoving };
}
