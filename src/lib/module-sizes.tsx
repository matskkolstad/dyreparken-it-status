"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

import { ALL_MODULE_IDS } from "@/lib/dashboard-config";
import type { DashboardModuleId } from "@/lib/types";

export type ModuleSize = { w?: number; h?: number };

const SIZE_STORAGE_KEY = "dp.status.moduleSizes.v1";
const MODULES_STORAGE_KEY = "dp.status.pageModules.v1";

export const MIN_SPAN = 2;
export const MAX_SPAN = 12;
export const MIN_HEIGHT = 140;
export const MAX_HEIGHT = 1600;
export const ROW_UNIT = 8;
export const HEIGHT_SNAP = 40;

type StoredSizes = Record<string, ModuleSize>;
type StoredModules = Record<string, DashboardModuleId[]>;

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

function isModuleId(value: unknown): value is DashboardModuleId {
  return typeof value === "string" && (ALL_MODULE_IDS as string[]).includes(value);
}

function readStoredModules(): StoredModules {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(MODULES_STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return {};
    const result: StoredModules = {};
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (!Array.isArray(value)) continue;
      const modules = value.filter(isModuleId);
      const unique = [...new Set(modules)];
      if (unique.length > 0) result[key] = unique;
    }
    return result;
  } catch {
    return {};
  }
}

function writeStoredModules(all: StoredModules) {
  try {
    window.localStorage.setItem(MODULES_STORAGE_KEY, JSON.stringify(all));
  } catch (err) {
    console.warn("Kunne ikke lagre modulliste", err);
  }
}

function sameModules(a: readonly DashboardModuleId[], b: readonly DashboardModuleId[]) {
  return a.length === b.length && a.every((id, i) => id === b[i]);
}

export type DropPosition = "before" | "after";

export type ModuleSizeContextValue = {
  editMode: boolean;
  getSize: (moduleId: string) => ModuleSize | undefined;
  setDraftSize: (moduleId: string, size: ModuleSize) => void;
  removeModule: (moduleId: DashboardModuleId) => void;
  moveModule: (dragId: string, targetId: string, position: DropPosition) => void;
  dragId: string | null;
  setDragId: (id: string | null) => void;
};

export const ModuleSizeContext = createContext<ModuleSizeContextValue | null>(null);

export function useModuleSize(moduleId?: string) {
  const ctx = useContext(ModuleSizeContext);
  if (!ctx || !moduleId) return null;
  return {
    editMode: ctx.editMode,
    size: ctx.getSize(moduleId),
    setDraftSize: (size: ModuleSize) => ctx.setDraftSize(moduleId, size),
    removeModule: () => ctx.removeModule(moduleId as DashboardModuleId),
    moveModule: ctx.moveModule,
    dragId: ctx.dragId,
    setDragId: ctx.setDragId,
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

export function useModuleSizesController(
  pageId: string,
  defaultModules: readonly DashboardModuleId[],
) {
  const [savedSizes, setSavedSizes] = useState<StoredSizes>(() => readStoredSizes());
  const [savedModules, setSavedModules] = useState<StoredModules>(() => readStoredModules());
  const [editMode, setEditMode] = useState(false);
  const [draftSizes, setDraftSizes] = useState<Record<string, ModuleSize>>({});
  const [draftModules, setDraftModules] = useState<DashboardModuleId[] | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  const effectiveModules = useMemo<DashboardModuleId[]>(() => {
    if (editMode && draftModules) return draftModules;
    return savedModules[pageId] ?? [...defaultModules];
  }, [editMode, draftModules, savedModules, pageId, defaultModules]);

  const beginEdit = useCallback(() => {
    setDraftSizes(pageEntries(savedSizes, pageId));
    setDraftModules(savedModules[pageId] ?? [...defaultModules]);
    setEditMode(true);
  }, [savedSizes, savedModules, pageId, defaultModules]);

  const cancelEdit = useCallback(() => {
    setEditMode(false);
    setDraftSizes({});
    setDraftModules(null);
    setDragId(null);
  }, []);

  const saveEdit = useCallback(() => {
    const modulesToSave = draftModules ?? [...defaultModules];
    setSavedSizes((prev) => {
      const prefix = `${pageId}:`;
      const next: StoredSizes = {};
      for (const [key, value] of Object.entries(prev)) {
        if (!key.startsWith(prefix)) next[key] = value;
      }
      for (const [moduleId, size] of Object.entries(draftSizes)) {
        if (
          (size.w !== undefined || size.h !== undefined) &&
          modulesToSave.includes(moduleId as DashboardModuleId)
        ) {
          next[`${pageId}:${moduleId}`] = size;
        }
      }
      writeStoredSizes(next);
      return next;
    });
    setSavedModules((prev) => {
      const next: StoredModules = { ...prev };
      if (sameModules(modulesToSave, defaultModules)) {
        delete next[pageId];
      } else {
        next[pageId] = modulesToSave;
      }
      writeStoredModules(next);
      return next;
    });
    setEditMode(false);
    setDraftSizes({});
    setDraftModules(null);
    setDragId(null);
  }, [draftSizes, draftModules, pageId, defaultModules]);

  const resetPage = useCallback(() => {
    setDraftSizes({});
    setDraftModules([...defaultModules]);
  }, [defaultModules]);

  const setDraftSize = useCallback((moduleId: string, size: ModuleSize) => {
    setDraftSizes((prev) => ({
      ...prev,
      [moduleId]: { ...prev[moduleId], ...size },
    }));
  }, []);

  const addModule = useCallback((moduleId: DashboardModuleId) => {
    setDraftModules((prev) => {
      if (!prev || prev.includes(moduleId)) return prev;
      return [...prev, moduleId];
    });
  }, []);

  const removeModule = useCallback((moduleId: DashboardModuleId) => {
    setDraftModules((prev) => (prev ? prev.filter((id) => id !== moduleId) : prev));
    setDraftSizes((prev) => {
      if (!(moduleId in prev)) return prev;
      const next = { ...prev };
      delete next[moduleId];
      return next;
    });
  }, []);

  const moveModule = useCallback(
    (dragModuleId: string, targetId: string, position: DropPosition) => {
      setDraftModules((prev) => {
        if (!prev) return prev;
        const from = prev.indexOf(dragModuleId as DashboardModuleId);
        const targetIndex = prev.indexOf(targetId as DashboardModuleId);
        if (from === -1 || targetIndex === -1 || dragModuleId === targetId) return prev;
        const without = prev.filter((id) => id !== dragModuleId);
        let insertAt = without.indexOf(targetId as DashboardModuleId);
        if (position === "after") insertAt += 1;
        const next = [...without.slice(0, insertAt), dragModuleId as DashboardModuleId, ...without.slice(insertAt)];
        return sameModules(next, prev) ? prev : next;
      });
    },
    [],
  );

  const getSize = useCallback(
    (moduleId: string): ModuleSize | undefined => {
      if (editMode) return draftSizes[moduleId];
      return savedSizes[`${pageId}:${moduleId}`];
    },
    [editMode, draftSizes, savedSizes, pageId],
  );

  const contextValue = useMemo<ModuleSizeContextValue>(
    () => ({ editMode, getSize, setDraftSize, removeModule, moveModule, dragId, setDragId }),
    [editMode, getSize, setDraftSize, removeModule, moveModule, dragId],
  );

  return {
    editMode,
    effectiveModules,
    beginEdit,
    cancelEdit,
    saveEdit,
    resetPage,
    setDraftSize,
    addModule,
    removeModule,
    contextValue,
  };
}
