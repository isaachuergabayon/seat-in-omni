# AGENTS.md

> Operational instructions for AI coding agents working on `seat-in-omni`. For project context, see `README.md`.

---

## Context Management

Context is your most important resource. Proactively use subagents (if supported) to keep exploration, research, and verbose operations out of the main conversation.

**Default to spawning agents for:**
- Codebase exploration (reading 3+ files to answer a question)
- Research tasks (web searches, doc lookups, investigating how something works)
- Any investigation where only the summary matters

**Stay in main context for:**
- Direct file edits the user requested
- Short, targeted reads (1-2 files)
- Conversations requiring back-and-forth

---

## Skills

> **MANDATORY**: Before starting ANY task, inspect your loaded skills and execute every skill that matches. Skills override your general knowledge — they are the primary source of truth for framework conventions.

| Skill | When & Why |
|-------|------------|
| `agents-md` | Invoke when asked to create or update AGENTS.md to follow the canonical generation workflow. |
| `conventional-commits` | Invoke before writing any commit message to enforce Conventional Commits format. |

If a required skill is not loaded, inform the user before proceeding.

---

## Build & Test

Load before running any build, test, lint, or install command.

> `read_file .aicontext/agent_docs/build-and-test.md`

**Key facts (inline):**
- **No lint, test, or format scripts exist.** `npm run lint` / `npm test` will fail.
- Only verification step: `npm run build` → runs `tsc -b && vite build`.
- Type-check only (no bundle): `npx tsc -b --noEmit`.
- TypeScript strictness: `strict`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch` — all must pass.

---

## Codebase Navigation

Load before modifying, navigating, or adding files to understand module boundaries, dependencies, and integrations.

> `read_file .aicontext/agent_docs/codebase-navigation.md`

**⚠️ That doc is partially stale. Corrections:**
- `api/githubCommit.ts` does **not exist**. There is no GitHub API integration.
- The localStorage-based data flow described there is **obsolete**. Data is now in **Firebase Realtime Database** (see Architecture below).
- Real-time hooks not documented there: `usePresence`, `useChangeLog`, `useDayNote` — all Firebase-backed.

---

## Security Constraints

> **`security-constraints.md` is gitignored** and absent from any fresh clone. Do not expect it to be present.

**Key facts (inline):**
- Admin PIN is never stored in plain text. Only `ADMIN_PIN_HASH` (SHA-256 hex) lives in `src/config/adminHash.ts`.
- PIN validation uses Web Crypto API (`crypto.subtle.digest`) in `src/hooks/useAdminPin.ts`.
- No session persistence — PIN is re-prompted on every navigation to `/#/admin`.
- To change PIN: `echo -n "NEWPIN" | shasum -a 256`, update `ADMIN_PIN_HASH`, redeploy.
- All 7 Firebase credentials must be in `.env.local` (gitignored). Never commit them.

---

## Git Workflows

Load before creating branches, writing commits, or opening pull requests.

> `read_file .aicontext/agent_docs/git-workflows.md`

**Key facts (inline):**
- Single branch: `main`. Solo project — no PRs, no feature branches.
- **Every push to `main` is a production deploy** (GitHub Pages via CI). Run `npm run build` locally first.
- `./deploy.sh [path/to/data.json]` — copies a data file to `public/data.json`, commits `chore: update office data`, and pushes.

---

## Conventions & Constraints

Load before writing or reviewing any code to apply naming, style, architecture, error-handling, and testing rules.

> `read_file .aicontext/agent_docs/conventions-and-constraints.md`

**⚠️ That doc is partially stale. Corrections:**
- "No environment variables" is **wrong** — 7 Firebase vars are required (see Environment Setup).
- "No backend" is **wrong** — Firebase Realtime Database is the backend.
- The `seatInOmni_persisted` and `seatInOmni_ghToken` localStorage keys described there **do not exist** in the current codebase.
- Everything else (date utils, DeskGroup layout, `personId` clearing) is accurate.

---

## Environment Setup

**Local dev requires `.env.local`** (gitignored) with these 7 variables — without them the app boots but all Firebase reads/writes fail silently:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_DATABASE_URL=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

These same 7 are injected as GitHub Secrets during CI deploy.

---

## Architecture

Single-package React + TypeScript app (Vite, Tailwind, react-router-dom). No monorepo.

### Data flow

1. `DataContext` fetches `./data.json?v=<timestamp>` (cache-busted) for seed data.
2. Subscribes to Firebase `seatInOmni` ref via `onValue` for real-time mutable state.
3. Merge rule: `seats` always from seed; `people` = seed + `extraPeople` from Firebase; `templates` = Firebase templates + seed templates whose IDs are absent from Firebase; `assignments` and `specialDays` = Firebase only.
4. `setData()` writes `{ assignments, specialDays, allTemplates, extraPeople }` to Firebase — **past assignments are silently dropped** (filter: `a.date >= today`).

