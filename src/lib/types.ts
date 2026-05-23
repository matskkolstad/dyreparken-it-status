export type ModuleSeverity = "ok" | "degraded" | "down" | "unknown";

export type DashboardModuleId =
  | "weather"
  | "asana"
  | "monotree"
  | "librenms"
  | "ninjaone"
  | "esper"
  | "zoined";

export type DashboardPage = {
  id: string;
  title: string;
  modules: DashboardModuleId[];
};

export type ApiMeta = {
  lastUpdatedAt: string;
  isDummyData: boolean;
};

export type WeatherCurrent = ApiMeta & {
  locationName: string;
  temperatureC: number;
  condition: string;
  windMs: number;
};

export type AsanaMetrics = ApiMeta & {
  activeCount: number;
  newTodayCount: number;
  closedLast7DaysCount: number;
};

export type MonotreePost = {
  id: string;
  title: string;
  publishedAt: string;
  url?: string;
};

export type MonotreeFeed = ApiMeta & {
  posts: MonotreePost[];
};

export type LibreNmsSwitches = ApiMeta & {
  onlineCount: number;
  offlineCount: number;
  offline: { name: string; ip?: string }[];
};

export type NinjaOneAgents = ApiMeta & {
  onlineCount: number;
  offlineCount: number;
};

export type EsperDevices = ApiMeta & {
  onlineCount: number;
  offlineCount: number;
};

export type ZoinedGuests = ApiMeta & {
  dyreparkenGuests: number;
  badelandGuests: number;
};
