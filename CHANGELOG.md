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

### 2026-07-27 | Environment: demo

#### What changed
- `Spisesteder` and `Butikker` now show even more opening hours: 4-column grid inside the modules (was 3), default item count raised to 20 (max 32), and the resize-based item cap raised from 30 to 40.

#### How it was verified
- `npm run lint`
- `npm run build`
- Service restart + HTTP health check (`curl -I http://127.0.0.1:3001`)

### 2026-07-27 | Environment: demo

#### What changed
- `Dyrepresentasjoner` now lays out presentations in a 2-column grid (both dynamic and static mode) so more presentations fit in the module; default item count raised accordingly (6–14, two per visual row).
- `Spisesteder` and `Butikker` now show more opening hours by default in dynamic mode: default/max item count raised from 9 to 15/24 (5+ visual rows of 3), so the modules display more places out of the box.

#### How it was verified
- `npm run lint`
- `npm run build`
- Service restart + HTTP health check (`curl -I http://127.0.0.1:3001`)

### 2026-07-27 | Environment: demo

#### What changed
- Size-adaptive content now covers all modules: `LibreNMS` alerts and alert history lists (previously hardcoded to 5) and the `Asana` task list now also grow/shrink with user-set card heights. Added a `heightShare` option to `useDynamicListLimit` so multiple lists in one card split the available height.
- Compacted item boxes in `Spisesteder` and `Butikker` (smaller padding, text, and min-height) so more places fit in the modules; the size-based row calculation was tuned accordingly.
- `Dyrepresentasjoner`: renamed `Avlyst` to `Fullført` (per-presentation badge and module status), restyled passed time slots from red to neutral gray (they usually mean finished, not cancelled), and compacted the presentation boxes to fit more content.

#### How it was verified
- `npm run lint`
- `npm run build`
- Service restart + HTTP health check (`curl -I http://127.0.0.1:3001`)

### 2026-07-27 | Environment: demo

#### What changed
- Smoother module moving: cards now animate to their new positions (framer-motion layout animations) when dragging to reorder, adding/removing modules, and on masonry reflow.
- List content now adapts to user-set card heights in dynamic mode: modules with lists (`Asana` excluded; covers Nyheter, Monotree, LibreNMS, Graylog, NinjaOne, Esper, Kollektiv, Dyrepresentasjoner, Spisesteder, Butikker) show more items when the card is made taller and fewer when shorter, updating live while resizing. Cards without a custom height keep the previous window-based sizing.
- Fixed `Zoined` module hiding the total guest count on the `Full oversikt` page (TV layout CSS hid `.zoined-total` there); the total now shows on all pages.

#### How it was verified
- `npm run lint`
- `npm run build`
- Service restart + HTTP health check (`curl -I http://127.0.0.1:3001`)

### 2026-07-27 | Environment: demo

#### What changed
- Extended edit mode (`Rediger`) with drag-to-move: module cards can now be dragged to a new position on the page; the order is saved with `Lagre`.
- Added add/remove modules in edit mode: each card gets a red remove button, and a `Legg til modul` chip panel lists modules not currently on the page. Page module composition is stored per browser/page in `localStorage` (`dp.status.pageModules.v1`).
- Height resizing now snaps to a 40px grid (in addition to width snapping to grid tracks), and a subtle dot grid overlay is shown in edit mode to visualize snapping.
- `Tilbakestill` now also resets the page's module composition to the default from `dashboard-config`.

#### How it was verified
- `npm run lint`
- `npm run build`
- Service restart + HTTP health check (`curl -I http://127.0.0.1:3001`); confirmed new edit-mode strings present in built client chunks.

### 2026-07-27 | Environment: demo

#### What changed
- Added resizable module cards in dynamic mode: a new `Rediger` button in the top bar enables edit mode where each module card can be resized with the mouse (right edge = width, bottom edge = height, corner = both).
- Added `Lagre` (persist), `Tilbakestill` (reset current page), and `Avbryt` (discard) buttons in edit mode.
- Sizes are stored per browser in `localStorage` (`dp.status.moduleSizes.v1`) and per page, so the same module can have different sizes on different pages.
- Migrated the dynamic-mode layout from CSS multi-columns to a 12-track CSS grid with ResizeObserver-based masonry (`.dp-dyngrid`), which keeps the default look but makes per-module width spans possible. Removed dead per-module `grid-column/grid-row` CSS rules that would have conflicted.
- Page rotation, `Neste`, and page dots are paused/disabled while editing; controls no longer auto-hide during edit.
- Known behavior changes: card order in dynamic mode flows row-first (previously column-first), and cards with a saved height clip overflowing content.

#### How it was verified
- `npm run lint`
- `npm run build`
- Service restart + HTTP health check (`curl -I http://127.0.0.1:3001`) and confirmed `dp-dyngrid` present in served markup.

### 2026-07-27 | Environment: production

#### What changed
- Removed `Nyheter` (`news`) and `Kollektiv` (`entur`) modules from the `Full oversikt` page.
- Removed `Kollektiv` (`entur`) module from the `Drift & Gjester` page.
- Both modules remain available on the `Annet` page, so no data source was removed.

#### How it was verified
- `npm run lint`
- `npm run build`
- Service restart + HTTP health check (`curl -I http://127.0.0.1:3000`)

### 2026-06-07 | Environment: production

#### What changed
- Updated `Spisesteder` and `Butikker` to show full opening intervals (`fra-til`) instead of only opening clock time.
- Fixed static-mode auto-scroll behavior for the new `Spisesteder` and `Butikker` modules by enforcing scrollable full-height containers.
- Added new page `Annet` with modules: `Kollektiv`, `Monotree`, `Nyheter`.
- Updated `Drift & Gjester` module composition by removing `Monotree` and `Asana`.

#### How it was verified
- `npm run lint`
- `npm run build`
- Service restart + HTTP health check (`curl -I http://127.0.0.1:3000`)

### 2026-06-07 | Environment: production

#### What changed
- Updated dagsprogram module date display format to `dd-mm-yyyy`.
- Updated `Spisesteder` and `Butikker` modules to compact `3x3` card grids to reduce whitespace and improve readability.
- Ensured `Spisesteder`/`Butikker` continue to show opening time only (not closing time).
- Improved `Dyrepresentasjoner` avlyst logic so passed/cancelled time slots are marked red, and a presentation is marked `Avlyst` only when all its time slots are cancelled/passed.

#### How it was verified
- `npm run lint`
- `npm run build`
- Service restart + HTTP health check (`curl -I http://127.0.0.1:3000`)

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
