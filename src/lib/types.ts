export type ModuleSeverity = "ok" | "degraded" | "down" | "unknown";

export type DashboardModuleId =
  | "weather"
  | "asana"
  | "monotree"
  | "news"
  | "librenms"
  | "libre-graylog"
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
  latestTasks: AsanaTaskSummary[];
};

export type AsanaTaskSummary = {
  id: string;
  name: string;
  createdAt: string;
  url?: string;
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

export type NewsItem = {
  id: string;
  source: string;
  title: string;
  summary: string;
  publishedAt: string;
  url?: string;
};

export type NewsFeed = ApiMeta & {
  items: NewsItem[];
};

export type LibreNmsAlert = {
  id: string;
  device: string;
  message: string;
  timestamp: string;
  severity?: string;
  state?: string;
};

export type LibreNmsSwitches = ApiMeta & {
  onlineCount: number;
  offlineCount: number;
  offline: { name: string; ip?: string }[];
  alerts: LibreNmsAlert[];
  alertHistory: LibreNmsAlert[];
};

export type LibreNmsGraylogEntry = {
  id: string;
  origin: string;
  timestamp: string;
  level?: string;
  source?: string;
  message: string;
  facility?: string;
};

export type LibreNmsGraylog = ApiMeta & {
  entries: LibreNmsGraylogEntry[];
};

export type NinjaOneAgents = ApiMeta & {
  onlineCount: number;
  offlineCount: number;
  offline: { name: string; status?: string }[];
};

export type EsperDevices = ApiMeta & {
  onlineCount: number;
  offlineCount: number;
  offline: { name: string; lastSeenAt?: string }[];
};

export type ZoinedGuests = ApiMeta & {
  dyreparkenGuests: number;
  badelandGuests: number;
};

export type EnturDeparture = {
  id: string;
  line: string;
  destination: string;
  stopName: string;
  platform?: string;
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

export type OpeningHours = ApiMeta & {
  dyreparken: string;
  badeland: string;
  sourceUrl: string;
};
