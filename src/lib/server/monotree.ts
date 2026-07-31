import { requireEnv } from "@/lib/server/env";
import { fetchJsonServer } from "@/lib/server/fetch";

// Delt klient for Monotree Open API (beta, v1).
// Alle Monotree-endepunkter (posts, walls, announcements, calendar ...) skal gå
// gjennom monotreeGet() slik at base-URL, auth og feilhåndtering ligger ett sted.
// Docs: https://docs.monotree.com/monotree-llms.txt

const DEFAULT_BASE_URL = "https://dyreparken.monotree.com";
const API_PREFIX = "/api/open/v1";

/** Full API-base, f.eks. https://dyreparken.monotree.com/api/open/v1 */
export function getMonotreeBaseUrl(): string {
  const raw = (process.env.MONOTREE_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, "");
  // Tåler at MONOTREE_BASE_URL settes med eller uten /api/open/v1-suffikset.
  return raw.endsWith(API_PREFIX) ? raw : `${raw}${API_PREFIX}`;
}

/** GET mot Monotree med Bearer-auth. `path` er relativt til API-basen. */
export function monotreeGet<T>(path: string): Promise<T> {
  const token = requireEnv("MONOTREE_API_KEY");
  const url = `${getMonotreeBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  return fetchJsonServer<T>(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
}

/** Standard paginert liste-wrapper fra Monotree ({ data, links, meta }). */
export type MonotreeList<T> = {
  data?: T[];
  links?: { next?: string | null };
  meta?: { current_page?: number; last_page?: number; total?: number; per_page?: number };
};

export type MonotreeApiAuthor = {
  id?: number | string;
  name?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
};

export type MonotreeApiPost = {
  id: number | string;
  body?: string;
  wall_id?: number;
  wall_name?: string;
  author?: MonotreeApiAuthor | null;
  created_at?: string;
  updated_at?: string;
};

/**
 * Vegg-ID-ene som skal vises. Leser MONOTREE_WALL_IDS (komma-separert),
 * med MONOTREE_WALL_ID som fallback for én enkelt vegg.
 */
export function parseWallIds(): number[] {
  const raw = process.env.MONOTREE_WALL_IDS ?? process.env.MONOTREE_WALL_ID ?? "";
  return raw
    .split(",")
    .map((part) => Number(part.trim()))
    .filter((n) => Number.isFinite(n) && n > 0);
}

/** Henter innlegg fra én vegg. `status=published` er default i API-et, men vi er eksplisitte. */
export async function fetchWallPosts(wallId: number, perPage = 10): Promise<MonotreeApiPost[]> {
  const res = await monotreeGet<MonotreeList<MonotreeApiPost>>(
    `/walls/${wallId}/posts?per_page=${perPage}&status=published`,
  );
  return Array.isArray(res?.data) ? res.data : [];
}
