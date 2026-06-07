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
