import { ApiError } from "@/lib/fetch-json";

export async function fetchJsonServer<T>(
  url: string,
  init?: RequestInit,
  options: { timeoutMs?: number } = {},
): Promise<T> {
  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? 15_000;
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      cache: "no-store",
      ...init,
      signal: controller.signal,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new ApiError(
        `Request failed: ${response.status} ${response.statusText}${text ? ` • ${text}` : ""}`,
        response.status,
      );
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

