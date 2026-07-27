import { readFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

// Serverer bildefiler fra public/bilder via API-et, fordi `next start`
// ikke serverer filer som legges i public etter bygget.
export const dynamic = "force-dynamic";

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
};

export async function GET(_req: Request, ctx: RouteContext<"/api/bilder/[name]">) {
  const { name } = await ctx.params;
  // path.basename fjerner eventuelle path-komponenter (ingen traversering).
  const fileName = path.basename(name);
  const contentType = CONTENT_TYPES[path.extname(fileName).toLowerCase()];
  if (!contentType) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const data = await readFile(path.join(process.cwd(), "public", "bilder", fileName));
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
