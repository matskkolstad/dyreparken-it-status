import type { DashboardModuleId, DashboardPage } from "@/lib/types";

export const DEFAULT_REFRESH_INTERVAL_MS =
  process.env.NODE_ENV === "production" ? 60_000 : 10_000;

export const DASHBOARD_PAGES: DashboardPage[] = [
  {
    id: "oversikt",
    title: "Full oversikt",
    modules: [
      "asana",
      "monotree",
      "news",
      "librenms",
      "libre-graylog",
      "ninjaone",
      "esper",
      "zoined",
      "entur",
    ] satisfies DashboardModuleId[],
  },
  {
    id: "infrastruktur",
    title: "Infrastruktur & Nettverk",
    modules: [
      "librenms",
      "libre-graylog",
      "ninjaone",
      "esper",
    ] satisfies DashboardModuleId[],
  },
  {
    id: "drift",
    title: "Drift & Gjester",
    modules: [
      "weather",
      "asana",
      "monotree",
      "news",
      "zoined",
      "entur",
    ] satisfies DashboardModuleId[],
  },
];

export const DEFAULT_ROTATION_ENABLED = DASHBOARD_PAGES.length > 1;
export const DEFAULT_PAGE_DURATION_SECONDS = 30;
