import { NextResponse } from "next/server";

import { dummyAsana } from "@/lib/dummy-data";
import { isDummyDataEnabled, requireEnv } from "@/lib/server/env";
import { fetchJsonServer } from "@/lib/server/fetch";
import type { AsanaMetrics } from "@/lib/types";

type AsanaTasksResponse = {
  data: {
    gid: string;
    completed: boolean;
    created_at?: string;
    completed_at?: string | null;
    name: string;
    permalink_url?: string;
  }[];
  next_page?: { offset?: string } | null;
};

const CACHE_TTL_MS = 60_000;
let cachedMetrics: { data: AsanaMetrics; ts: number } | null = null;
let inflightRequest: Promise<AsanaMetrics> | null = null;

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

  if (cachedMetrics && Date.now() - cachedMetrics.ts < CACHE_TTL_MS) {
    return NextResponse.json(cachedMetrics.data);
  }

  if (inflightRequest) {
    const data = await inflightRequest;
    return NextResponse.json(data);
  }

  inflightRequest = (async () => {
    const token = requireEnv("ASANA_ACCESS_TOKEN");
    const projectGid = requireEnv("ASANA_PROJECT_GID");

    const sinceIso = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();
    const todayStart = startOfDay(new Date()).getTime();

  // 1) List task IDs from the project (paginate).
    const tasks: AsanaTasksResponse["data"] = [];
    let offset: string | undefined;
    for (let i = 0; i < 5; i += 1) {
      const page = await asanaGet<AsanaTasksResponse>(
        `/projects/${encodeURIComponent(projectGid)}/tasks?completed_since=${encodeURIComponent(
          sinceIso,
        )}&limit=100&opt_fields=completed,created_at,completed_at,name,permalink_url${
          offset ? `&offset=${encodeURIComponent(offset)}` : ""
        }`,
        token,
      );
      tasks.push(...page.data);
      offset = page.next_page?.offset ?? undefined;
      if (!offset) break;
    }

  // 2) Fetch details in batches and compute metrics.
    let activeCount = 0;
    let newTodayCount = 0;
    let closedLast7DaysCount = 0;

    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    for (const task of tasks.slice(0, 500)) {
      const createdAt = task.created_at ? Date.parse(task.created_at) : undefined;
      const completedAt = task.completed_at ? Date.parse(task.completed_at) : undefined;

      if (!task.completed) activeCount += 1;
      if (createdAt !== undefined && createdAt >= todayStart) newTodayCount += 1;
      if (completedAt !== undefined && completedAt >= sevenDaysAgo) closedLast7DaysCount += 1;
    }

    const latestTasks = tasks
      .filter((task) => task.created_at && !task.completed)
      .sort((a, b) => (a.created_at && b.created_at ? b.created_at.localeCompare(a.created_at) : 0))
      .slice(0, 5)
      .map((task) => ({
        id: task.gid,
        name: task.name,
        createdAt: task.created_at!,
        url: task.permalink_url,
      }));

    return {
      lastUpdatedAt: new Date().toISOString(),
      isDummyData: false,
      activeCount,
      newTodayCount,
      closedLast7DaysCount,
      latestTasks,
    } satisfies AsanaMetrics;
  })();

  try {
    const data = await inflightRequest;
    cachedMetrics = { data, ts: Date.now() };
    return NextResponse.json(data);
  } finally {
    inflightRequest = null;
  }
}

