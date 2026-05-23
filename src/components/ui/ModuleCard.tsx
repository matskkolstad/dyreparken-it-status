import type { ReactNode } from "react";

import type { ModuleSeverity } from "@/lib/types";

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

export function ModuleCard(props: {
  title: string;
  severity: ModuleSeverity;
  statusText: string;
  right?: ReactNode;
  children: ReactNode;
}) {
  const styles = severityStyles[props.severity];
  return (
    <section
      className={[
        "h-full rounded-2xl bg-[color:var(--card)] ring-1 ring-inset backdrop-blur-md",
        "px-5 py-5 md:px-6 md:py-6",
        "transition-shadow duration-300",
        styles.ring,
        styles.glow,
      ].join(" ")}
    >
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
                    "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
                    styles.dot,
                  ].join(" ")}
                />
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
        </div>
        {props.right ? <div className="shrink-0">{props.right}</div> : null}
      </header>
      <div className="mt-4 h-[calc(100%-3.25rem)]">{props.children}</div>
    </section>
  );
}
