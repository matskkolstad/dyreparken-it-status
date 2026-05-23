import { NextResponse } from "next/server";

import { dummyMonotree } from "@/lib/dummy-data";
import { isDummyDataEnabled, requireEnv } from "@/lib/server/env";
import { fetchJsonServer } from "@/lib/server/fetch";
import type { MonotreeFeed, MonotreePost } from "@/lib/types";

type AnyMonotreePostsResponse =
  | { posts?: { id?: string; title?: string; publishedAt?: string; published_at?: string; url?: string }[] }
  | { data?: { id?: string; title?: string; publishedAt?: string; published_at?: string; url?: string }[] }
  | { id?: string; title?: string; publishedAt?: string; published_at?: string; url?: string }[];

function normalizePost(p: any, index: number): MonotreePost {
  const publishedAt = p?.publishedAt ?? p?.published_at ?? new Date().toISOString();
  return {
    id: String(p?.id ?? `post-${index}`),
    title: String(p?.title ?? "Uten tittel"),
    publishedAt: new Date(publishedAt).toISOString(),
    url: typeof p?.url === "string" ? p.url : undefined,
  };
}

export async function GET() {
  if (isDummyDataEnabled()) {
    return NextResponse.json(dummyMonotree());
  }

  // Integration mode: provide a URL that returns latest posts from Monotree (or a proxy).
  // Example: MONOTREE_POSTS_URL=https://<monotree>/api/posts?limit=10
  const url = requireEnv("MONOTREE_POSTS_URL");

  const raw = await fetchJsonServer<AnyMonotreePostsResponse>(url, {
    headers: process.env.MONOTREE_API_KEY
      ? { Authorization: `Bearer ${process.env.MONOTREE_API_KEY}` }
      : undefined,
  });

  const items = Array.isArray(raw)
    ? raw
    : Array.isArray((raw as any).posts)
      ? (raw as any).posts
      : Array.isArray((raw as any).data)
        ? (raw as any).data
        : [];

  const result: MonotreeFeed = {
    lastUpdatedAt: new Date().toISOString(),
    isDummyData: false,
    posts: items.slice(0, 10).map(normalizePost),
  };

  return NextResponse.json(result);
}

