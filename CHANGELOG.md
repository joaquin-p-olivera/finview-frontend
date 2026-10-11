# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres
to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Importar por mail: section "PDFs con contraseña" to save, replace and delete the password of each bank's protected statements (Santander uses the holder's ID number), so they can be imported by email. Passwords are sent to the backend, which stores them encrypted, and are never shown again. ([#74](https://github.com/joaquin-p-olivera/finview-frontend/pull/73))

## [1.9.1] - 10 Oct 2026

### Fixed

- "Subir estado" highlights importing by email: below the upload box, a card with an icon, a short explanation and an "Importar por mail" button replaces the small text link. The "Importar por mail" page now says the inbox is checked every 10 minutes instead of every hour. ([#70](https://github.com/joaquin-p-olivera/finview-frontend/pull/70))

## [1.9.0] - 10 Oct 2026

### Added

- "Importar por mail" page (`/email-import`, linked from the upload page and the help): shows the user's Finview forwarding address with a copy button, Gmail's forwarding confirmation code and link when it arrives, how to set up a Gmail filter, and the latest forwarded statements with their state (to review, confirmed, already imported, or the error, like a password-protected PDF) and a "Revisar" button. The address can be changed. The dashboard shows a notice when a statement is waiting for review. Needs the backend from [finview-backend#51](https://github.com/joaquin-p-olivera/finview-backend/pull/51). ([#67](https://github.com/joaquin-p-olivera/finview-frontend/pull/67))

### Changed

- Uploading a statement: optional "Contraseña del PDF" field for protected PDFs (like Santander's), the API's error message is shown (wrong password, already uploaded, same bank and period already confirmed) and the parse can take up to 5 minutes. In the review screen each transaction comes with the AI category already selected, and the PDF preview shows the uploaded file from the browser, since Finview no longer stores it. Needs the backend from [finview-backend#49](https://github.com/joaquin-p-olivera/finview-backend/pull/49). ([#64](https://github.com/joaquin-p-olivera/finview-frontend/pull/64))
- Purchase analysis page (`/purchase/analysis`) now opens with the last 3 months selected instead of 12. ([#65](https://github.com/joaquin-p-olivera/finview-frontend/pull/65))

## [1.8.0] - 5 Oct 2026

### Added

- Landing page: opening Finview without being logged in shows what it is ("Tu plata, bajo la lupa"), how card statements and supermarket carts work, and buttons to create an account or log in, instead of going straight to the login form. The login page's "¿Qué es Finview?" link points to it. ([#60](https://github.com/joaquin-p-olivera/finview-frontend/pull/60))

## [1.7.0] - 5 Oct 2026

### Added

- "Ayuda" page (`/help`, linked from the shared header, also in the phone menu, and from the login page): a short, illustrated intro to Finview with the three steps for card statements, the three steps for supermarket carts, what Finview shows over time, how the cart works without signal and a few tips. ([#57](https://github.com/joaquin-p-olivera/finview-frontend/pull/57))

## [1.6.0] - 4 Oct 2026

### Added

- "Análisis" page for purchases (replaces the "Stats" link in the purchase header; the old per-cart totals stay linked from it): spend per category month by month and cart by cart, what went up and down in price since the last purchase, each product's price history by supermarket, your own supermarket inflation (same products compared month to month), where the money goes by product, and which supermarket is cheapest for products bought in more than one. Period of 3, 6 or 12 months, or everything. Needs finview-backend#45. ([#54](https://github.com/joaquin-p-olivera/finview-frontend/pull/54))
- "Categorizar con IA" on the Productos page: Claude categorizes every product without a category, using your categories or creating new ones, and the result says how many were categorized and which categories are new. Categories chosen by the AI show an "IA" tag (on products and on the categories page). Claude's suggestions appear on each product to confirm or dismiss: "¿es el mismo producto que X?" (Unir / No) and short notes, such as two very different prices. Needs finview-backend#44. ([#53](https://github.com/joaquin-p-olivera/finview-frontend/pull/53))
- Purchase products: a new "Productos" page (linked from the purchase dashboard) lists everything bought, grouped by product and category, with times bought, last price and store, and price range. Setting a product's category applies it to all of its purchases; two products that are the same can be merged, and the history from before products existed is grouped with one button. While adding to the cart, the product field suggests products already bought (also offline, from the saved list) with their category and last price. Needs finview-backend#43. ([#52](https://github.com/joaquin-p-olivera/finview-frontend/pull/52))
- MIT license (`LICENSE`). ([#51](https://github.com/joaquin-p-olivera/finview-frontend/pull/51))
- Finview has a logo: the browser tab and the phone home screen show a magnifying glass over a rising line, and the header shows that icon next to "Finview" instead of plain text. ([#50](https://github.com/joaquin-p-olivera/finview-frontend/pull/50))

## [1.5.0] - 3 Oct 2026

### Added

- Reportes page (`/reports`, linked from the dashboard header): pick a confirmed statement and see, for UYU and USD separately, the statement total, a category pie and a table with each category's amount and share plus the other charges (insurance, interest, fees), the same numbers as the monthly Itaú report email. Needs the backend's statement report ([finview-backend#41](https://github.com/joaquin-p-olivera/finview-backend/pull/41)). ([#47](https://github.com/joaquin-p-olivera/finview-frontend/pull/47))

### Fixed

- The header no longer overflows on phones: "Finview", a one-line "Subir estado" button and a menu button fit the screen, and the menu holds the page links, the username and "Cerrar sesión". The color picker on Categorías no longer runs off the screen on phones: the form stacks and the colors wrap onto two rows. Desktop is unchanged. ([#45](https://github.com/joaquin-p-olivera/finview-frontend/pull/45))
- Editing a product in the cart no longer runs off the screen on phones: the name goes on its own line, then price and quantity, then "Guardar" and "Cancelar". Desktop is unchanged. ([#46](https://github.com/joaquin-p-olivera/finview-frontend/pull/46))
- The dashboard no longer adds dollars to pesos: a UYU / USD toggle switches every chart and total to one currency, and amounts are formatted in that currency. ([#47](https://github.com/joaquin-p-olivera/finview-frontend/pull/47))

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
