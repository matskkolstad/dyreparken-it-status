import type {
  AsanaMetrics,
  EnturDepartures,
  EsperDevices,
  LibreNmsSwitches,
  MonotreeFeed,
  NinjaOneAgents,
  WeatherCurrent,
  ZoinedGuests,
} from "@/lib/types";

const DUMMY_CYCLE_MS = 10_000;

const nowIso = () => new Date().toISOString();

const meta = () => ({ lastUpdatedAt: nowIso(), isDummyData: true as const });

const cycleIndex = (size: number) =>
  Math.floor(Date.now() / DUMMY_CYCLE_MS) % Math.max(size, 1);

const weatherSamples: Omit<WeatherCurrent, keyof ReturnType<typeof meta>>[] = [
  {
    locationName: "Dyreparken, Kristiansand",
    temperatureC: 17,
    condition: "Delvis skyet",
    windMs: 5.2,
  },
  {
    locationName: "Dyreparken, Kristiansand",
    temperatureC: 19,
    condition: "Klarvær",
    windMs: 3.4,
  },
  {
    locationName: "Dyreparken, Kristiansand",
    temperatureC: 13,
    condition: "Regnbyger",
    windMs: 7.8,
  },
  {
    locationName: "Dyreparken, Kristiansand",
    temperatureC: 9,
    condition: "Tåke",
    windMs: 1.6,
  },
];

export const dummyWeather = (): WeatherCurrent => ({
  ...meta(),
  ...weatherSamples[cycleIndex(weatherSamples.length)]!,
});

const asanaSamples: Omit<AsanaMetrics, keyof ReturnType<typeof meta>>[] = [
  { activeCount: 14, newTodayCount: 3, closedLast7DaysCount: 9 },
  { activeCount: 18, newTodayCount: 5, closedLast7DaysCount: 12 },
  { activeCount: 11, newTodayCount: 1, closedLast7DaysCount: 15 },
  { activeCount: 22, newTodayCount: 4, closedLast7DaysCount: 7 },
];

export const dummyAsana = (): AsanaMetrics => ({
  ...meta(),
  ...asanaSamples[cycleIndex(asanaSamples.length)]!,
});

