import { NextResponse } from "next/server";

import { dummyMonotree } from "@/lib/dummy-data";
import { isDummyDataEnabled } from "@/lib/server/env";
import {
  fetchWallPosts,
  parseWallIds,
  type MonotreeApiPost,
} from "@/lib/server/monotree";
import type { MonotreeFeed, MonotreePost } from "@/lib/types";

// Innlegg hentes per forespørsel; ingen caching (statustavle skal være fersk).
export const dynamic = "force-dynamic";

// "IT"-veggen. Kan overstyres/utvides med MONOTREE_WALL_IDS i env.
const DEFAULT_WALL_IDS = [192];
const POSTS_PER_WALL = 10;
const MAX_POSTS = 10;

/** Deler et innlegg i tittel (første tekstlinje) og resten som utdrag. */
function splitBody(body: string): { title: string; rest: string } {
  const lines = body
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const title = lines[0] ?? "";
  const rest = lines.slice(1).join(" ").trim();
  return { title, rest };
}

function normalizePost(p: MonotreeApiPost): MonotreePost | null {
  const body = (p.body ?? "").trim();
  // Hopp over innlegg uten tekst (f.eks. rene bildeposter) – de gir tomme kort.
  if (!body) return null;

  const { title, rest } = splitBody(body);
  const created = p.created_at ?? p.updated_at ?? new Date().toISOString();

  return {
    id: String(p.id),
    title: title || "Uten tittel",
    body: rest || undefined,
    publishedAt: new Date(created).toISOString(),
    author: p.author?.name?.trim() || undefined,
    avatarUrl: p.author?.avatar_url || undefined,
    wallId: typeof p.wall_id === "number" ? p.wall_id : undefined,
    wallName: p.wall_name?.trim() || undefined,
  };
}

export async function GET() {
  if (isDummyDataEnabled()) {
    return NextResponse.json(dummyMonotree());
  }

  const configured = parseWallIds();
  const wallIds = configured.length ? configured : DEFAULT_WALL_IDS;

  // Hent alle vegger parallelt. Én vegg som feiler skal ikke velte hele feeden,
  // men hvis ALLE feiler lar vi feilen boble opp slik at modulen viser "Feil".
  const settled = await Promise.allSettled(
    wallIds.map((id) => fetchWallPosts(id, POSTS_PER_WALL)),
  );

  if (settled.length > 0 && settled.every((r) => r.status === "rejected")) {
    const firstError = settled.find(
      (r): r is PromiseRejectedResult => r.status === "rejected",
    );
    throw firstError?.reason ?? new Error("Kunne ikke hente innlegg fra Monotree.");
  }

  const posts = settled
    .flatMap((r) => (r.status === "fulfilled" ? r.value : []))
    .map(normalizePost)
    .filter((p): p is MonotreePost => p !== null)
    // Nyeste først – viktig når vi slår sammen flere vegger.
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, MAX_POSTS);

  const result: MonotreeFeed = {
    lastUpdatedAt: new Date().toISOString(),
    isDummyData: false,
    posts,
  };

  return NextResponse.json(result);
}
