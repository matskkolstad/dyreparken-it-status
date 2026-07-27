import { readdir } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

import type { BilderFeed } from "@/lib/types";

// Bildene leses fra public/bilder på serveren ved hver forespørsel,
// slik at nye bilder plukkes opp uten rebuild.
export const dynamic = "force-dynamic";

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);

export async function GET() {
  const dir = path.join(process.cwd(), "public", "bilder");

  let files: string[] = [];
  try {
    files = await readdir(dir);
  } catch {
    files = [];
  }

  const images = files
    .filter((file) => IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, "nb"))
    .map((name) => ({
      id: name,
      name,
      url: `/api/bilder/${encodeURIComponent(name)}`,
    }));

  const result: BilderFeed = {
    lastUpdatedAt: new Date().toISOString(),
    isDummyData: false,
    images,
  };

  return NextResponse.json(result);
}
