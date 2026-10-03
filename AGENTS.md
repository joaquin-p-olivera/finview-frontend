# AGENTS.md - Finview Frontend

## Project Overview

React + Vite + Tailwind CSS frontend for Finview expense tracking app. Communicates with the backend API.

## Relationship with Backend

- **API Base**: Configured via `VITE_API_BASE_URL` environment variable
- **Backend Repo**: Separate repo (`finview-backend`)

## Commands

```bash
# Development
cp .env.development .env
npm run dev

# Build for production
npm run build
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_BASE_URL` | Backend API URL (e.g., `http://localhost:8000/api/v1`) | Yes |

### Environment Files

- `.env.default` - Template with all variables (committed to repo)
- `.env.development` - Local development values (gitignored)
- `.env.production` - Production template with empty values (committed to repo)

**Setup for development:**
```bash
cp .env.development .env
```

## Project Structure

```
src/
├── App.jsx           # Main app with routes
├── main.jsx          # Entry point
├── api/              # API client functions
│   ├── client.js     # Axios instance
│   ├── purchase.js   # Purchase module API calls
│   └── ...
├── pages/            # Page components
│   ├── purchase/     # Purchase module pages
│   │   ├── PurchaseDashboardPage.jsx
│   │   ├── PurchaseCartPage.jsx
│   │   ├── PurchaseListsPage.jsx
│   │   ├── PurchaseListDetailPage.jsx
│   │   ├── PurchaseCategoriesPage.jsx
│   │   └── PurchaseStatsPage.jsx
│   └── ...
├── components/       # Reusable components
├── store/           # State management (if any)
└── utils/           # Utility functions
```

## Purchase Module (Módulo de Compras)

UI layer for the purchase module. Corresponds to backend's `purchase_` endpoints.

### Pages

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/purchase` | Overview with quick actions, and a "Historial de Carritos" section listing completed carts (each links to its detail) |
| Cart | `/purchase/cart/:id` | Cart details — editable while active; read-only once completed |
| Lists | `/purchase/lists` | All shopping lists |
| List Detail | `/purchase/lists/:id` | Items in a list |
| Categories | `/purchase/categories` | Manage categories |
| Stats | `/purchase/stats` | Statistics and charts |

### Business Logic (shared with Backend)

1. **Shopping Cart**: Only 1 active cart at a time per user
2. **Shopping Lists**: User can have N lists for pre-shopping planning
3. **Categories**: Independent from expense categories
4. **New Flow**: Click checkbox on list item → modal asks for price/quantity → adds to cart → marks as checked

## API Client

All API calls go through `src/api/client.js` using Axios. API functions are in separate files (e.g., `purchase.js`).

```javascript
// Example API call
import { getActiveCart } from "../api/purchase";
```

## Styling

- **Framework**: Tailwind CSS
- **Theme**: Dark mode (slate-950 background)
- **Colors**: 
  - Primary: Indigo (`indigo-500`)
  - Success: Emerald (`emerald-500/600`)
  - Error: Red (`red-400`)
  - Text: Slate (`slate-50`, `slate-400`)

## Adding New Pages

1. Create component in `src/pages/`
2. Add route in `App.jsx`:
   ```jsx
   <Route path="/new-page" element={<NewPage />} />
   ```
3. Add navigation link in dashboard or other pages

## Adding API Endpoints

1. Add function in appropriate `src/api/*.js` file:
   ```javascript
   export const newEndpoint = async () => {
     const { data } = await api.get("/endpoint");
     return data;
   };
   ```

## State Management

- Local state with `useState` and `useEffect`
- React Router for navigation

## Charts

Using `recharts` library. See `PurchaseStatsPage.jsx` for examples.

## Offline / hybrid mode (purchase module)

Meant for the supermarket, where mobile data is unreliable:

- `public/sw.js` (service worker, registered in production from `main.jsx`) keeps `index.html` and the hashed `/assets/*` on the phone, so the app opens without signal. It never touches API calls.
- `src/offline/outbox.js`: queue of writes in localStorage (`finview.outbox`), sent in order with backoff when there's a connection (`online` event, app back in foreground, timer). Each write reuses its own `Idempotency-Key`; 400/404/409/422 drop the write (a `DELETE` that gets 404 counts as done), anything else keeps it. The queue is kept across logouts.
- `src/offline/purchaseOffline.js`: cached server data (`finview.cart.<id>`, `finview.list.<id>`, dashboard, categories) and helpers that lay queued writes over it (`applyCartOps`, `applyListOps`). Cart adds send a client-generated item `id`, which the backend uses to avoid duplicates even after a restart.
- Queued today: add/edit/delete cart items (cart page) and "check list item + add to cart" (list detail page). Everything else (creating carts or lists, categories, finishing a cart) still needs a connection; finishing a cart first sends the queue and refuses while anything is left.
- `SyncBanner` shows pending changes, connection errors and when saved data is being shown.

## Notes

- All monetary values displayed in UYU (Uruguayan Pesos)
- Dates formatted in `es-UY` locale
- Forms use controlled components
- Error handling with `try/catch` and user alerts
