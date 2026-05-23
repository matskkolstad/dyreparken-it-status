import type { DashboardModuleId, DashboardPage } from "@/lib/types";

export const DEFAULT_REFRESH_INTERVAL_MS = 60_000;

export const DASHBOARD_PAGES: DashboardPage[] = [
  {
    id: "infrastruktur",
    title: "Infrastruktur & Nettverk",
    modules: [
      "weather",
      "librenms",
      "ninjaone",
      "esper",
    ] satisfies DashboardModuleId[],
  },
  {
    id: "drift",
    title: "Drift & Gjester",
    modules: [
      "asana",
      "monotree",
      "zoined",
    ] satisfies DashboardModuleId[],
  },
];

export const DEFAULT_ROTATION_ENABLED = DASHBOARD_PAGES.length > 1;
export const DEFAULT_PAGE_DURATION_SECONDS = 20;
