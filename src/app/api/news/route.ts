import { NextResponse } from "next/server";

import { dummyNews } from "@/lib/dummy-data";
import { isDummyDataEnabled } from "@/lib/server/env";
import type { NewsFeed, NewsItem } from "@/lib/types";

type FeedSource = {
  name: string;
  url: string;
};

const FEEDS: FeedSource[] = [
  { name: "Digi.no", url: "https://www.digi.no/feeds/general.xml" },
  { name: "Teknisk Ukeblad", url: "https://www.tu.no/feeds/general.xml" },
  { name: "Tek.no", url: "http://www.tek.no/feeds/general.xml" },
  { name: "VG", url: "https://www.vg.no/rss/feed/?format=rss" },
];

const SOURCE_LIMITS: Record<string, number> = {
  "VG": 3,
};

async function fetchText(url: string, timeoutMs = 12_000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`RSS request failed: ${response.status} ${response.statusText}${text ? ` • ${text}` : ""}`);
    }

    return await response.text();
  } finally {
    clearTimeout(timer);
  }
}

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(Number(num)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

function stripTags(value: string) {
  return value.replace(/<[^>]*>/g, " ");
}

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function extractTag(source: string, tag: string) {
  const safeTag = tag.replace(/:/g, "\\:");
  const match = new RegExp(`<${safeTag}[^>]*>([\\s\\S]*?)<\\/${safeTag}>`, "i").exec(source);
  if (!match) return undefined;
  return match[1];
}

function extractAllItems(xml: string) {
  const items: string[] = [];
  const regex = /<item[\s\S]*?<\/item>/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(xml))) {
    items.push(match[0]);
  }
  return items;
}

function parseDate(value?: string) {
  if (!value) return undefined;
  const normalized = value.trim();
  const parsed = Date.parse(normalized);
  if (Number.isFinite(parsed)) return new Date(parsed).toISOString();
  return undefined;
}

function toSummary(html?: string) {
  if (!html) return "";
  const unwrapped = html.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");
  const cleaned = normalizeWhitespace(stripTags(decodeHtml(unwrapped)));
  return cleaned.slice(0, 220);
}

function mapItem(itemXml: string, sourceName: string, index: number): NewsItem | null {
  const title = extractTag(itemXml, "title");
  const link = extractTag(itemXml, "link");
  const description = extractTag(itemXml, "description") ?? extractTag(itemXml, "content:encoded");
  const pubDate = extractTag(itemXml, "pubDate") ?? extractTag(itemXml, "dc:date");
  const publishedAt = parseDate(pubDate) ?? new Date().toISOString();

  if (!title) return null;

  const summary = toSummary(description);
  const cleanTitle = normalizeWhitespace(stripTags(decodeHtml(title)));

  return {
    id: `${sourceName}-${index}-${cleanTitle}`,
    source: sourceName,
    title: cleanTitle,
    summary,
    publishedAt,
    url: link ? decodeHtml(link.trim()) : undefined,
  };
}

async function fetchFeed(source: FeedSource): Promise<NewsItem[]> {
  const xml = await fetchText(source.url);
  const items = extractAllItems(xml);
  const parsed = items
    .map((item, index) => mapItem(item, source.name, index))
    .filter((item): item is NewsItem => Boolean(item));
  return parsed;
}

export async function GET() {
  if (isDummyDataEnabled()) {
    return NextResponse.json(dummyNews());
  }

  const results = await Promise.allSettled(FEEDS.map((feed) => fetchFeed(feed)));
  const items = results.flatMap((result) => (result.status === "fulfilled" ? result.value : []));
  const sorted = items.sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
  const counts = new Map<string, number>();
  const limited = sorted.filter((item) => {
    const limit = SOURCE_LIMITS[item.source] ?? Infinity;
    const current = counts.get(item.source) ?? 0;
    if (current >= limit) return false;
    counts.set(item.source, current + 1);
    return true;
  });

  const result: NewsFeed = {
    lastUpdatedAt: new Date().toISOString(),
    isDummyData: false,
    items: limited.slice(0, 10),
  };

  return NextResponse.json(result);
}
