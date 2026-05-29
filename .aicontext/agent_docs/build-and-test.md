# Build & Test

## Commands

| Purpose | Command |
|---------|---------|
| Install deps | `npm ci` |
| Dev server | `npm run dev` |
| Type-check + build | `npm run build` (runs `tsc -b && vite build`) |
| Type-check only | `npx tsc -b --noEmit` |
| Preview prod build | `npm run preview` |

- **No lint or test scripts** exist in `package.json`. Do not invent or suggest `npm run lint` or `npm test`.
- Always run `npm run build` (not just `vite build`) — the `tsc -b` step catches type errors that Vite would silently skip.
- TypeScript is strict: `strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true`. Fix all errors before committing.

## CI

GitHub Actions (`.github/workflows/deploy.yml`) triggers on push to `main`:
1. `npm ci`
2. `npm run build`
3. Deploy `dist/` to GitHub Pages via `actions/deploy-pages@v4`

Node version pinned to **22** in CI. Match locally if possible (see `.tool-versions`).

## Deploy

After any code change: `git push origin main` → CI builds and deploys automatically in ~2 min.

For data-only updates (new `public/data.json`): use the "Publicar" button in the admin panel, or run `./deploy.sh [path/to/data.json]` (defaults to `~/Downloads/data.json`).
