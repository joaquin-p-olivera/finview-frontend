# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres
to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- CI: every PR to `develop` or `master` now runs `Frontend Checks / check` (`.github/workflows/checks.yml`) — `npm ci` plus `vite build` on Node 22, so a broken build or an out-of-sync lockfile fails the PR instead of the deploy. Also runnable by hand, and reused by the deploy workflow. ([#18](https://github.com/joaquin-p-olivera/finview-frontend/pull/18))
- Configured Dependabot (npm + github-actions), monthly, opening its PRs against `develop`. ([#18](https://github.com/joaquin-p-olivera/finview-frontend/pull/18))
- Added an automatic backport: when `master` gets something `develop` doesn't have (e.g. a hotfix merged straight to `master`), a PR bringing it back into `develop` is opened (`.github/workflows/backport-to-develop.yml`). ([#18](https://github.com/joaquin-p-olivera/finview-frontend/pull/18))

### Changed

- Production deploys to Netlify now go through GitHub Actions (`.github/workflows/deploy.yml`): every push to `master` runs the checks first and, only if they pass, builds that exact commit with the production `VITE_API_BASE_URL` and publishes `dist/` with `netlify-cli`. Netlify skips its own production build (`ignore` command in `netlify.toml`), but still builds deploy previews for PRs. It can also be run by hand (`workflow_dispatch`) to deploy any branch's current commit — deploying anything other than `master` requires confirming with `confirm_non_master: 'yes'`. Requires the `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID` repo secrets and a `VITE_API_BASE_URL` repo variable (set up outside this repo, in GitHub's settings). ([#18](https://github.com/joaquin-p-olivera/finview-frontend/pull/18))

### Fixed

- Regenerated `package-lock.json`, which had been out of sync with `package.json` since the last dependency bump ([#17](https://github.com/joaquin-p-olivera/finview-frontend/pull/17)) — `npm ci` refused to install. `dist/` is now gitignored. ([#18](https://github.com/joaquin-p-olivera/finview-frontend/pull/18))
