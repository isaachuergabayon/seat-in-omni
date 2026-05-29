# Git Workflows

## Branch Model

Single branch: `main`. All changes push directly to `main`. No feature branches, no PRs — this is a solo project.

## Commit Convention

Use Conventional Commits:
- `feat:` new features
- `fix:` bug fixes
- `chore:` data updates, config, tooling
- `refactor:` code changes without behavior change

## Deploy Trigger

Every push to `main` triggers the GitHub Actions workflow. There is no staging — the push IS the deploy. Verify `npm run build` passes locally before pushing.

## Data-Only Updates

Use the "Publicar" button in the admin panel (preferred), or `./deploy.sh [path]` for manual updates.

## Forbidden

- Do not force-push to `main` unless rewriting history for sensitive data removal.
- Do not change `vite.config.ts` `base` from `/seat-in-omni/` unless intentionally migrating off GitHub Pages.
