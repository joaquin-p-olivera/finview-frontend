# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres
to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- Editing a product in the cart no longer runs off the screen on phones: the name goes on its own line, then price and quantity, then "Guardar" and "Cancelar". Desktop is unchanged. ([#46](https://github.com/joaquin-p-olivera/finview-frontend/pull/46))

## [1.4.0] - 3 Oct 2026

### Added

- Supermarkets for carts come from an editable list: starting a cart now means picking a store from the list (most used first) or choosing "+ Agregar nuevo…" to type one, which is added to the list, so every cart of the same store has the same name. A new Supermercados page (linked from the carts header) adds, renames and deletes stores; renaming one renames its carts too. Needs the backend's stores endpoints ([finview-backend#39](https://github.com/joaquin-p-olivera/finview-backend/pull/39)). ([#42](https://github.com/joaquin-p-olivera/finview-frontend/pull/42))

## [1.3.0] - 3 Oct 2026

### Added

- Offline/hybrid mode for shopping: the cart, lists and purchase dashboard open from a copy saved on the phone and refresh in the background, and adding, editing or removing cart products (and ticking a list item into the cart) is shown at once and queued on the phone, then sent automatically when there's a connection, without duplicates. A banner shows how many changes are still unsent. A service worker keeps the app itself on the phone so it opens without signal. Finishing a cart first sends the queue and waits for a connection if needed. Needs the backend's client-generated cart item ids ([finview-backend#35](https://github.com/joaquin-p-olivera/finview-backend/pull/35)). ([#39](https://github.com/joaquin-p-olivera/finview-frontend/pull/39))

### Changed

- The hint shown when a load or login takes longer than 5 seconds now reads "Está tardando más de lo normal..." instead of saying the server is waking up, since slow mobile connections cause it too. ([#38](https://github.com/joaquin-p-olivera/finview-frontend/pull/38))

## [1.2.0] - 30 Sep 2026

### Added

- The app wakes the API up as soon as it loads, and slow logins and full-screen loaders now say the server is waking up instead of showing a bare "Cargando...". ([#35](https://github.com/joaquin-p-olivera/finview-frontend/pull/35))

### Fixed

- API requests now time out instead of hanging and are retried automatically when they get no response or a gateway error; writes send an `Idempotency-Key` so a retried one (e.g. adding a product to a cart) isn't applied twice. Errors explain when the server didn't respond, a failed refresh after adding a cart item no longer leaves the cart page, and a failed `/auth/me` on app load no longer logs the user out unless the token is actually invalid (401). ([#35](https://github.com/joaquin-p-olivera/finview-frontend/pull/35))

## [1.1.1] - 30 Sep 2026

### Fixed

- The purchase stats page now shows an error message when the stats fail to load, instead of silently rendering zeros. ([#31](https://github.com/joaquin-p-olivera/finview-frontend/pull/31))

## [1.1.0] - 30 Sep 2026

### Changed

- The production deploy workflow (`Deploy to Netlify`, `.github/workflows/deploy.yml`) is now manual-only: it no longer runs on every push to `master` and is started by hand from the Actions tab (`workflow_dispatch`), as in trip-trace-api. ([#28](https://github.com/joaquin-p-olivera/finview-frontend/pull/28))
- Bumped `react` and `react-dom` from 18.3.1 to 19.3.0 (Dependabot had only bumped `react`, so `npm ci` failed with a peer-dependency conflict until `react-dom` was bumped in the same PR). ([#21](https://github.com/joaquin-p-olivera/finview-frontend/pull/21))
- Bumped `react-router-dom` from 6.30.3 to 7.18.4. ([#22](https://github.com/joaquin-p-olivera/finview-frontend/pull/22))
- Bumped `zod` from 3.25.76 to 4.6.5. ([#23](https://github.com/joaquin-p-olivera/finview-frontend/pull/23))
- Bumped `vite` from 6.4.1 to 8.3.1, together with `@vitejs/plugin-react` from 4.7.0 to 6.1.1 (plugin-react 4 doesn't support vite 8). ([#19](https://github.com/joaquin-p-olivera/finview-frontend/pull/19))
- Upgraded Tailwind CSS from 3.4.19 to 4.3.3 with the official upgrade tool: PostCSS now uses `@tailwindcss/postcss` (`autoprefixer` removed), `src/styles.css` imports `tailwindcss` and keeps v3's default border color, `tailwind.config.js` was removed, and renamed utilities were updated (`shadow-sm` → `shadow-xs`, `outline-none` → `outline-hidden`, `rounded` → `rounded-sm`). ([#25](https://github.com/joaquin-p-olivera/finview-frontend/pull/25))

## [1.0.0] - 30 Sep 2026

### Added

- CI: every PR to `develop` or `master` now runs `Frontend Checks / check` (`.github/workflows/checks.yml`) — `npm ci` plus `vite build` on Node 22, so a broken build or an out-of-sync lockfile fails the PR instead of the deploy. Also runnable by hand, and reused by the deploy workflow. ([#18](https://github.com/joaquin-p-olivera/finview-frontend/pull/18))
- Configured Dependabot (npm + github-actions), monthly, opening its PRs against `develop`. ([#18](https://github.com/joaquin-p-olivera/finview-frontend/pull/18))
- Added an automatic backport: when `master` gets something `develop` doesn't have (e.g. a hotfix merged straight to `master`), a PR bringing it back into `develop` is opened (`.github/workflows/backport-to-develop.yml`). ([#18](https://github.com/joaquin-p-olivera/finview-frontend/pull/18))

### Changed

- Production deploys to Netlify now go through GitHub Actions (`.github/workflows/deploy.yml`): every push to `master` runs the checks first and, only if they pass, builds that exact commit with the production `VITE_API_BASE_URL` and publishes `dist/` with `netlify-cli`. Netlify skips its own production build (`ignore` command in `netlify.toml`), but still builds deploy previews for PRs. It can also be run by hand (`workflow_dispatch`) to deploy any branch's current commit — deploying anything other than `master` requires confirming with `confirm_non_master: 'yes'`. Requires the `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID` repo secrets and a `VITE_API_BASE_URL` repo variable (set up outside this repo, in GitHub's settings). ([#18](https://github.com/joaquin-p-olivera/finview-frontend/pull/18))

### Fixed

- Regenerated `package-lock.json`, which had been out of sync with `package.json` since the last dependency bump ([#17](https://github.com/joaquin-p-olivera/finview-frontend/pull/17)) — `npm ci` refused to install. `dist/` is now gitignored. ([#18](https://github.com/joaquin-p-olivera/finview-frontend/pull/18))
