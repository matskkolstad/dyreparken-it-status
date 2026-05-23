import type {
  AsanaMetrics,
  EsperDevices,
  LibreNmsSwitches,
  MonotreeFeed,
  NinjaOneAgents,
  WeatherCurrent,
  ZoinedGuests,
} from "@/lib/types";

const nowIso = () => new Date().toISOString();

const meta = () => ({ lastUpdatedAt: nowIso(), isDummyData: true as const });

export const dummyWeather = (): WeatherCurrent => ({
  ...meta(),
  locationName: "Dyreparken, Kristiansand",
  temperatureC: 17,
  condition: "Delvis skyet",
  windMs: 5.2,
});

export const dummyAsana = (): AsanaMetrics => ({
  ...meta(),
  activeCount: 14,
  newTodayCount: 3,
  closedLast7DaysCount: 9,
});

export const dummyMonotree = (): MonotreeFeed => ({
  ...meta(),
  posts: [
    {
      id: "post-1",
      title: "Vedlikehold: Nettverk core-switcher kl 23:00",
      publishedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    },
    {
      id: "post-2",
      title: "Ny rutine for passordbytte (IT)",
      publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "post-3",
      title: "Status: POS oppdatering fullført",
      publishedAt: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
    },
  ],
});

export const dummyLibreNms = (): LibreNmsSwitches => ({
  ...meta(),
  onlineCount: 36,
  offlineCount: 2,
  offline: [
    { name: "SW-TEKNISK-03", ip: "10.10.3.12" },
    { name: "SW-BADELAND-01", ip: "10.20.1.5" },
  ],
});

export const dummyNinjaOne = (): NinjaOneAgents => ({
  ...meta(),
  onlineCount: 128,
  offlineCount: 7,
});

export const dummyEsper = (): EsperDevices => ({
  ...meta(),
  onlineCount: 54,
  offlineCount: 1,
});

export const dummyZoined = (): ZoinedGuests => ({
  ...meta(),
  dyreparkenGuests: 3842,
  badelandGuests: 1298,
});
