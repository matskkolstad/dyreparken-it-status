"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

import type { ModuleSeverity } from "@/lib/types";
import { ROW_UNIT, useModuleSize, type ModuleSize } from "@/lib/module-sizes";
import { useCardResize, type ResizeAxis } from "@/lib/hooks/use-card-resize";
import { useMasonrySpan } from "@/lib/hooks/use-masonry-span";

const severityStyles: Record<
  ModuleSeverity,
  { ring: string; glow: string; pill: string; dot: string }
> = {
  ok: {
    ring: "ring-[color:rgba(15,184,137,0.35)]",
    glow: "shadow-[0_0_0_1px_rgba(15,184,137,0.18),0_18px_60px_-28px_rgba(15,184,137,0.55)]",
    pill: "bg-[color:rgba(15,184,137,0.15)] text-[color:rgba(170,255,230,0.95)] ring-[color:rgba(15,184,137,0.35)]",
    dot: "bg-[color:#0fb889]",
  },
  degraded: {
    ring: "ring-[color:rgba(247,181,0,0.35)]",
    glow: "shadow-[0_0_0_1px_rgba(247,181,0,0.18),0_18px_60px_-28px_rgba(247,181,0,0.5)]",
    pill: "bg-[color:rgba(247,181,0,0.15)] text-[color:rgba(255,244,205,0.95)] ring-[color:rgba(247,181,0,0.35)]",
    dot: "bg-[color:#f7b500]",
  },
  down: {
    ring: "ring-[color:rgba(255,107,61,0.35)]",
    glow: "shadow-[0_0_0_1px_rgba(255,107,61,0.2),0_18px_60px_-28px_rgba(255,107,61,0.55)]",
    pill: "bg-[color:rgba(255,107,61,0.15)] text-[color:rgba(255,226,217,0.95)] ring-[color:rgba(255,107,61,0.35)]",
    dot: "bg-[color:#ff6b3d]",
  },
  unknown: {
    ring: "ring-[color:rgba(98,182,255,0.35)]",
    glow: "shadow-[0_0_0_1px_rgba(98,182,255,0.16),0_18px_60px_-28px_rgba(98,182,255,0.55)]",
    pill: "bg-[color:rgba(98,182,255,0.14)] text-[color:rgba(220,242,255,0.95)] ring-[color:rgba(98,182,255,0.35)]",
    dot: "bg-[color:#62b6ff]",
  },
};

function ResizeHandle(props: {
  axis: ResizeAxis;
  onPointerDown: (event: React.PointerEvent<HTMLElement>, axis: ResizeAxis) => void;
}) {
  const axisClass =
    props.axis === "x"
      ? "dp-resize-handle-x"
      : props.axis === "y"
        ? "dp-resize-handle-y"
        : "dp-resize-handle-xy";
  return (
    <div
      className={`dp-resize-handle ${axisClass}`}
      onPointerDown={(e) => props.onPointerDown(e, props.axis)}
      role="presentation"
    />
  );
}

export function ModuleCard(props: {
  moduleId?: string;
  title: string;
  severity: ModuleSeverity;
  statusText: string;
  subtitle?: ReactNode;
  right?: ReactNode;
  pulseKey?: string;
  dynamicMode?: boolean;
  rowSpan?: number;
  children: ReactNode;
}) {
  const styles = severityStyles[props.severity];
  const dynamicMode = props.dynamicMode ?? false;
  const rowSpan = Math.max(1, Math.round(props.rowSpan ?? 1));

  const cardRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  const sizeCtx = useModuleSize(props.moduleId);
  const editMode = dynamicMode && (sizeCtx?.editMode ?? false);
  const savedW = dynamicMode ? sizeCtx?.size?.w : undefined;
  const savedH = dynamicMode ? sizeCtx?.size?.h : undefined;

  const autoSpan = useMasonrySpan(innerRef, cardRef, dynamicMode && savedH == null);

  const { startResize } = useCardResize({
    cardRef,
    enabled: editMode,
    onResize: (size: ModuleSize) => sizeCtx?.setDraftSize(size),
  });

  const [marginBottom, setMarginBottom] = useState(0);
  useLayoutEffect(() => {
    if (!dynamicMode || savedH == null) return;
    const card = cardRef.current;
    if (!card) return;
    const update = () => {
      const next = parseFloat(window.getComputedStyle(card).marginBottom) || 0;
      setMarginBottom((prev) => (prev === next ? prev : next));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [dynamicMode, savedH]);

  let dynamicStyle: CSSProperties | undefined;
  if (dynamicMode) {
    dynamicStyle = {
      gridColumn: savedW ? `span ${savedW}` : undefined,
      gridRow:
        savedH != null
          ? `span ${Math.max(1, Math.ceil((savedH + marginBottom) / ROW_UNIT))}`
          : autoSpan != null
            ? `span ${autoSpan}`
            : undefined,
      height: savedH != null ? savedH : undefined,
      overflow: savedH != null ? "hidden" : undefined,
    };
  }

  const header = (
    <header className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <h2 className="truncate text-lg font-semibold tracking-tight text-white/95 md:text-xl">
            {props.title}
          </h2>
          <span
            className={[
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
              styles.pill,
            ].join(" ")}
          >
            <span className="relative flex h-2 w-2">
              <span
                className={[
                  "relative inline-flex h-2 w-2 rounded-full",
                  styles.dot,
                ].join(" ")}
              />
            </span>
            {props.statusText}
          </span>
        </div>
        {props.subtitle ? (
          <div className="mt-1 text-xs text-white/55">{props.subtitle}</div>
        ) : null}
      </div>
      {props.right ? <div className="shrink-0">{props.right}</div> : null}
    </header>
  );

  const content = (
    <div className={dynamicMode ? "mt-4" : "mt-4 min-h-0 flex-1"}>
      <div
        key={props.pulseKey ?? "stable"}
        className={dynamicMode ? "animate-monotree-scroll" : "h-full min-h-0 animate-monotree-scroll"}
      >
        {props.children}
      </div>
    </div>
  );

  return (
    <section
      ref={cardRef}
      className={[
        "dp-card break-inside-avoid",
        dynamicMode
          ? "relative rounded-2xl bg-[color:var(--card)] ring-1 ring-inset"
          : "h-full min-h-0 overflow-hidden rounded-2xl bg-[color:var(--card)] ring-1 ring-inset flex flex-col",
        "px-5 py-5 md:px-6 md:py-6",
        styles.ring,
        "shadow-[0_0_0_1px_rgba(255,255,255,0.04)]",
      ].join(" ")}
      style={{ "--dp-row-span": rowSpan, ...dynamicStyle } as CSSProperties}
      data-row-span={rowSpan}
      data-module-id={props.moduleId}
    >
      {dynamicMode ? (
        <>
          <div ref={innerRef} className="dp-card-inner">
            {header}
            {content}
          </div>
          {editMode ? (
            <>
              <ResizeHandle axis="x" onPointerDown={startResize} />
              <ResizeHandle axis="y" onPointerDown={startResize} />
              <ResizeHandle axis="xy" onPointerDown={startResize} />
            </>
          ) : null}
        </>
      ) : (
        <>
          {header}
          {content}
        </>
      )}
    </section>
  );
}
