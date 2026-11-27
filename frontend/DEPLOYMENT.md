# Frontend deployment (Vercel SPA)

## 1. Prerequisites

Deploy the backend first and have its public API URL ready, for example
`https://expense-tracker-backend.vercel.app/api`.

## 2. Vercel CLI

```bash
cd frontend
npm install -g vercel
vercel login
vercel link            # choose/create the "expense-tracker-frontend" project, root directory = frontend
vercel env add VITE_API_URL production   # https://your-backend.vercel.app/api
vercel env add VITE_CURRENCY production  # $
vercel --prod
```

Vercel detects Vite automatically (`npm run build`, output `dist`).
`frontend/vercel.json` rewrites unknown paths to `/index.html` so direct
navigation to routes such as `/transactions` works after a page refresh.

## 3. Backend CORS

The backend only accepts origins listed in its `CLIENT_URL` environment
variable. Add the deployed frontend origin (no trailing slash), then redeploy
the backend:

```bash
vercel env add CLIENT_URL production   # https://your-frontend.vercel.app
cd ../backend && vercel --prod
```

Multiple origins are supported as a comma-separated list, for example:
`https://expense-tracker.vercel.app,https://staging-expense-tracker.vercel.app`.

## 4. Smoke test

1. Open `https://your-frontend.vercel.app/register` and create a test account.
2. Add an account, a transaction, a budget, and a goal.
3. Visit `/analytics` and confirm the numbers match the transactions.
4. Refresh `/transactions` directly; the page must still load.
5. Open browser dev tools and confirm no `ORIGIN_NOT_ALLOWED` or `401` errors.

## 5. Notes

- `VITE_*` variables are embedded at build time; redeploy after changing them.
- JWTs are stored in `localStorage` under `expense-tracker-token`; logout clears
  them. There are no mock or hard-coded analytics values in the app.
- The app follows `prefers-color-scheme` for light/dark themes and is
  mobile-first with accessible labels and keyboard focus styles.
