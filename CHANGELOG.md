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

#### How it was verified
- `npm run lint` passed in demo checkout.
- `npm run build` passed in demo checkout.
- Browser reload on demo URL confirmed content remains inside cards in static mode.

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
