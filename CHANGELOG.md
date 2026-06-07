# Changelog

All notable changes to this project should be documented in this file.

## Format

For each entry, include:
- Date (`YYYY-MM-DD`)
- Environment (`demo`, `production`, or `both`)
- What changed
- How it was verified

---

## Unreleased

### 2026-06-07 | Environment: production

#### What changed
- Added three new modules backed by Dyreparken dagsprogram data on `Drift & Gjester`: `Dyrepresentasjoner`, `Spisesteder`, and `Butikker`.
- Implemented a new backend route `/api/dagsprogram` that reads the same data source as Dyreparken.no (Algolia `wp_posts_poi`) for today (Oslo date).
- `Dyrepresentasjoner` now shows name, place, and all time slots for the day, and marks cancelled time slots with red styling and module-level `Avlyst` indicator.
- `Spisesteder` and `Butikker` now show only open entries (closed/temporarily unavailable entries filtered out) with name + opening time.
- Ensured all relevant items are included by loading full category result sets (`hitsPerPage=999`) instead of only visible carousel slices.

#### How it was verified
- `npm run lint`
- `npm run build`

### 2026-06-07 | Environment: production

#### What changed
- Fixed TV-specific (`1920x1080`) static-mode layout on `Full oversikt` so all 9 modules fit without clipping.
- Added a dedicated static oversikt grid for TV viewport (`3x3`) and forced `row-span=1` in that mode to prevent lower cards from being pushed out of view.
- Tightened oversikt page container sizing (`dp-page-main`/`dp-page-motion`) for TV viewport so content stays within viewport and rotation UI remains visible/stable.
- Updated README screen-layout section to reflect current 9-module TV behavior.

#### How it was verified
- `npm run lint`
- `npm run build`
- Service restart + HTTP health check (`curl -I http://127.0.0.1:3000`)

### 2026-06-07 | Environment: demo

#### What changed
- Migrated log module data source from LibreNMS syslog endpoint to direct Graylog REST API (`/api/search/universal/relative`).
- Added new backend route at `/api/graylog` with Graylog token/basic-auth support.
- Renamed module display from `Libre Graylog` to `Graylog` and updated dashboard module id to `graylog`.
- Added Graylog environment variables (`GRAYLOG_*`) and removed deprecated LibreNMS Graylog env usage.
- Kept dummy data for Graylog in code, but disabled by default unless `GRAYLOG_ALLOW_DUMMY=true`.

#### How it was verified
- `npm run lint`
- `npm run build`

### 2026-06-07 | Environment: demo

#### What changed
- Fixed module overlap in static mode (`Dynamisk` off) by making card layout height-safe.
- Updated `ModuleCard` static layout to use robust flex sizing (`min-h-0`, `overflow-hidden`, `flex-1`) instead of hardcoded height math.
- Added internal scroll handling for content-heavy modules (`LibreNMS`, `Nyheter`) in static mode so content stays inside each card.
- Improved spacing in `LibreNMS` when dynamic mode is on.
- Added automatic smooth scrolling for scrollable module content in static mode (`Asana`, `Nyheter`, `LibreNMS`, `Kollektiv`, `Esper`).
- Updated `Kollektiv` static mode to show full list with auto-scroll instead of fixed page slicing.
- Updated `Esper` static mode to always show offline devices section when offline devices exist.
- Increased `Asana` static height by using row-span 2 in static mode.
- Hid visual scrollbars for auto-scrolling module areas to keep the UI clean while preserving scrolling behavior.
- Updated `Nyheter` static mode to use full-list auto-scroll (no paging fallback) so scrolling always activates when needed.
- Added more vertical spacing in `Esper` when dynamic mode is on.
- Fixed auto-scroll engine precision/reliability by switching to fixed-interval stepping in `use-auto-scroll`, ensuring `Nyheter` static mode actually advances `scrollTop` continuously.

#### How it was verified
- `npm run lint` passed in demo checkout.
- `npm run build` passed in demo checkout.
- Browser reload on demo URL confirmed content remains inside cards in static mode.
- Browser automation confirmed `Nyheter` static scroller advances over time (`scrollTop`: `66 -> 82.5 -> 102`).

### 2026-06-07 | Environment: production

#### What changed
- Migrated log module data source from LibreNMS syslog endpoint to direct Graylog REST API (`/api/search/universal/relative`).
- Added new backend route at `/api/graylog` with Graylog token/basic-auth support.
- Renamed module display from `Libre Graylog` to `Graylog` and updated dashboard module id to `graylog`.
- Added Graylog environment variables (`GRAYLOG_*`) and removed deprecated LibreNMS Graylog env usage.
- Kept dummy data for Graylog in code, but disabled by default unless `GRAYLOG_ALLOW_DUMMY=true`.
- Updated Graylog API route to return HTTP errors when Graylog configuration is missing or upstream requests fail, so module status shows `Feil` instead of `Live`.

#### How it was verified
- `npm run lint`
- `npm run build`

### 2026-06-07 | Environment: production

#### What changed
- Fixed all current ESLint errors in application code so CI lint step can pass.
- Refactored pagination handling in module components to avoid synchronous `setState` calls in effects.
- Refactored dashboard local-storage initialization and control rendering to satisfy hook lint rules.
- Replaced header logo `<img>` with `next/image`.
- Removed unused helper/type code that triggered lint warnings.

#### How it was verified
- `npm run lint` passed locally with zero errors.
- `npm run build` passed locally after the lint fixes.

### 2026-06-07 | Environment: both

#### What changed
- Added AI instruction file at `.github/copilot-instructions.md`.
- Added PR template at `.github/pull_request_template.md`.
- Added CI workflow at `.github/workflows/ci.yml` to run lint and build on push/PR.
- Hardened `.gitignore` with explicit local secret patterns while keeping `.env.example` trackable.

#### How it was verified
- File presence and content verified locally.
- `npm run build` passed locally.
- `npm run lint` was executed and failed due to pre-existing lint errors in application code (not introduced by these template/workflow/docs changes).
