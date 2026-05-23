import { NextResponse } from "next/server";

import { dummyAsana } from "@/lib/dummy-data";
import { isDummyDataEnabled, requireEnv } from "@/lib/server/env";
import { fetchJsonServer } from "@/lib/server/fetch";
import type { AsanaMetrics } from "@/lib/types";

type AsanaTasksResponse = {
  data: { gid: string }[];
  next_page?: { offset?: string } | null;
};

type AsanaTaskDetailsResponse = {
  data: {
    gid: string;
    completed: boolean;
    created_at?: string;
    completed_at?: string | null;
  };
};

async function asanaGet<T>(path: string, token: string) {
  const url = `https://app.asana.com/api/1.0${path}`;
  return fetchJsonServer<T>(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function GET() {
  if (isDummyDataEnabled()) {
    return NextResponse.json(dummyAsana());
  }

  const token = requireEnv("ASANA_ACCESS_TOKEN");
  const projectGid = requireEnv("ASANA_PROJECT_GID");

  const sinceIso = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();
  const todayStart = startOfDay(new Date()).getTime();

  // 1) List task IDs from the project (paginate).
  const taskIds: string[] = [];
  let offset: string | undefined;
  for (let i = 0; i < 5; i += 1) {
    const page = await asanaGet<AsanaTasksResponse>(
      `/projects/${encodeURIComponent(projectGid)}/tasks?completed_since=${encodeURIComponent(
        sinceIso,
      )}&limit=100${offset ? `&offset=${encodeURIComponent(offset)}` : ""}`,
      token,
    );
    for (const t of page.data) taskIds.push(t.gid);
    offset = page.next_page?.offset ?? undefined;
    if (!offset) break;
  }

  // 2) Fetch details in batches and compute metrics.
  let activeCount = 0;
  let newTodayCount = 0;
  let closedLast7DaysCount = 0;

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  for (const gid of taskIds.slice(0, 500)) {
    const details = await asanaGet<AsanaTaskDetailsResponse>(
      `/tasks/${encodeURIComponent(gid)}?opt_fields=completed,created_at,completed_at`,
      token,
    );

    const createdAt = details.data.created_at ? Date.parse(details.data.created_at) : undefined;
    const completedAt = details.data.completed_at ? Date.parse(details.data.completed_at) : undefined;

    if (!details.data.completed) activeCount += 1;
    if (createdAt !== undefined && createdAt >= todayStart) newTodayCount += 1;
    if (completedAt !== undefined && completedAt >= sevenDaysAgo) closedLast7DaysCount += 1;
  }

  const result: AsanaMetrics = {
    lastUpdatedAt: new Date().toISOString(),
    isDummyData: false,
    activeCount,
    newTodayCount,
    closedLast7DaysCount,
  };

  return NextResponse.json(result);
}