### Firebase paths

| Path | Contents |
|------|----------|
| `seatInOmni` | Main app data (`assignments`, `specialDays`, `allTemplates`, `extraPeople`) |
| `seatInOmni_presence/{sessionId}` | Live presence (auto-removed on disconnect) |
| `seatInOmni_log` | Change log entries (auto-purged after 7 days) |
| `seatInOmni_notes/{YYYY-MM-DD}` | Per-day notes (removed from Firebase when empty) |

### Routing

- **`HashRouter` is mandatory.** GitHub Pages has no server-side routing — `BrowserRouter` breaks on reload.
- `vite.config.ts` `base: '/seat-in-omni/'` must not be changed.
- Routes: `/#/` → Home, `/#/admin` → AdminGuard → Admin.

### Key source locations

```
src/types.ts          — canonical TypeScript types (single source of truth)
src/utils.ts          — date helpers, resolveSeatsForDate, resolveSeatsForTemplate, generateId
src/firebase.ts       — Firebase app init + Realtime DB export (db)
src/context/          — DataContext: global state + Firebase subscription
src/config/           — adminHash.ts (PIN hash only)
src/hooks/            — useAdminPin, usePresence, useChangeLog, useDayNote
src/components/       — UI components (OfficeMap, DeskGroup, SeatCard, DateNavigator, …)
src/pages/            — Home (public map), Admin (admin panel)
public/data.json      — Seed data: seats, people, weekday templates (never auto-generated)
```

---

## Critical Gotchas

- **Date utils are mandatory.** Always use `formatDate(date)` and `parseDate(dateStr)` from `src/utils.ts`. Never use `date.toISOString().slice(0, 10)` — UTC offset will produce wrong dates for local timezones.
- **`setData()` purges past assignments.** Every save discards any assignment where `a.date < today`. Do not rely on `data.assignments` for historical data.
- **`resolveSeatsForDate` only matches templates by `weekday` (1–5).** The `default` template in `data.json` (no `weekday` field) is never used by resolution logic — it's a reference template for the editor only. Weekends have no template match.
- **`ResolvedSeat.personId` must be set to `null` explicitly** when changing status to `free` or `absent`. It is never auto-cleared from prior state.
- **DeskGroup layout:** Vertical desks (`left`, `right`) use column 1 = seats ending in `-1`, column 2 = `-2`. Sort must be explicit — default `localeCompare` produces wrong visual order.
- **Full Firebase write on every seat click.** `handleUpdate` → `setData` → writes the entire `seatInOmni` ref. No partial updates.
- **Admin panel has no "Publicar" button.** Agent docs that describe a GitHub publishing step are describing a removed feature. Tabs are: Semana tipo, Excepciones, Personas, Días Especiales, Plantillas, Historial.
- **Node version:** `.tool-versions` uses `ivm-node 22.13.1`. Ensure your version manager supports this format.

---

## Release & Versioning

The app uses **SemVer + `release-it`** for fully automated releases.

### How version flows
1. `package.json#version` is the source of truth.
2. Vite injects it as `__APP_VERSION__` at build time via `process.env.npm_package_version` (set automatically by npm).
3. Declared in `src/env.d.ts` as `declare const __APP_VERSION__: string`.
4. Displayed in the app header alongside the title: `Mapa de Sitios  v1.0.0`.

### Bump rules (from conventional commits since last tag)
| Commit type | Bump |
|---|---|
| `fix:` | patch (`1.0.0 → 1.0.1`) |
| `feat:` | minor (`1.0.0 → 1.1.0`) |
| `feat!:` / `BREAKING CHANGE` | major (`1.0.0 → 2.0.0`) |

### Release command
```bash
npm run release       # interactivo: muestra bump propuesto, pide confirmación
npm run release:dry   # previsualiza sin ejecutar nada
```
`GITHUB_TOKEN` se inyecta automáticamente desde `$ITX_GITHUB_PAT` (definido en `~/.zshrc`).

### What `npm run release` does
1. Calcula el bump analizando commits desde el último tag
2. Actualiza `package.json#version`
3. Genera/actualiza `CHANGELOG.md`
4. Commit: `chore: release vX.Y.Z`
5. Tag: `vX.Y.Z`
6. Push commit + tag → dispara el workflow de GitHub Pages → app actualizada
7. Crea GitHub Release con el changelog

### Config files
- `.release-it.json` — configuración de release-it (preset `angular`, GitHub releases activados)
- `CHANGELOG.md` — generado y mantenido automáticamente, no editar a mano
