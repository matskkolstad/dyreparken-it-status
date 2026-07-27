# 🦁 Dyreparken IT Status

Statusdashboard for IT-avdelingen i Dyreparken Kristiansand. Nettsiden samler data fra alle viktige IT-systemer på én skjerm, og er designet for å vises på en TV på kontoret.

---

## Funksjoner

- **10 moduler** – Vær, Asana, Monotree, Nyheter, LibreNMS, Graylog, NinjaOne, Esper, Zoined og Entur (bussavganger)
- **Automatisk oppdatering** – Henter data fra API-ene hvert minutt i produksjon (10 sekunder i utvikling)
- **Flerside-visning** – Modulene er fordelt på flere sider som roterer automatisk
- **Manuell kontroll** – Pause/play rotering, hopp til neste side, manuell oppdatering
- **Roteringstimer** – Stillbar varighet per side (standard 30 sekunder)
- **Animert fremdriftslinje** – Viser gjenværende tid på aktiv side
- **Pulserende statusindikator** – Grønn/gul/rød for hver modul
- **Dynamisk modus** – Modulene utvider seg automatisk og viser mer detaljert info
- **Justerbare modulstørrelser** – I dynamisk modus kan modulkortene endres i bredde/høyde via `Rediger`-knappen, og lagres per nettleser og side
- **Stabil statisk layout** – I ikke-dynamisk modus holdes innhold innenfor hvert kort uten overlapping
- **Auto-scroll i statisk modus** – Moduler med mer innhold scroller rolig automatisk nar `Dynamisk` er av
- **Visuell prioritering** – Kritiske avvik/offline-feil kan vises i storre kort
- **Klokkeslett og dato** – Øverst i høyre hjørne
- **Dummy-data-modus** – Kjør uten API-nøkler under utvikling

---

## Teknologi

