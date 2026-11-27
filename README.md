# Expense Tracker

A production-quality MERN expense tracker built as a monorepo with an Express 5
API and a React 19 SPA. All money, charts, balances, budgets and goal progress
come from the authenticated API — there is no mock data in the app.

## Features

- JWT registration, login, session restore and client-side logout.
- Transactions with UTC dates, categories, accounts, attachments, notes,
  recurring templates and CSV export.
- History with search, type/category/account/recurring filters, date and amount
  ranges, pagination and filtered summaries.
- Accounts and custom categories with safe delete checks.
- Monthly overall/category budgets with inherited amounts and spending alerts.
- Savings goals with contributions and withdrawals.
- Analytics with live income/expense trends and category breakdowns.
- Responsive, accessible light/dark UI with loading, empty and error states.

## Repository layout

```
backend/   Express 5 + Mongoose + Zod API, Vercel serverless entrypoint
frontend/  React 19 + Vite 7 + React Router 7 + Tailwind 4 SPA
```

Backend folders follow MVC + services: `config`, `models`, `routes`,
`controllers`, `services`, `middleware`, `validators`, `utils`. Controllers are
thin; business logic lives in services. Every database query is scoped to the
authenticated user.

## Client documentation

A complete client-facing handover guide is available in `docs/`:

- `CLIENT_HANDOVER.md` — editable source document
- `CLIENT_HANDOVER.html` — print-ready version
- `CLIENT_HANDOVER.pdf` — ready to share with the client

It covers setup, daily usage, screen guides, API reference, security,
deployment, verification results, and troubleshooting.

## Local development

Requires Node.js 20+ and either a local MongoDB or MongoDB Atlas URI.

```bash
# backend
cd backend
npm install
cp .env.example .env       # set MONGO_URI, JWT_SECRET, CRON_SECRET, CLIENT_URL
npm run dev                # http://localhost:4000/api

# frontend (second terminal)
cd frontend
npm install
cp .env.example .env.local # VITE_API_URL=http://localhost:4000/api
npm run dev                # http://localhost:5173
```

### Environment variables

| Variable | Where | Purpose |
| --- | --- | --- |
| `MONGO_URI` | backend | MongoDB connection string (required) |
| `JWT_SECRET` | backend | HS256 signing secret (32+ chars in production) |
| `JWT_EXPIRES_IN` | backend | Token lifetime, e.g. `7d` |
| `CLIENT_URL` | backend | Comma-separated allowed frontend origins |
| `BCRYPT_ROUNDS` | backend | Password hashing cost (default 12) |
| `AUTH_RATE_LIMIT_MAX` | backend | Auth requests per window |
| `API_RATE_LIMIT_MAX` | backend | General API requests per window |
| `CURRENCY_SYMBOL` | backend | Symbol used in budget messages |
| `CRON_SECRET` | backend | Bearer secret for `/api/cron/recurring` (32+ chars in production) |
| `PORT` | backend | Local HTTP port (default 4000) |
| `VITE_API_URL` | frontend | Backend API base URL |
| `VITE_CURRENCY` | frontend | Currency symbol displayed in the UI |

See `backend/.env.example` and `frontend/.env.example`. Never commit `.env`
files.

## Verification

```bash
# backend
cd backend
npm run lint
npm test
npm run test:coverage

# frontend
cd frontend
npm run lint
npm test
npm run build
```

PowerShell users: run the commands on separate lines (`&&` is not supported in
Windows PowerShell 5.1).

## Deployment

- Backend: `backend/DEPLOYMENT.md` (Vercel serverless + MongoDB Atlas).
- Frontend: `frontend/DEPLOYMENT.md` (Vercel SPA + SPA rewrites).
- Deploy the backend first, set its URL as `VITE_API_URL`, then add the
  frontend origin to the backend's `CLIENT_URL` and redeploy the backend.

## Security notes

- Passwords are hashed with bcrypt (12 rounds configurable); JWTs carry an
  expiry and are verified on every protected route.
- Auth routes are rate limited; Helmet, a strict CORS allow-list and a 256 KB
  request body limit are enabled.
- All bodies, queries and params are validated with Zod; unknown fields are
  stripped and free text is sanitised.
- User input is escaped before use in regex filters, and `$`/`.` keys are
  rejected in queries or stripped from bodies before reaching MongoDB.
- Other users' resources always return `404`.
- Recurring work is claimed atomically and protected by a daily cron secret.
