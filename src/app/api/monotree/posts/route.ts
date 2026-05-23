import { NextResponse } from "next/server";

import { dummyMonotree } from "@/lib/dummy-data";
import { isDummyDataEnabled, requireEnv } from "@/lib/server/env";
import { fetchJsonServer } from "@/lib/server/fetch";
import type { MonotreeFeed, MonotreePost } from "@/lib/types";

type MonotreeRawPost = {
  id?: string;
  title?: string;
  publishedAt?: string;
  published_at?: string;
  url?: string;
};

type AnyMonotreePostsResponse =
  | { posts?: MonotreeRawPost[] }
  | { data?: MonotreeRawPost[] }
  | MonotreeRawPost[];

function normalizePost(p: MonotreeRawPost, index: number): MonotreePost {
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

  const items: MonotreeRawPost[] = Array.isArray(raw)
    ? raw
    : Array.isArray((raw as { posts?: MonotreeRawPost[] }).posts)
      ? (raw as { posts: MonotreeRawPost[] }).posts
      : Array.isArray((raw as { data?: MonotreeRawPost[] }).data)
        ? (raw as { data: MonotreeRawPost[] }).data
        : [];

  const result: MonotreeFeed = {
    lastUpdatedAt: new Date().toISOString(),
    isDummyData: false,
    posts: items.slice(0, 10).map(normalizePost),
  };

  return NextResponse.json(result);
}

