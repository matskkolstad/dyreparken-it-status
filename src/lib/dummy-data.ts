import type {
  AsanaMetrics,
  EnturDepartures,
  EsperDevices,
  LibreNmsSwitches,
  LibreNmsAlert,
  LibreNmsGraylog,
  MonotreeFeed,
  NewsFeed,
  NinjaOneAgents,
  WeatherCurrent,
  OpeningHours,
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

export const dummyOpeningHours = (): OpeningHours => ({
  ...meta(),
  dyreparken: "10:00 - 18:00",
  badeland: "10:00 - 19:00",
  sourceUrl: "https://www.dyreparken.no/apningstider-og-priser/",
});

const asanaSamples: Omit<AsanaMetrics, keyof ReturnType<typeof meta>>[] = [
  {
    activeCount: 14,
    newTodayCount: 3,
    closedLast7DaysCount: 9,
    latestTasks: [
      {
        id: "task-1",
        name: "Oppdatere adgangskort for ny sesong",
        createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
      },
      {
        id: "task-2",
        name: "Klargjore WiFi AP i Kardemomme By",
        createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      },
      {
        id: "task-3",
        name: "Sjekk overvaking i Dyreparkhotellet",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "task-4",
        name: "Opprette konto til ny sesongleder",
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "task-5",
        name: "Planlegge patch av kiosksystem",
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    activeCount: 18,
    newTodayCount: 5,
    closedLast7DaysCount: 12,
    latestTasks: [
      {
        id: "task-6",
        name: "Oppdatere printerdrivere administrasjon",
        createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
      },
      {
        id: "task-7",
        name: "Teste failover for fiberlinje",
        createdAt: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
      },
      {
        id: "task-8",
        name: "Legge til nye kameraer i Zoined",
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "task-9",
        name: "Oppdatere info til vertskap",
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "task-10",
        name: "Sjekk status pa kiosknettverk",
        createdAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    activeCount: 11,
    newTodayCount: 1,
    closedLast7DaysCount: 15,
    latestTasks: [
      {
        id: "task-11",
        name: "Opprette gjestekonto for arrangement",
        createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      },
      {
        id: "task-12",
        name: "Oppfolging av billetteringsfeil",
        createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      },
      {
        id: "task-13",
        name: "Oppdatere nettverk i Dyreparkcamp",
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "task-14",
        name: "Planlegge endpoint-oppgradering",
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "task-15",
        name: "Sjekk backup for POS",
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    activeCount: 22,
    newTodayCount: 4,
    closedLast7DaysCount: 7,
    latestTasks: [
      {
        id: "task-16",
        name: "Patch av domenekontrollere",
        createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      },
      {
        id: "task-17",
        name: "Kontrollere WiFi i akvariet",
        createdAt: new Date(Date.now() - 70 * 60 * 1000).toISOString(),
      },
      {
        id: "task-18",
        name: "Oppgradere kioskapper",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "task-19",
        name: "Oppdatere rutine for vakttelefon",
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "task-20",
        name: "Sjekk av overvaking i Vestkanten",
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
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

const newsSamples: Omit<NewsFeed, keyof ReturnType<typeof meta>>[] = [
  {
    items: [
      {
        id: "news-1",
        source: "Digi.no",
        title: "Nye krav til sikkerhet i offentlig sektor",
        summary: "Kort oppsummering av nye sikkerhetskrav og hva det betyr for IT-avdelinger.",
        publishedAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
      },
      {
        id: "news-2",
        source: "Teknisk Ukeblad",
        title: "Datacentereffektivitet tar nytt steg",
        summary: "Energisparing og smartere kjoling er hovedtema i ny rapport.",
        publishedAt: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
      },
      {
        id: "news-3",
        source: "Tek.no",
        title: "Nettverksoppgradering for raskere WiFi",
        summary: "Slik kan bedrifter oppgradere trådløst uten store driftsstopp.",
        publishedAt: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
      },
      {
        id: "news-4",
        source: "VG",
        title: "Stort cybersikkerhetsloft lansert",
        summary: "Nasjonale tiltak skal redusere angrep mot kritisk infrastruktur.",
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
];

export const dummyNews = (): NewsFeed => ({
  ...meta(),
  ...newsSamples[cycleIndex(newsSamples.length)]!,
});

const libreSamples: Omit<LibreNmsSwitches, keyof ReturnType<typeof meta>>[] = [
  {
    onlineCount: 36,
    offlineCount: 2,
    offline: [
      { name: "SW-TEKNISK-03", ip: "10.10.3.12" },
      { name: "SW-BADELAND-01", ip: "10.20.1.5" },
    ],
    alerts: [
      {
        id: "alert-1",
        device: "sw-serverrom",
        message: "Port utilisation over threshold",
        timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      },
    ],
    alertHistory: [
      {
        id: "hist-1",
        device: "sw-serverrom",
        message: "Port utilisation over threshold",
        timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      },
      {
        id: "hist-2",
        device: "sw-entrance-02",
        message: "Device is down",
        timestamp: new Date(Date.now() - 95 * 60 * 1000).toISOString(),
      },
      {
        id: "hist-3",
        device: "sw-admin-01",
        message: "High CPU usage",
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "hist-4",
        device: "sw-piraten-02",
        message: "Link flapping detected",
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "hist-5",
        device: "sw-badeland-01",
        message: "Power supply warning",
        timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    onlineCount: 37,
    offlineCount: 1,
    offline: [{ name: "SW-PIRATEN-02", ip: "10.30.2.7" }],
    alerts: [],
    alertHistory: [
      {
        id: "hist-6",
        device: "sw-piraten-02",
        message: "Device is down",
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      },
      {
        id: "hist-7",
        device: "sw-admin-02",
        message: "High temperature",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "hist-8",
        device: "sw-teknisk-03",
        message: "Link down",
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "hist-9",
        device: "sw-entrance-01",
        message: "Port utilisation over threshold",
        timestamp: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "hist-10",
        device: "sw-badeland-04",
        message: "Power supply warning",
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      },
    ],
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
    alerts: [
      {
        id: "alert-2",
        device: "sw-admin-01",
        message: "Device is down",
        timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
      },
      {
        id: "alert-3",
        device: "sw-inngang-01",
        message: "Link flapping detected",
        timestamp: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
      },
    ],
    alertHistory: [
      {
        id: "hist-11",
        device: "sw-inngang-01",
        message: "Link flapping detected",
        timestamp: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
      },
      {
        id: "hist-12",
        device: "sw-admin-02",
        message: "High CPU usage",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "hist-13",
        device: "sw-badeland-04",
        message: "Device is down",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "hist-14",
        device: "sw-teknisk-03",
        message: "Port utilisation over threshold",
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "hist-15",
        device: "sw-admin-01",
        message: "Device is down",
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    onlineCount: 38,
    offlineCount: 0,
    offline: [],
    alerts: [],
    alertHistory: [
      {
        id: "hist-16",
        device: "sw-piraten-02",
        message: "Device recovered",
        timestamp: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
      },
      {
        id: "hist-17",
        device: "sw-badeland-01",
        message: "Power supply warning",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "hist-18",
        device: "sw-admin-02",
        message: "High temperature",
        timestamp: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "hist-19",
        device: "sw-teknisk-03",
        message: "Link down",
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "hist-20",
        device: "sw-entrance-02",
        message: "Port utilisation over threshold",
        timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
];

export const dummyLibreNms = (): LibreNmsSwitches => ({
  ...meta(),
  ...libreSamples[cycleIndex(libreSamples.length)]!,
});

const graylogSamples: Omit<LibreNmsGraylog, keyof ReturnType<typeof meta>>[] = [
  {
    entries: [
      {
        id: "graylog-1",
        origin: "10.2.21.115",
        timestamp: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
        level: "(3) Error",
        source: "10.2.21.115",
        message:
          "May 25 16:01:24 syslog: rccd_free_node_by_refcnt, remaining count_of_head_ready=0",
        facility: "user-level",
      },
      {
        id: "graylog-2",
        origin: "10.2.21.115",
        timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        level: "(3) Error",
        source: "10.2.21.115",
        message:
          "May 25 16:01:24 syslog: rccd_success_data, routine readidx timestamp=NULL(reach tail)",
        facility: "user-level",
      },
      {
        id: "graylog-3",
        origin: "10.2.21.115",
        timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
        level: "(3) Error",
        source: "10.2.21.115",
        message:
          "May 25 16:01:24 syslog: rccd_success_data, routine get 1 success entries in report!!",
        facility: "user-level",
      },
      {
        id: "graylog-4",
        origin: "sw-afrika-jungel",
        timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
        level: "(6) Informational",
        source: "sw-afrika-jungel",
        message: "Event|7902|LOG_INFO|AMM|1/1|Powered device power delivery on interface 1/1/4",
        facility: "local7",
      },
      {
        id: "graylog-5",
        origin: "sw-afrika-jungel",
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        level: "(6) Informational",
        source: "sw-afrika-jungel",
        message: "Event|7901|LOG_INFO|AMM|1/1|Detected powered device on interface 1/1/4. Type:1, Class:0",
        facility: "local7",
      },
      {
        id: "graylog-6",
        origin: "10.2.20.167",
        timestamp: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
        level: "(3) Error",
        source: "10.2.20.167",
        message: "May 25 16:01:22 chanflybg: Radio(1) is_vo_vi_active=0",
        facility: "system daemon",
      },
      {
        id: "graylog-7",
        origin: "10.2.20.167",
        timestamp: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
        level: "(3) Error",
        source: "10.2.20.167",
        message: "May 25 16:01:22 chanflybg: Checking Downtime (Mon May 25 16:01:22 2026,Mon May 25 18:01:22 2026) bitmap=4 tm_hour=18",
        facility: "system daemon",
      },
      {
        id: "graylog-8",
        origin: "dp-dev",
        timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
        level: "(3) Error",
        source: "dp-dev",
        message:
          "2026-05-25 18:01:25,663 - apscheduler.executors.default - INFO - Job \"ETLPipeline.run_journeys\" executed successfully.",
        facility: "",
      },
      {
        id: "graylog-9",
        origin: "10.2.21.101",
        timestamp: new Date(Date.now() - 9 * 60 * 1000).toISOString(),
        level: "(3) Error",
        source: "10.2.21.101",
        message: "May 25 16:01:23 collectd[9034]: rks_aggr_apReport_binRadio, warning: no delta value for sum_usec",
        facility: "system daemon",
      },
      {
        id: "graylog-10",
        origin: "sw-bobil",
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        level: "(6) Informational",
        source: "sw-bobil",
        message: "10.155.10.109 00076 ports: port 3 is now on-line",
        facility: "user-level",
      },
    ],
  },
];

export const dummyLibreGraylog = (): LibreNmsGraylog => ({
  ...meta(),
  ...graylogSamples[cycleIndex(graylogSamples.length)]!,
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
    offline: [
      { name: "TAB-ENTRANCE-3", lastSeenAt: new Date(Date.now() - 9 * 60 * 1000).toISOString() },
    ],
  },
  {
    onlineCount: 52,
    offlineCount: 3,
    offline: [
      { name: "TAB-ENTRANCE-3", lastSeenAt: new Date(Date.now() - 14 * 60 * 1000).toISOString() },
      { name: "KIOSK-TAB-8", lastSeenAt: new Date(Date.now() - 22 * 60 * 1000).toISOString() },
      { name: "STAFF-TAB-2", lastSeenAt: new Date(Date.now() - 35 * 60 * 1000).toISOString() },
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
      { name: "TAB-ENTRANCE-3", lastSeenAt: new Date(Date.now() - 12 * 60 * 1000).toISOString() },
      { name: "KIOSK-TAB-8", lastSeenAt: new Date(Date.now() - 28 * 60 * 1000).toISOString() },
      { name: "STAFF-TAB-2", lastSeenAt: new Date(Date.now() - 42 * 60 * 1000).toISOString() },
      { name: "TAB-FOODCOURT-1", lastSeenAt: new Date(Date.now() - 55 * 60 * 1000).toISOString() },
      { name: "TAB-FOODCOURT-2", lastSeenAt: new Date(Date.now() - 70 * 60 * 1000).toISOString() },
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
        stopName: "Dyreparken E18",
        departureTime: new Date(Date.now() + 3 * 60 * 1000).toISOString(),
        minutesUntilDeparture: 3,
        isRealtime: true,
      },
      {
        id: "entur-2",
        line: "100",
        destination: "Lillesand",
        stopName: "Dyreparken fv. 420",
        departureTime: new Date(Date.now() + 9 * 60 * 1000).toISOString(),
        minutesUntilDeparture: 9,
        isRealtime: false,
      },
      {
        id: "entur-3",
        line: "M1",
        destination: "Universitetet",
        stopName: "Dyreparken E18",
        departureTime: new Date(Date.now() + 14 * 60 * 1000).toISOString(),
        minutesUntilDeparture: 14,
        isRealtime: true,
      },
      {
        id: "entur-4",
        line: "200",
        destination: "Søgne",
        stopName: "Dyreparken fv. 420",
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
        stopName: "Dyreparken E18",
        departureTime: new Date(Date.now() + 1 * 60 * 1000).toISOString(),
        minutesUntilDeparture: 1,
        isRealtime: true,
      },
      {
        id: "entur-6",
        line: "100",
        destination: "Lillesand",
        stopName: "Dyreparken fv. 420",
        departureTime: new Date(Date.now() + 6 * 60 * 1000).toISOString(),
        minutesUntilDeparture: 6,
        isRealtime: true,
      },
      {
        id: "entur-7",
        line: "M1",
        destination: "Universitetet",
        stopName: "Dyreparken E18",
        departureTime: new Date(Date.now() + 12 * 60 * 1000).toISOString(),
        minutesUntilDeparture: 12,
        isRealtime: false,
      },
      {
        id: "entur-8",
        line: "200",
        destination: "Søgne",
        stopName: "Dyreparken fv. 420",
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
        stopName: "Dyreparken E18",
        departureTime: new Date(Date.now() + 4 * 60 * 1000).toISOString(),
        minutesUntilDeparture: 4,
        isRealtime: false,
      },
      {
        id: "entur-10",
        line: "100",
        destination: "Lillesand",
        stopName: "Dyreparken fv. 420",
        departureTime: new Date(Date.now() + 11 * 60 * 1000).toISOString(),
        minutesUntilDeparture: 11,
        isRealtime: true,
      },
      {
        id: "entur-11",
        line: "M1",
        destination: "Universitetet",
        stopName: "Dyreparken E18",
        departureTime: new Date(Date.now() + 18 * 60 * 1000).toISOString(),
        minutesUntilDeparture: 18,
        isRealtime: true,
      },
      {
        id: "entur-12",
        line: "200",
        destination: "Søgne",
        stopName: "Dyreparken fv. 420",
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
        stopName: "Dyreparken E18",
        departureTime: new Date(Date.now() + 2 * 60 * 1000).toISOString(),
        minutesUntilDeparture: 2,
        isRealtime: true,
      },
      {
        id: "entur-14",
        line: "100",
        destination: "Lillesand",
        stopName: "Dyreparken fv. 420",
        departureTime: new Date(Date.now() + 8 * 60 * 1000).toISOString(),
        minutesUntilDeparture: 8,
        isRealtime: false,
      },
      {
        id: "entur-15",
        line: "M1",
        destination: "Universitetet",
        stopName: "Dyreparken E18",
        departureTime: new Date(Date.now() + 13 * 60 * 1000).toISOString(),
        minutesUntilDeparture: 13,
        isRealtime: true,
      },
      {
        id: "entur-16",
        line: "200",
        destination: "Søgne",
        stopName: "Dyreparken fv. 420",
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
