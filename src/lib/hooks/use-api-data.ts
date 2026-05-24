"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { fetchJson } from "@/lib/fetch-json";

const memoryCache = new Map<string, { data: unknown; lastSuccessAt?: string }>();

export type UseApiDataState<T> = {
  data?: T;
  error?: string;
  isLoading: boolean;
  lastSuccessAt?: string;
  refresh: () => void;
};

export function useApiData<T>(
  url: string,
  options: { intervalMs?: number; refreshToken?: number } = {},
): UseApiDataState<T> {
  const { intervalMs, refreshToken } = options;
  const cached = memoryCache.get(url);
  const [data, setData] = useState<T | undefined>(() => cached?.data as T | undefined);
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState<boolean>(!cached?.data);
  const [lastSuccessAt, setLastSuccessAt] = useState<string | undefined>(
    cached?.lastSuccessAt,
  );

  const mountedRef = useRef(true);
  const [refreshIndex, setRefreshIndex] = useState(0);

  const refresh = useCallback(() => {
    setRefreshIndex((i) => i + 1);
    setIsLoading(true);
  }, []);

  const trigger = `${refreshIndex}:${refreshToken ?? 0}`;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    let timer: number | undefined;
    if (intervalMs && intervalMs > 0) {
      timer = window.setInterval(() => refresh(), intervalMs);
    }
    return () => {
      if (timer) window.clearInterval(timer);
    };
  }, [intervalMs, refresh]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setError(undefined);
        const nextData = await fetchJson<T>(url);
        if (cancelled || !mountedRef.current) return;
        setData(nextData);
        const now = new Date().toISOString();
        setLastSuccessAt(now);
        memoryCache.set(url, { data: nextData, lastSuccessAt: now });
      } catch (err) {
        if (cancelled || !mountedRef.current) return;
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
      } finally {
        if (cancelled || !mountedRef.current) return;
        setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [url, trigger]);

  return { data, error, isLoading, lastSuccessAt, refresh };
}
