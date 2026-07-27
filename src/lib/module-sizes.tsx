"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

export type ModuleSize = { w?: number; h?: number };

const SIZE_STORAGE_KEY = "dp.status.moduleSizes.v1";

export const MIN_SPAN = 2;
export const MAX_SPAN = 12;
export const MIN_HEIGHT = 140;
export const MAX_HEIGHT = 1600;
export const ROW_UNIT = 8;

type StoredSizes = Record<string, ModuleSize>;

function sanitizeSize(raw: unknown): ModuleSize | null {
  if (typeof raw !== "object" || raw === null) return null;
  const candidate = raw as { w?: unknown; h?: unknown };
  const size: ModuleSize = {};
  if (
    typeof candidate.w === "number" &&
    Number.isInteger(candidate.w) &&
    candidate.w >= 1 &&
    candidate.w <= MAX_SPAN
  ) {
    size.w = candidate.w;
  }
  if (
    typeof candidate.h === "number" &&
    Number.isFinite(candidate.h) &&
    candidate.h >= MIN_HEIGHT &&
    candidate.h <= MAX_HEIGHT
  ) {
    size.h = Math.round(candidate.h);
  }
  return size.w !== undefined || size.h !== undefined ? size : null;
}

function readStoredSizes(): StoredSizes {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(SIZE_STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return {};
    const result: StoredSizes = {};
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      const size = sanitizeSize(value);
      if (size) result[key] = size;
    }
    return result;
  } catch {
    return {};
  }
}

function writeStoredSizes(all: StoredSizes) {
  try {
    window.localStorage.setItem(SIZE_STORAGE_KEY, JSON.stringify(all));
  } catch (err) {
    console.warn("Kunne ikke lagre modulstørrelser", err);
  }
}

export type ModuleSizeContextValue = {
  editMode: boolean;
  getSize: (moduleId: string) => ModuleSize | undefined;
  setDraftSize: (moduleId: string, size: ModuleSize) => void;
};

export const ModuleSizeContext = createContext<ModuleSizeContextValue | null>(null);

export function useModuleSize(moduleId?: string) {
  const ctx = useContext(ModuleSizeContext);
  if (!ctx || !moduleId) return null;
  return {
    editMode: ctx.editMode,
    size: ctx.getSize(moduleId),
    setDraftSize: (size: ModuleSize) => ctx.setDraftSize(moduleId, size),
  };
}

function pageEntries(all: StoredSizes, pageId: string): Record<string, ModuleSize> {
  const prefix = `${pageId}:`;
  const result: Record<string, ModuleSize> = {};
  for (const [key, value] of Object.entries(all)) {
    if (key.startsWith(prefix)) result[key.slice(prefix.length)] = value;
  }
  return result;
}

export function useModuleSizesController(pageId: string) {
  const [savedSizes, setSavedSizes] = useState<StoredSizes>(() => readStoredSizes());
  const [editMode, setEditMode] = useState(false);
  const [draftSizes, setDraftSizes] = useState<Record<string, ModuleSize>>({});

  const beginEdit = useCallback(() => {
    setDraftSizes(pageEntries(savedSizes, pageId));
    setEditMode(true);
  }, [savedSizes, pageId]);

  const cancelEdit = useCallback(() => {
    setEditMode(false);
    setDraftSizes({});
  }, []);

  const saveEdit = useCallback(() => {
    setSavedSizes((prev) => {
      const prefix = `${pageId}:`;
      const next: StoredSizes = {};
      for (const [key, value] of Object.entries(prev)) {
        if (!key.startsWith(prefix)) next[key] = value;
      }
      for (const [moduleId, size] of Object.entries(draftSizes)) {
        if (size.w !== undefined || size.h !== undefined) {
          next[`${pageId}:${moduleId}`] = size;
        }
      }
      writeStoredSizes(next);
      return next;
    });
    setEditMode(false);
    setDraftSizes({});
  }, [draftSizes, pageId]);

  const resetPage = useCallback(() => {
    setDraftSizes({});
  }, []);

  const setDraftSize = useCallback((moduleId: string, size: ModuleSize) => {
    setDraftSizes((prev) => ({
      ...prev,
      [moduleId]: { ...prev[moduleId], ...size },
    }));
  }, []);

  const getSize = useCallback(
    (moduleId: string): ModuleSize | undefined => {
      if (editMode) return draftSizes[moduleId];
      return savedSizes[`${pageId}:${moduleId}`];
    },
    [editMode, draftSizes, savedSizes, pageId],
  );

  const contextValue = useMemo<ModuleSizeContextValue>(
    () => ({ editMode, getSize, setDraftSize }),
    [editMode, getSize, setDraftSize],
  );

  return { editMode, beginEdit, cancelEdit, saveEdit, resetPage, setDraftSize, contextValue };
}
