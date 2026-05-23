"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { fetchJson } from "@/lib/fetch-json";

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
  const [data, setData] = useState<T>();
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastSuccessAt, setLastSuccessAt] = useState<string>();

  const mountedRef = useRef(true);
  const refreshIndexRef = useRef(0);

  const refresh = useCallback(() => {
    refreshIndexRef.current += 1;
    setIsLoading(true);
  }, []);

  const trigger = useMemo(
    () => `${refreshIndexRef.current}:${refreshToken ?? 0}`,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [refreshToken, isLoading],
  );

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
        setLastSuccessAt(new Date().toISOString());
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
