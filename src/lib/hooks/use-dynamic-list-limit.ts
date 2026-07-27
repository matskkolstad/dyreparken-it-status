"use client";

import { useEffect, useState } from "react";

import { useModuleSize } from "@/lib/module-sizes";

type DynamicLimitOptions = {
  min: number;
  max: number;
  rowHeight: number;
  reservedHeight: number;
  /** Modul-id for å hente brukerens lagrede korthøyde (redigeringsmodus). */
  moduleId?: string;
  /** Fast innhold i kortet (header, statistikkbokser osv.) i px. */
  reservedCardHeight?: number;
  /** Antall elementer per visuell rad (f.eks. 3 for rutenett-moduler). */
  itemsPerRow?: number;
  /** Andel (0–1) av kortets tilgjengelige høyde denne listen kan bruke
   *  når kortet har flere lister (f.eks. LibreNMS). */
  heightShare?: number;
};

const CARD_MAX_ITEMS = 30;

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

  // Brukerstyrt korthøyde fra redigeringsmodus (null utenfor provider).
  const sizeInfo = useModuleSize(options.moduleId);
  const cardHeight = sizeInfo?.size?.h;

  useEffect(() => {
    if (!enabled) return;

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

  if (!enabled) return fallback;

  // Har brukeren satt en egen høyde på kortet, styrer den hvor mye data som vises:
  // større kort -> flere rader, mindre kort -> færre rader.
  if (cardHeight != null) {
    const reservedCard = options.reservedCardHeight ?? 160;
    const perRow = options.itemsPerRow ?? 1;
    const share = options.heightShare ?? 1;
    const available = Math.max(0, cardHeight - reservedCard) * share;
    const rows = Math.floor(available / rowHeight);
    return clamp(rows * perRow, 0, CARD_MAX_ITEMS);
  }

  return limit;
}
