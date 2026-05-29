# Codebase Navigation

## Entry Points

- `index.html` → `src/main.tsx` → `src/App.tsx`
- `App.tsx` mounts `HashRouter` with two routes: `/` (`Home`) and `/admin` (`AdminGuard` → `Admin`)

## Key Directories

```
src/
  App.tsx           — router + AdminGuard (PIN screen)
  types.ts          — all TypeScript types (start here)
  utils.ts          — resolveSeatsForDate, date helpers, exportDataAsJson
  api/
    githubCommit.ts — GitHub API client for publishing data.json from admin panel
  context/
    DataContext.tsx  — global state: fetches data.json, merges localStorage, exposes setData()
  components/
    DateNavigator   — date picker + prev/next; left arrow disabled when date = today
    OfficeMap       — renders both buildings, computes assignedPersonIds
    DeskGroup       — vertical layout (left/right desks) vs horizontal (center/tech-desk)
    SeatCard        — individual seat tile with popover (editable if admin, readonly otherwise)
  pages/
    Home.tsx        — public view, counters per building
    Admin.tsx       — full admin panel (templates, special days, people, publish, config)
  config/
    adminHash.ts    — SHA-256 hash of the admin PIN (PIN never stored in plain text)
  hooks/
    useAdminPin.ts  — PIN validation using Web Crypto API
public/
  data.json         — seed: seats, people, templates (fetched at runtime, cache-busted)
```

## Data Flow

1. `DataContext` fetches `./data.json?v=<timestamp>` on mount (cache-busted).
2. Merges with `localStorage` key `seatInOmni_persisted` — localStorage wins for templates, assignments, specialDays; people = seed + `extraPeople`.
3. All mutations go through `setData()` which persists to localStorage.
4. `resolveSeatsForDate(data, date)` in `utils.ts` is the core projection: weekday template → date-specific assignment overrides.

## Important Types (`src/types.ts`)

- `BuildingId`: `'com' | 'tech'`
- `DeskId`: `'left' | 'center' | 'right' | 'tech-desk'`
- `SeatType`: `'fixed' | 'rotativo'`
- `SeatStatus`: `'occupied' | 'absent' | 'free'`
- `ResolvedSeat`: computed view — includes `personId` directly (not derived from name)

## External Integrations

- **GitHub API** (`api.github.com`): used by admin panel to commit `public/data.json` directly. Requires a Personal Access Token stored in `localStorage` key `seatInOmni_ghToken`.
- No environment variables, no `.env` files, no other external APIs.
