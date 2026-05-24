export type ModuleSeverity = "ok" | "degraded" | "down" | "unknown";

export type DashboardModuleId =
  | "weather"
  | "asana"
  | "monotree"
  | "librenms"
  | "ninjaone"
  | "esper"
  | "zoined"
  | "entur";

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
  offline: { name: string; status?: string }[];
};

export type EsperDevices = ApiMeta & {
  onlineCount: number;
  offlineCount: number;
  offline: { name: string; status?: string }[];
};

export type ZoinedGuests = ApiMeta & {
  dyreparkenGuests: number;
  badelandGuests: number;
};

export type EnturDeparture = {
  id: string;
  line: string;
  destination: string;
  departureTime: string;
  aimedDepartureTime?: string;
  minutesUntilDeparture: number;
  delayMinutes?: number;
  isRealtime: boolean;
};

export type EnturDepartures = ApiMeta & {
  stopName: string;
  departures: EnturDeparture[];
};