| Teknologi | Bruk |
|---|---|
| [Next.js 16](https://nextjs.org) | Rammeverk (App Router) |
| [TypeScript](https://www.typescriptlang.org) | Typesikkerhet |
| [Tailwind CSS v4](https://tailwindcss.com) | Styling |
| [Framer Motion](https://www.framer.com/motion/) | Animasjoner |
| [Lucide React](https://lucide.dev) | Ikoner |

---

## Hurtigstart (utvikling)

### Krav

- Node.js 20 eller nyere
- npm

### Installer og kjør

```bash
git clone https://github.com/matskkolstad/dyreparken-it-status.git
cd dyreparken-it-status
npm install
cp .env.example .env.local   # tilpass etter behov
npm run dev
```

Åpne [http://localhost:3000](http://localhost:3000) i nettleseren.

Som standard er `DUMMY_DATA=true`, slik at alle moduler vises med testdata uten at du trenger API-nøkler.

Oppdateringsfrekvensen styres av miljøet:

- Utvikling: 10 sekunder
- Produksjon: 60 sekunder

---

## Miljøvariabler

Alle miljøvariabler er dokumentert i [`.env.example`](.env.example). Kopier filen til `.env.local` og fyll inn verdiene dine:

```bash
cp .env.example .env.local
```

| Variabel | Påkrevd | Beskrivelse |
|---|---|---|
| `DUMMY_DATA` | Nei | `true` = testdata, `false` = ekte API (standard: `true`) |
| `WEATHER_LAT` | Ja* | Breddegrad for værstasjon |
| `WEATHER_LON` | Ja* | Lengdegrad for værstasjon |
| `WEATHER_LOCATION_NAME` | Nei | Visningsnavn for sted |
| `ASANA_ACCESS_TOKEN` | Ja* | Personlig tilgangstoken fra Asana |
| `ASANA_PROJECT_GID` | Ja* | GID for Asana-prosjektet |
| `MONOTREE_POSTS_URL` | Ja* | URL til Monotree-endepunkt |
| `MONOTREE_API_KEY` | Nei | API-nøkkel for Monotree (valgfritt) |
| `LIBRENMS_BASE_URL` | Ja* | Base-URL til LibreNMS |
| `LIBRENMS_API_TOKEN` | Ja* | API-token fra LibreNMS |
| `LIBRENMS_SWITCH_REGEX` | Nei | Regulært uttrykk for å filtrere switcher |
| `GRAYLOG_BASE_URL` | Ja* | Base-URL til Graylog |
| `GRAYLOG_API_TOKEN` | Ja** | Access token for Graylog API |
| `GRAYLOG_USERNAME` | Ja** | Graylog brukernavn (alternativ til token) |
| `GRAYLOG_PASSWORD` | Ja** | Graylog passord (alternativ til token) |
| `GRAYLOG_QUERY` | Nei | Graylog Lucene-query (standard: `*`) |
| `GRAYLOG_RANGE_SECONDS` | Nei | Relativt tidsvindu i sekunder (standard: `1800`) |
| `GRAYLOG_LIMIT` | Nei | Antall meldinger (standard: `10`) |
| `GRAYLOG_SORT` | Nei | Sortering, f.eks. `timestamp:desc` |
| `GRAYLOG_FIELDS` | Nei | Kommaseparerte felt fra Graylog |
| `GRAYLOG_ALLOW_DUMMY` | Nei | `true` for å vise dummydata i Graylog-modul |
| `NINJAONE_DEVICES_URL` | Ja* | URL til NinjaOne-enhetsendepunkt |
| `NINJAONE_ACCESS_TOKEN` | Ja* | OAuth2 access token fra NinjaOne |
| `ESPER_DEVICES_URL` | Ja* | URL til Esper-enhetsendepunkt |
| `ESPER_API_TOKEN` | Ja* | API-token fra Esper |
| `ZOINED_GUESTS_URL` | Ja* | URL til Zoined gjesteoversikt |
| `ZOINED_API_KEY` | Nei | API-nøkkel for Zoined (valgfritt) |
| `ENTUR_API_URL` | Nei | Entur GraphQL-endepunkt (standard: `https://api.entur.io/journey-planner/v3/graphql`) |
| `ENTUR_CLIENT_NAME` | Ja* | Entur klientidentifikator for `ET-Client-Name` |
| `ENTUR_STOP_PLACE_ID` | Ja* | StopPlace-ID for Dyreparken |
| `ENTUR_MAX_DEPARTURES` | Nei | Hvor mange avganger som hentes (standard: `10`) |

*Påkrevd kun når `DUMMY_DATA=false`

**Bruk enten `GRAYLOG_API_TOKEN`, eller `GRAYLOG_USERNAME` + `GRAYLOG_PASSWORD`.

`.env.example` er med vilje versjonert i repoet som mal. Bruk den kun som eksempel, og legg faktiske hemmeligheter i `.env.local` (aldri i git).

---

## Endringsprosess og kvalitet

Prosjektet har en standardisert flyt for sikre og sporbare endringer:

- Opprett PR med sjekklisten i [`.github/pull_request_template.md`](.github/pull_request_template.md)
- Kjor verifisering lokalt (`npm run lint` og `npm run build`) for du merger
- CI kjører automatisk ved push/PR via [`.github/workflows/ci.yml`](.github/workflows/ci.yml)
- Oppdater `README.md` nar oppforsel, oppsett eller drift endres
- Oppdater [CHANGELOG.md](CHANGELOG.md) med dato, miljo, hva som ble endret og hvordan det ble verifisert
- Ikke commit hemmeligheter (`.env*`, nøkler, tokens, credentials)

---

## API-integrasjoner

### Vær

Bruker [Open-Meteo](https://open-meteo.com/) – gratis og uten API-nøkkel. Sett koordinater via `WEATHER_LAT` og `WEATHER_LON`.

### Asana

Bruker [Asana REST API v1.0](https://developers.asana.com/reference/rest-api-reference).

1. Gå til [Asana – Mine apper](https://app.asana.com/0/my-apps)
2. Opprett et **Personal Access Token**
3. Finn prosjektets GID i URL-en (f.eks. `https://app.asana.com/0/123456789/...` → GID er `123456789`)

### Monotree

Bruker Monotrees API (se [Monotree LLMs-dokumentasjon](https://docs.monotree.com/monotree-llms.txt)). Sett `MONOTREE_POSTS_URL` til endepunktet som returnerer siste innlegg. Svaret kan være:

- `{ posts: [...] }`
- `{ data: [...] }`
- En direkte array

Hvert element forventes å ha feltene `id`, `title`, `publishedAt` (eller `published_at`) og valgfritt `url`.

### LibreNMS

Bruker [LibreNMS API](https://docs.librenms.org/API/).

1. Gå til **LibreNMS → Innstillinger → API → Add API Token**
2. Sett `LIBRENMS_BASE_URL` til din instans (f.eks. `https://librenms.yourdomain.local`)
3. Valgfritt: bruk `LIBRENMS_SWITCH_REGEX` for å filtrere enheter (f.eks. `^SW-` for alle switcher)

### Graylog

Bruker Graylog REST API direkte via `GET /search/universal/relative`.

1. Sett `GRAYLOG_BASE_URL` (for eksempel `https://graylog.example.com`)
2. Opprett access token i Graylog og sett `GRAYLOG_API_TOKEN`
3. Valgfritt: finjuster søk med `GRAYLOG_QUERY`, `GRAYLOG_RANGE_SECONDS`, `GRAYLOG_LIMIT`, `GRAYLOG_SORT` og `GRAYLOG_FIELDS`

Merk: Graylog API bruker HTTP Basic auth. Ved token-bruk sendes autentisering som `YourToken:token`.

### Nyheter (RSS)

Henter RSS-nyheter fra Digi.no, Teknisk Ukeblad, Tek.no og VG, og viser de 10 nyeste samlet.
For å sikre variasjon vises maks 3 saker fra VG samtidig.

### NinjaOne

Bruker [NinjaOne API v2](https://app.ninjarmm.com/apidocs/?links.active=core).

NinjaOne bruker OAuth2. Følg disse stegene:
1. Gå til **NinjaOne → Administrasjon → Apper → API**
2. Opprett en ny app og noter `client_id` og `client_secret`
3. Hent et access token via OAuth2 client credentials flow
4. Sett `NINJAONE_ACCESS_TOKEN` og `NINJAONE_DEVICES_URL` (typisk `https://app.ninjarmm.com/v2/devices`)

### Esper

Bruker [Esper API](https://api.esper.io/openapi).

1. Logg inn på [Esper Console](https://console.esper.io/)
2. Gå til **API Key Management** og opprett en nøkkel
3. Sett `ESPER_API_TOKEN` og `ESPER_DEVICES_URL` (f.eks. `https://api.esper.io/api/enterprise/<enterprise_id>/device/`)

### Zoined

Bruker [Zoined API](https://zoined.com/zapi).

Kontakt Zoined for å få tilgang til gjeste-endepunktet for din organisasjon. Svaret forventes å ha feltene `dyreparkenGuests` og `badelandGuests` (eller under et `data`-objekt).

### Entur (kollektiv)

Bruker Entur Real-time GraphQL API for å vise neste bussavganger fra Dyreparken.

1. Sett `ENTUR_CLIENT_NAME` til en unik klientstreng (for eksempel `dyreparken-it-status-prod`)
2. Sett `ENTUR_STOP_PLACE_ID` til riktig stoppested-ID for Dyreparken
3. Valgfritt: overstyr `ENTUR_API_URL` eller `ENTUR_MAX_DEPARTURES`

Foresporslene sendes med header `ET-Client-Name`, og modulen viser de neste relevante bussavgangene med sanntidsindikator.

### Dagsprogram (Dyrepresentasjoner, Spisesteder, Butikker)

Modulene `Dyrepresentasjoner`, `Spisesteder` og `Butikker` bruker Dyreparkens dagsprogram-data for dagens dato.

- Kilde: Algolia-indeksen som driver `dyreparken.no/dagsprogram`
- `Dyrepresentasjoner` viser navn, sted og alle klokkeslett, og markerer avlyste tider i rodt
- `Spisesteder` og `Butikker` viser kun apne elementer med navn + apningstid

Ingen ekstra miljo-variabler kreves for denne integrasjonen.

---

## Deployment på Linux-server

### Bygg applikasjonen

```bash
npm run build
```

### Kjør med systemd

Opprett en systemd-tjenestfil `/etc/systemd/system/dyreparken-it-status.service`:

```ini
[Unit]
Description=Dyreparken IT Status
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/projects/dyreparken-it-status
ExecStartPre=/usr/bin/npm run build
ExecStart=/usr/bin/npm run start -- --hostname 0.0.0.0 --port 3000
Restart=always
RestartSec=5
Environment=NODE_ENV=production
EnvironmentFile=/root/projects/dyreparken-it-status/.env.local

[Install]
WantedBy=multi-user.target
```

Aktiver og start tjenesten:

```bash
sudo systemctl daemon-reload
sudo systemctl enable dyreparken-it-status
sudo systemctl start dyreparken-it-status
sudo systemctl status dyreparken-it-status
```

### Eget demo-miljo pa samme server

Det er mulig a kjore en separat demo-instans parallelt med produksjon.

- Produksjon: `/root/projects/dyreparken-it-status` pa port `3000`
- Demo: `/root/projects/dyreparken-it-status-demo` pa port `3001`

Demo-instansen kan eksponeres direkte pa serverens IP, for eksempel:

```text
http://10.10.20.103:3001
```

For a holde demo og produksjon adskilt brukes en egen git-worktree for demo:

```bash
cd /root/projects/dyreparken-it-status
git worktree add -b demo /root/projects/dyreparken-it-status-demo main
cp /root/projects/dyreparken-it-status/.env.local /root/projects/dyreparken-it-status-demo/.env.local
cd /root/projects/dyreparken-it-status-demo
npm ci
```

Eksempel pa systemd-tjeneste for demo:

```ini
[Unit]
Description=Dyreparken IT Status dashboard (demo)
After=network.target

[Service]
Type=simple
WorkingDirectory=/root/projects/dyreparken-it-status-demo
Environment=NODE_ENV=production
EnvironmentFile=-/root/projects/dyreparken-it-status-demo/.env.local
ExecStartPre=/usr/bin/npm run build
ExecStart=/usr/bin/npm run start -- --hostname 0.0.0.0 --port 3001
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Aktiver demo-tjenesten:

```bash
sudo systemctl daemon-reload
sudo systemctl enable dyreparken-it-status-demo
sudo systemctl start dyreparken-it-status-demo
sudo systemctl status dyreparken-it-status-demo
```

Ved videre utvikling i demo kan du jobbe direkte i demo-checkouten uten a pavirke produksjon:

```bash
cd /root/projects/dyreparken-it-status-demo
git status
git pull
npm run build
sudo systemctl restart dyreparken-it-status-demo
```

### Nginx-konfigurasjon (reverse proxy)

```nginx
server {
    listen 80;
    server_name itstatus.dyreparken.no;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Sett inn API-nøkler på serveren

1. Opprett `.env.local` i prosjektmappen:
   ```bash
   cp .env.example .env.local
   nano .env.local
   ```
2. Fyll inn verdiene og sett `DUMMY_DATA=false`
3. Sikre filen:
   ```bash
   chmod 600 .env.local
   chown root:root .env.local
   ```
4. Start tjenesten på nytt:
   ```bash
   sudo systemctl restart dyreparken-it-status
   ```

---

## Tilpasning

### Legge til en ny side

Rediger `src/lib/dashboard-config.ts` og legg til en ny side i `DASHBOARD_PAGES`:

```ts
export const DASHBOARD_PAGES: DashboardPage[] = [
  {
    id: "min-side",
    title: "Min Side",
    modules: ["weather", "asana"],
  },
  // ...
];
```

### Oppdateringsintervall

Oppdateringsintervall er miljostyrt i `src/lib/dashboard-config.ts`:

- Utvikling (`NODE_ENV !== production`): 10 sekunder
- Produksjon (`NODE_ENV === production`): 60 sekunder

### Dynamisk modus

Slas av/paa med knappen **Dynamisk** i toppbaren (pa som standard). I dynamisk modus:

- Modulene tilpasser hoyden etter innhold og skjermstorrelse
- Enkelte moduler viser mer data (f.eks. flere bussavganger og flere offline-enheter)
- Kritiske avvik kan vises i storre kort for bedre synlighet

### Endre storrelse pa moduler (dynamisk modus)

I dynamisk modus kan du justere storrelsen pa hvert modulkort:

1. Trykk **Rediger** i toppbaren (kun synlig nar `Dynamisk` er pa)
2. Dra i hoyre kant (bredde), nedre kant (hoyde) eller hjornet (begge) pa et kort
3. Trykk **Lagre** for a beholde storrelsene, **Avbryt** for a forkaste, eller **Tilbakestill** for a nullstille siden

Detaljer:

- Storrelsene lagres i nettleseren (`localStorage`, nokkel `dp.status.moduleSizes.v1`) og gjelder kun den nettleseren
- Storrelser lagres per side, sa samme modul kan ha ulik storrelse pa ulike sider
- Bredden snapper til kolonner i et 12-spors rutenett; hoyden er trinnlos
- Kort med lagret hoyde klipper innhold som ikke far plass
- Siderotering og sidebytte er pauset mens redigering pagar

### Skjermoppsett (1920x1080)

Full oversikt er optimalisert for 1920x1080 for TV-bruk og viser modulene uten at nedre kort klippes (`Nyheter` og `Kollektiv` vises pa siden `Annet`, ikke pa oversikten):

- I vanlig modus brukes et kompakt 3x3 rutenett (en rad per modul)
- I dynamisk modus brukes komprimert fler-kolonneoppsett for oversikten

For produksjon (systemd) ma du kjore `npm run build` og restarte tjenesten for at layoutendringer skal vises.

---

## Utvikling

```bash
npm run dev     # Start utviklingsserver
npm run build   # Bygg for produksjon
npm run lint    # Sjekk kodefeil
npm run start   # Start produksjonsserver
```

---

## Lisens

Intern bruk – Dyreparken Kristiansand IT-avdelingen.

