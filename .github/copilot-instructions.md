<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Dyreparken IT Status

## What This Repo Is
- TV-facing status dashboard for Dyreparken IT, built with Next.js 16 App Router, TypeScript, Tailwind v4, and Framer Motion.
- Norwegian UI and locale conventions are intentional. Preserve `nb-NO` formatting and Norwegian labels unless asked otherwise.

## Core Commands
- `npm run dev` starts local development.
- `npm run build` creates the production build.
- `npm start -- --hostname 0.0.0.0 --port <port>` runs the production server.
- `npm run lint` runs ESLint.

## Mandatory Environment Clarification
- For every change request, always ask whether the change should be implemented in demo or production, unless the prompt already states the target environment.
- If environment is not specified, pause implementation and ask first.
- Recommended default workflow is demo first, then production after verification and approval.

## Where Behavior Lives
- [src/components/dashboard/Dashboard.tsx](/root/projects/dyreparken-it-status/src/components/dashboard/Dashboard.tsx) owns page rotation, manual refresh, dynamic mode, idle controls, and top-level module wiring.
- [src/lib/dashboard-config.ts](/root/projects/dyreparken-it-status/src/lib/dashboard-config.ts) defines which modules appear on each page.
- [src/components/modules](/root/projects/dyreparken-it-status/src/components/modules) contains one UI component per dashboard module.
- [src/app/api](/root/projects/dyreparken-it-status/src/app/api) contains one server route per data source; most feature work touches both a module component and its matching API route.
- [src/lib/types.ts](/root/projects/dyreparken-it-status/src/lib/types.ts) is the shared contract between API routes, dummy data, and UI modules.
- [src/lib/dummy-data.ts](/root/projects/dyreparken-it-status/src/lib/dummy-data.ts) must be updated when API response shapes change.

## Data Flow Conventions
- Client components use `useApiData()` from [src/lib/hooks/use-api-data.ts](/root/projects/dyreparken-it-status/src/lib/hooks/use-api-data.ts) for polling and in-memory caching.
- API routes should return `lastUpdatedAt` and `isDummyData` and match the shared types exactly.
- Required env vars are enforced with `requireEnv()`. Dummy mode is controlled by `DUMMY_DATA`.

## Project-Specific Rules
- Prefer minimal, targeted edits. This dashboard is already in production.
- When changing a module response shape, update all three surfaces together: API route, shared type, dummy data.
- Severity logic is module-local inside each module component; do not assume one shared severity policy.
- External integrations are network-dependent and may be partially unavailable. Fail soft in UI and keep API handlers defensive.

## Verification-First Delivery Workflow
- After code changes, verify that the changes actually work before updating documentation.
- Verification should include relevant checks such as lint, build, targeted API checks, UI checks, and service status checks when applicable.
- Only after successful verification, update documentation so it matches the real implemented behavior.
- Keep README.md accurate at all times.
- Record implemented changes in CHANGELOG.md. If CHANGELOG.md does not exist, create it.
- After verification and documentation updates, commit and push the changes so the repository reflects actual state.
- Never commit or push secrets: `.env*`, API keys, tokens, credentials, private certificates, or similar sensitive data.

## Production And Demo
- Production checkout: `/root/projects/dyreparken-it-status`, service `dyreparken-it-status.service`, port `3000`.
- Demo checkout: `/root/projects/dyreparken-it-status-demo`, service `dyreparken-it-status-demo.service`, port `3001`.
- The demo environment uses a separate git worktree on branch `demo`. Do demo-only work there when asked not to affect production.
- Turbopack rejected a `node_modules` symlink outside the project root; the demo checkout needs its own real `npm ci` install.

## Environment Promotion Policy
- Intended structure: implement and test in demo first.
- When demo changes are verified, ask whether the same changes should be promoted to production.
- If approved, implement in production checkout, re-verify, then commit and push.
- If not approved, keep the change in demo only and clearly state production was not changed.
- For production-affecting work, explicitly confirm restart impact and run a post-deploy health check.

## Deployment Notes
- Production and demo are managed with systemd, not Docker.
- Service changes should be followed by `systemctl restart ...` and a quick HTTP or status check.
- The canonical operational details live in [README.md](/root/projects/dyreparken-it-status/README.md). Link there instead of duplicating long setup docs in new instruction files.

## Change Management Guardrails
- Keep commits focused and traceable, with messages that describe what changed and why.
- Include affected modules and operational impact in commit messages when relevant.
- If a change touches behavior, ensure README.md and CHANGELOG.md are updated in the same delivery.
- Do not claim verification unless checks were actually run.