const monotreeSamples: MonotreeFeed["posts"][] = [
  [
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
    {
      id: "post-4",
      title: "Oppgradering: Kameraer i Hakkebakkeskogen",
      publishedAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "post-5",
      title: "Incident: Kortterminal timeout i kiosker",
      publishedAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "post-6",
      title: "Planlagt: Oppdatering av AD-grupper",
      publishedAt: new Date(Date.now() - 35 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "post-7",
      title: "Status: Nytt overvakingsdashbord aktivert",
      publishedAt: new Date(Date.now() - 40 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "post-8",
      title: "Info: Nye rutiner for helpdesk",
      publishedAt: new Date(Date.now() - 45 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "post-9",
      title: "Vedlikehold: Backup verifikasjon kl 02:00",
      publishedAt: new Date(Date.now() - 50 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "post-10",
      title: "Status: Fiberlink stabilisert",
      publishedAt: new Date(Date.now() - 55 * 60 * 60 * 1000).toISOString(),
    },
  ],
  [
    {
      id: "post-11",
      title: "Oppgradering: WiFi AP i Kardemomme By",
      publishedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    },
    {
      id: "post-12",
      title: "Incident: Printerfeil i administrasjonen",
      publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "post-13",
      title: "Info: Utskifting av adgangskortlesere",
      publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "post-14",
      title: "Status: VPN-oppgradering fullfort",
      publishedAt: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "post-15",
      title: "Planlagt: Bytte av DNS forwarders",
      publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "post-16",
      title: "Info: Nytt inventarregister publisert",
      publishedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "post-17",
      title: "Incident: Sporadiske WiFi dropouts",
      publishedAt: new Date(Date.now() - 21 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "post-18",
      title: "Status: Oppdatering av kiosksystem",
      publishedAt: new Date(Date.now() - 27 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "post-19",
      title: "Planlagt: Patch av brannmurregler",
      publishedAt: new Date(Date.now() - 31 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "post-20",
      title: "Status: Lagerstyring synkronisert",
      publishedAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    },
  ],
  [
    {
      id: "post-21",
      title: "Planlagt restart av adgangskontroll 01:00",
      publishedAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    },
    {
      id: "post-22",
      title: "Status: Backup fullført uten feil",
      publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "post-23",
      title: "Ny infoskjemaversjon rullet ut",
      publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "post-24",
      title: "Incident: Timeout mot billettserver",
      publishedAt: new Date(Date.now() - 11 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "post-25",
      title: "Status: Oppdatert oversikt for API-nokler",
      publishedAt: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "post-26",
      title: "Planlagt: Utskifting av serverdisker",
      publishedAt: new Date(Date.now() - 19 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "post-27",
      title: "Info: Nye sikkerhetsretningslinjer",
      publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "post-28",
      title: "Incident: Kortvarig strømbrudd i sone B",
      publishedAt: new Date(Date.now() - 29 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "post-29",
      title: "Status: Nettside-cache nullstilt",
      publishedAt: new Date(Date.now() - 33 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "post-30",
      title: "Planlagt: Oppgradering av overvaking",
      publishedAt: new Date(Date.now() - 37 * 60 * 60 * 1000).toISOString(),
    },
  ],
  [
    {
      id: "post-31",
      title: "Status: Oppdatering av betalingsterminaler",
      publishedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    },
    {
      id: "post-32",
      title: "Incident: Ustabil VLAN for serverrom",
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "post-33",
      title: "Info: Ny prosedyre for adgangskontroll",
      publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "post-34",
      title: "Planlagt: Oppdatering av serverrom UPS",
      publishedAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "post-35",
      title: "Status: Kameraopptak synkronisert",
      publishedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "post-36",
      title: "Incident: Interne meldinger forsinket",
      publishedAt: new Date(Date.now() - 13 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "post-37",
      title: "Info: Oppdaterte sjekklister for nattvakt",
      publishedAt: new Date(Date.now() - 17 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "post-38",
      title: "Planlagt: Oppgradering av sensornett",
      publishedAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "post-39",
      title: "Status: Mobilnett failover testet",
      publishedAt: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "post-40",
      title: "Info: Nye driftsvinduer publisert",
      publishedAt: new Date(Date.now() - 34 * 60 * 60 * 1000).toISOString(),
    },
  ],
];

export const dummyMonotree = (): MonotreeFeed => ({
  ...meta(),
  posts: monotreeSamples[cycleIndex(monotreeSamples.length)]!,
});

const libreSamples: Omit<LibreNmsSwitches, keyof ReturnType<typeof meta>>[] = [
  {
    onlineCount: 36,
    offlineCount: 2,
    offline: [
      { name: "SW-TEKNISK-03", ip: "10.10.3.12" },
      { name: "SW-BADELAND-01", ip: "10.20.1.5" },
    ],
  },
  {
    onlineCount: 37,
    offlineCount: 1,
    offline: [{ name: "SW-PIRATEN-02", ip: "10.30.2.7" }],
  },
  {
    onlineCount: 34,
    offlineCount: 4,
    offline: [
      { name: "SW-ADMIN-01", ip: "10.10.1.21" },
      { name: "SW-ADMIN-02", ip: "10.10.1.22" },
      { name: "SW-BADELAND-04", ip: "10.20.1.9" },
      { name: "SW-INNGANG-01", ip: "10.40.1.4" },
    ],
  },
  {
    onlineCount: 38,
    offlineCount: 0,
    offline: [],
  },
];

export const dummyLibreNms = (): LibreNmsSwitches => ({
  ...meta(),
  ...libreSamples[cycleIndex(libreSamples.length)]!,
});

const ninjaSamples: Omit<NinjaOneAgents, keyof ReturnType<typeof meta>>[] = [
  {
    onlineCount: 128,
    offlineCount: 7,
    offline: [
      { name: "POS-04", status: "offline" },
      { name: "KASSE-12", status: "offline" },
      { name: "KIOSK-BADELAND-03", status: "down" },
      { name: "ADMIN-LAPTOP-22", status: "offline" },
      { name: "INFO-SKJERM-7", status: "offline" },
      { name: "TERMINAL-PRINTER-2", status: "down" },
      { name: "BACKOFFICE-PC-9", status: "offline" },
    ],
  },
  {
    onlineCount: 131,
    offlineCount: 4,
    offline: [
      { name: "POS-04", status: "offline" },
      { name: "KIOSK-BADELAND-03", status: "down" },
      { name: "INFO-SKJERM-7", status: "offline" },
      { name: "TERMINAL-PRINTER-2", status: "down" },
    ],
  },
  {
    onlineCount: 125,
    offlineCount: 10,
    offline: [
      { name: "POS-04", status: "offline" },
      { name: "KASSE-12", status: "offline" },
      { name: "KIOSK-BADELAND-03", status: "down" },
      { name: "ADMIN-LAPTOP-22", status: "offline" },
      { name: "INFO-SKJERM-7", status: "offline" },
      { name: "TERMINAL-PRINTER-2", status: "down" },
      { name: "BACKOFFICE-PC-9", status: "offline" },
      { name: "BILLETT-PC-1", status: "offline" },
      { name: "BILLETT-PC-2", status: "offline" },
      { name: "SCANNER-ENTRANCE-5", status: "down" },
    ],
  },
  {
    onlineCount: 133,
    offlineCount: 2,
    offline: [
      { name: "POS-04", status: "offline" },
      { name: "TERMINAL-PRINTER-2", status: "down" },
    ],
  },
];

export const dummyNinjaOne = (): NinjaOneAgents => ({
  ...meta(),
  ...ninjaSamples[cycleIndex(ninjaSamples.length)]!,
});

const esperSamples: Omit<EsperDevices, keyof ReturnType<typeof meta>>[] = [
  {
    onlineCount: 54,
    offlineCount: 1,
    offline: [{ name: "TAB-ENTRANCE-3", status: "offline" }],
  },
  {
    onlineCount: 52,
    offlineCount: 3,
    offline: [
      { name: "TAB-ENTRANCE-3", status: "offline" },
      { name: "KIOSK-TAB-8", status: "disconnected" },
      { name: "STAFF-TAB-2", status: "offline" },
    ],
  },
  {
    onlineCount: 55,
    offlineCount: 0,
    offline: [],
  },
  {
    onlineCount: 50,
    offlineCount: 5,
    offline: [
      { name: "TAB-ENTRANCE-3", status: "offline" },
      { name: "KIOSK-TAB-8", status: "disconnected" },
      { name: "STAFF-TAB-2", status: "offline" },
      { name: "TAB-FOODCOURT-1", status: "offline" },
      { name: "TAB-FOODCOURT-2", status: "offline" },
    ],
  },
];

export const dummyEsper = (): EsperDevices => ({
  ...meta(),
  ...esperSamples[cycleIndex(esperSamples.length)]!,
});

const zoinedSamples: Omit<ZoinedGuests, keyof ReturnType<typeof meta>>[] = [
  { dyreparkenGuests: 3842, badelandGuests: 1298 },
  { dyreparkenGuests: 4021, badelandGuests: 1410 },
  { dyreparkenGuests: 3650, badelandGuests: 1105 },
  { dyreparkenGuests: 4212, badelandGuests: 1522 },
];

export const dummyZoined = (): ZoinedGuests => ({
  ...meta(),
  ...zoinedSamples[cycleIndex(zoinedSamples.length)]!,
});

const enturSamples: Omit<EnturDepartures, keyof ReturnType<typeof meta>>[] = [
  {
    stopName: "Dyreparken",
    departures: [
      {
        id: "entur-1",
        line: "M1",
        destination: "Kvadraturen",
        departureTime: new Date(Date.now() + 3 * 60 * 1000).toISOString(),
        minutesUntilDeparture: 3,
        isRealtime: true,
      },
      {
        id: "entur-2",
        line: "100",
        destination: "Lillesand",
        departureTime: new Date(Date.now() + 9 * 60 * 1000).toISOString(),
        minutesUntilDeparture: 9,
        isRealtime: false,
      },
      {
        id: "entur-3",
        line: "M1",
        destination: "Universitetet",
        departureTime: new Date(Date.now() + 14 * 60 * 1000).toISOString(),
        minutesUntilDeparture: 14,
        isRealtime: true,
      },
      {
        id: "entur-4",
        line: "200",
        destination: "Søgne",
        departureTime: new Date(Date.now() + 21 * 60 * 1000).toISOString(),
        minutesUntilDeparture: 21,
        isRealtime: true,
      },
    ],
  },
  {
    stopName: "Dyreparken",
    departures: [
      {
        id: "entur-5",
        line: "M1",
        destination: "Kvadraturen",
        departureTime: new Date(Date.now() + 1 * 60 * 1000).toISOString(),
        minutesUntilDeparture: 1,
        isRealtime: true,
      },
      {
        id: "entur-6",
        line: "100",
        destination: "Lillesand",
        departureTime: new Date(Date.now() + 6 * 60 * 1000).toISOString(),
        minutesUntilDeparture: 6,
        isRealtime: true,
      },
      {
        id: "entur-7",
        line: "M1",
        destination: "Universitetet",
        departureTime: new Date(Date.now() + 12 * 60 * 1000).toISOString(),
        minutesUntilDeparture: 12,
        isRealtime: false,
      },
      {
        id: "entur-8",
        line: "200",
        destination: "Søgne",
        departureTime: new Date(Date.now() + 20 * 60 * 1000).toISOString(),
        minutesUntilDeparture: 20,
        isRealtime: true,
      },
    ],
  },
  {
    stopName: "Dyreparken",
    departures: [
      {
        id: "entur-9",
        line: "M1",
        destination: "Kvadraturen",
        departureTime: new Date(Date.now() + 4 * 60 * 1000).toISOString(),
        minutesUntilDeparture: 4,
        isRealtime: false,
      },
      {
        id: "entur-10",
        line: "100",
        destination: "Lillesand",
        departureTime: new Date(Date.now() + 11 * 60 * 1000).toISOString(),
        minutesUntilDeparture: 11,
        isRealtime: true,
      },
      {
        id: "entur-11",
        line: "M1",
        destination: "Universitetet",
        departureTime: new Date(Date.now() + 18 * 60 * 1000).toISOString(),
        minutesUntilDeparture: 18,
        isRealtime: true,
      },
      {
        id: "entur-12",
        line: "200",
        destination: "Søgne",
        departureTime: new Date(Date.now() + 24 * 60 * 1000).toISOString(),
        minutesUntilDeparture: 24,
        isRealtime: false,
      },
    ],
  },
  {
    stopName: "Dyreparken",
    departures: [
      {
        id: "entur-13",
        line: "M1",
        destination: "Kvadraturen",
        departureTime: new Date(Date.now() + 2 * 60 * 1000).toISOString(),
        minutesUntilDeparture: 2,
        isRealtime: true,
      },
      {
        id: "entur-14",
        line: "100",
        destination: "Lillesand",
        departureTime: new Date(Date.now() + 8 * 60 * 1000).toISOString(),
        minutesUntilDeparture: 8,
        isRealtime: false,
      },
      {
        id: "entur-15",
        line: "M1",
        destination: "Universitetet",
        departureTime: new Date(Date.now() + 13 * 60 * 1000).toISOString(),
        minutesUntilDeparture: 13,
        isRealtime: true,
      },
      {
        id: "entur-16",
        line: "200",
        destination: "Søgne",
        departureTime: new Date(Date.now() + 27 * 60 * 1000).toISOString(),
        minutesUntilDeparture: 27,
        isRealtime: true,
      },
    ],
  },
];

export const dummyEntur = (): EnturDepartures => ({
  ...meta(),
  ...enturSamples[cycleIndex(enturSamples.length)]!,
});
