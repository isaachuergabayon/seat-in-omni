# Conventions & Constraints

## Architecture

- **No backend** — static app only. All state lives in `public/data.json` (seed) + `localStorage` (`seatInOmni_persisted`).
- **No environment variables** — do not add `import.meta.env` usage without explicit user request.
- **HashRouter** — mandatory. Do not switch to `BrowserRouter`. GitHub Pages requires hash-based routing.
- `vite.config.ts` `base: '/seat-in-omni/'` — required for GitHub Pages. All asset paths are relative to this base.

## Date Handling

- Use `formatDate` from `utils.ts` for all date strings (`YYYY-MM-DD`). Never use `date.toISOString().slice(0,10)` — it has UTC offset bugs.
- `formatDate` uses `getFullYear/getMonth/getDate` — always local time.
- `getWeekday` returns `1–7` (Mon–Sun); `getDay()===0` → `7`. Weekends have no weekday template.

## localStorage

- Key: `seatInOmni_persisted`
- The old key `seatInOmni_data` is obsolete — do not use it.
- GitHub token stored separately under `seatInOmni_ghToken`.

## Component Layout Rules

- `DeskGroup` vertical layout (left/right desks): column 1 = suffix `-1` seats (top before bottom), column 2 = suffix `-2` seats. Sort explicitly — `localeCompare` sorts `bottom` before `top`.
- `DeskGroup` horizontal layout (center/tech-desk): original row-based layout.

## TypeScript

- `strict: true` — no `any`, no unused vars/params. Fix all errors before committing.
- `ResolvedSeat` carries `personId` directly — use it for identity checks, not person name.
- `personId` in `ResolvedSeat` must be cleared explicitly when status changes to `free` or `absent`.

## People Management

- Seed people come from `public/data.json`. Admin-added people are stored in `extraPeople` in localStorage.
- On load: always `seed.people + extraPeople`. Never overwrite seed people from localStorage.
- `generateId()` in `utils.ts` creates IDs for new entities — use it consistently.

## No Test Suite

There are no unit or integration tests. Verify changes by running `npm run build` and manual testing via `npm run dev`.
