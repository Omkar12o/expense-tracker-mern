# Expense Tracker — Client Handover & Usage Guide

**Version:** 1.0  
**Date:** 27 November 2026  
**Audience:** Client, product owner, and future maintainers

---

## 1. Executive summary

Expense Tracker is a secure, responsive web application for recording income and expenses, managing accounts and categories, setting monthly budgets, tracking savings goals, and reviewing live analytics. Every figure shown in the interface is calculated from the signed-in user's own transactions. There are no demonstration numbers or hard-coded charts in the application.

The solution is delivered as a two-project monorepo:

- `backend/` — Express 5 REST API with MongoDB persistence.
- `frontend/` — React 19 single-page application with a mobile-first interface.

Both projects are prepared for deployment on Vercel. The backend uses a serverless entrypoint; the frontend uses SPA rewrites so deep links work after a page refresh.

---

## 2. Technology stack

| Area | Technology | Purpose |
| --- | --- | --- |
| Frontend framework | React 19 | Component-based user interface |
| Build tooling | Vite 7 | Fast development server and production build |
| Routing | React Router 7 | Public, protected, and not-found routes |
| Styling | Tailwind CSS 4 | Responsive utility-first design system |
| HTTP client | Axios | API calls with automatic bearer-token header |
| Charts | Recharts | Trend and category visualisations |
| Backend runtime | Node.js 20+ | JavaScript server runtime |
| API framework | Express 5 | REST routing and middleware pipeline |
| Database | MongoDB with Mongoose 8 | Document persistence and schemas |
| Validation | Zod 3 | Body, query, and parameter validation |
| Authentication | JWT plus bcryptjs | Signed sessions and password hashing |
| Security | Helmet, CORS allow-list, rate limiting | HTTP hardening and abuse protection |
| Testing | Jest, Supertest, Vitest, Testing Library | API and UI regression coverage |
| Hosting | Vercel | Serverless API and static SPA delivery |

---

## 3. Repository structure

```text
expense-tracker/
├── backend/
│   ├── api/              Vercel serverless entrypoint
│   ├── src/
│   │   ├── config/       Environment, database, and constants
│   │   ├── models/       Mongoose schemas and model logic
│   │   ├── routes/       Express route definitions
│   │   ├── controllers/  Thin HTTP controllers
│   │   ├── services/     Business logic and calculations
│   │   ├── middleware/   Auth, validation, sanitising, limits, cron auth
│   │   ├── validators/   Zod schemas
│   │   └── utils/        Shared helpers and response formatters
│   └── tests/            API integration tests
└── frontend/
    ├── src/
    │   ├── api/          Typed API client modules
    │   ├── components/   Auth, layout, dashboard, and UI components
    │   ├── context/      Auth and toast providers
    │   ├── hooks/        Reusable data-fetching hook
    │   ├── pages/        Route screens
    │   ├── routes/       Route guards
    │   └── utils/        Date and currency helpers
    └── src/test/         UI tests
```

Controllers only read validated data from `req.valid`. Business rules live in services. Every database query is scoped to `req.user._id`, so a user can never read or modify another user's records.

---

## 4. Local quick start

### 4.1 Requirements

- Node.js 20 or newer
- npm 10 or newer
- A MongoDB connection: local MongoDB or MongoDB Atlas
- Two terminals

### 4.2 Backend

```powershell
cd backend
npm install
Copy-Item .env.example .env
```

Edit `backend/.env` and set at least:

```text
MONGO_URI=mongodb://127.0.0.1:27017/expense-tracker
JWT_SECRET=replace-with-a-random-secret-at-least-32-characters
CRON_SECRET=replace-with-a-random-cron-secret-at-least-32-characters
CLIENT_URL=http://localhost:5173
```

Start the API:

```powershell
npm run dev
```

The API is available at `http://localhost:4000/api`. The health check is at `http://localhost:4000/health`.

### 4.3 Frontend

In a second terminal:

```powershell
cd frontend
npm install
Copy-Item .env.example .env.local
npm run dev
```

Open `http://localhost:5173`.

`frontend/.env.local` should contain:

```text
VITE_API_URL=http://localhost:4000/api
VITE_CURRENCY=$
```

### 4.4 Demo account

For local evaluation only, a demo account can be created with:

```text
Username: smoke_demo
Email:    smoke@example.com
Password: Password1231
```

Sign in with the **username** and password. The email address is kept for account records and also works as a legacy sign-in identifier.

This account belongs to the local database only. In production, users should register their own accounts.

---

## 5. How to use the application

### 5.1 Create an account

1. Open `http://localhost:5173/register`.
2. Enter your name, a username (3-30 letters, numbers or underscores), your email, and a password of at least eight characters containing a letter and a number.
3. Select **Create account**.
4. You will be signed in automatically and taken to the dashboard.

### 5.2 Sign in and sign out

1. Open `http://localhost:5173/login`.
2. Enter your username and password (an email address also works).
3. Select **Sign in**.
4. Use the profile menu in the top navigation to sign out.

If a session expires, the login screen displays a session-ended notice and returns you to your original page after signing in again.

### 5.3 Set up accounts

Accounts are the funding sources used by transactions.

1. Go to **Accounts**.
2. Add accounts such as Cash, Bank Account, Wallet, Credit Card, or Savings.
3. Enter an optional starting balance.
4. The displayed balance is calculated as: starting balance plus income minus expenses.

An account that has transactions cannot be deleted, which protects historical records.

### 5.4 Add categories

Categories organise transactions and budgets.

1. Go to **Categories**.
2. Built-in expense and income categories are already available.
3. Select **Add category** to create your own.
4. Custom categories can be removed when they are no longer used.

### 5.5 Record transactions

1. Go to **Transactions** and select **Add transaction**.
2. Choose income or expense.
3. Enter the amount, category, account, and UTC calendar date.
4. Add an optional note or HTTP(S) attachment link.
5. For recurring entries, enable recurrence and choose daily, weekly, monthly, or yearly.
6. Save the transaction.

Amounts are rounded to two decimal places. Dates use the `YYYY-MM-DD` UTC format so totals remain consistent across time zones.

### 5.6 Search, filter, and export

The Transactions screen supports:

- text search across notes and categories
- income or expense type
- category and account
- date range
- minimum and maximum amount
- recurring or one-time records
- pagination with filtered totals

Select **Export CSV** to download the current filtered result set. The export is escaped against spreadsheet formula injection.

### 5.7 Manage budgets

1. Go to **Budgets**.
2. Select the month.
3. Set an overall monthly limit and, optionally, per-category limits.
4. Spending is calculated from transactions for that month.
5. The interface shows ok, warning, high, critical, and exceeded states.

Budgets carry forward when a month has no explicit value, so repeated setup is unnecessary.

### 5.8 Track goals

1. Go to **Goals** and select **Add goal**.
2. Enter a name, target amount, optional starting amount, and optional target date.
3. Use **Contribute** to add money or a negative amount to withdraw.
4. Progress is calculated from the target and current amounts.

### 5.9 Review analytics

1. Go to **Analytics**.
2. Choose a range: week, month, three months, or year.
3. Review the income and expense trend and category breakdown.
4. Go to **Dashboard** for a current-month snapshot, recent transactions, accounts, and budget status.

All charts are generated by the API from stored transactions.

---

## 6. Screen guide

| Screen | Route | What it provides |
| --- | --- | --- |
| Login | `/login` | Secure sign-in with password visibility control |
| Register | `/register` | New account creation |
| Dashboard | `/dashboard` | Totals, trend, recent activity, accounts, budget status |
| Transactions | `/transactions` | CRUD, filters, search, pagination, CSV export |
| Analytics | `/analytics` | Date-range trends and category breakdown |
| Accounts | `/accounts` | Funding sources and calculated balances |
| Categories | `/categories` | Built-in and custom categories |
| Budgets | `/budgets` | Monthly overall and category limits with alerts |
| Goals | `/goals` | Savings targets, contributions, and withdrawals |

Every data screen includes loading, empty, and error states. The interface follows the operating system light or dark preference and is usable on phones, tablets, and desktops.

---

## 7. API reference

### 7.1 Conventions

All application endpoints are prefixed with `/api`. Health is available at `/health`.

Protected endpoints require:

```text
Authorization: Bearer <jwt>
```

Successful responses follow this shape:

```json
{
  "success": true,
  "data": {},
  "message": "Optional human-readable message"
}
```

Errors follow this shape:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {}
  }
}
```

### 7.2 Endpoints

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| GET | `/health` | Service health check | No |
| POST | `/api/auth/register` | Create an account | No |
| POST | `/api/auth/login` | Sign in and receive a JWT | No |
| GET | `/api/auth/me` | Restore the current user | Yes |
| POST | `/api/auth/logout` | Client-side session termination hook | Yes |
| GET | `/api/transactions` | List filtered transactions | Yes |
| GET | `/api/transactions/export` | Export filtered CSV | Yes |
| GET | `/api/transactions/:id` | Get one transaction | Yes |
| POST | `/api/transactions` | Create a transaction | Yes |
| PATCH | `/api/transactions/:id` | Update a transaction | Yes |
| DELETE | `/api/transactions/:id` | Delete a transaction | Yes |
| GET | `/api/accounts` | List accounts | Yes |
| POST | `/api/accounts` | Create an account | Yes |
| PATCH | `/api/accounts/:id` | Update an account | Yes |
| DELETE | `/api/accounts/:id` | Delete an unused account | Yes |
| GET | `/api/categories` | List categories | Yes |
| POST | `/api/categories` | Create a category | Yes |
| DELETE | `/api/categories/:id` | Delete an unused custom category | Yes |
| GET | `/api/budgets?month=YYYY-MM` | List budgets and status | Yes |
| PUT | `/api/budgets` | Create or update a budget | Yes |
| DELETE | `/api/budgets/:id` | Delete a budget | Yes |
| GET | `/api/goals` | List goals | Yes |
| POST | `/api/goals` | Create a goal | Yes |
| PATCH | `/api/goals/:id` | Update a goal | Yes |
| POST | `/api/goals/:id/contribute` | Add or withdraw goal funds | Yes |
| DELETE | `/api/goals/:id` | Delete a goal | Yes |
| GET | `/api/analytics?range=month` | Trend and category analytics | Yes |
| GET | `/api/dashboard` | Dashboard snapshot | Yes |
| GET, POST | `/api/cron/recurring` | Process due recurring entries | Cron secret |

### 7.3 Request examples

Register:

```json
{
  "name": "Client User",
  "email": "client@example.com",
  "password": "Password123"
}
```

Create a transaction:

```json
{
  "type": "expense",
  "amount": 18.75,
  "category": "Food",
  "account": "65a1b2c3d4e5f60718293a4b",
  "date": "2026-11-27",
  "note": "Team lunch",
  "isRecurring": false
}
```

Set a monthly category budget:

```json
{
  "month": "2026-11",
  "category": "Food",
  "amount": 500
}
```

Contribute to a goal:

```json
{
  "amount": 250
}
```

A negative contribution withdraws from the goal.

---

## 8. Environment variables

| Variable | Project | Purpose |
| --- | --- | --- |
| `NODE_ENV` | backend | Runtime mode |
| `PORT` | backend | Local API port, default `4000` |
| `MONGO_URI` | backend | MongoDB connection string |
| `JWT_SECRET` | backend | Token signing secret, 32+ characters in production |
| `JWT_EXPIRES_IN` | backend | Token lifetime, for example `7d` |
| `CLIENT_URL` | backend | Comma-separated allowed frontend origins |
| `BCRYPT_ROUNDS` | backend | Password hashing cost, minimum `12` in production |
| `AUTH_RATE_LIMIT_MAX` | backend | Auth requests per rate-limit window |
| `API_RATE_LIMIT_MAX` | backend | General API requests per window |
| `CURRENCY_SYMBOL` | backend | Currency symbol in server messages |
| `CRON_SECRET` | backend | Bearer secret for the recurring cron endpoint |
| `VITE_API_URL` | frontend | Backend API base URL (optional in production; `/api` is proxied automatically) |
| `VITE_CURRENCY` | frontend | Currency symbol displayed in the UI |

Only `.env.example` files are stored in the repository. Real `.env` and `.env.local` files must never be committed.

---

## 9. Security and privacy

- Passwords are hashed with bcrypt using at least twelve rounds in production.
- JSON Web Tokens carry an expiry and are verified on every protected request.
- Authentication and general API routes are rate limited.
- Helmet security headers and a strict CORS allow-list are enabled.
- Request bodies are limited to 256 KB.
- All bodies, queries, and parameters are validated with Zod; unknown fields are removed.
- Free text is stripped of HTML, and regular-expression input is escaped.
- Keys beginning with `$` or containing `.` are rejected or stripped before MongoDB access.
- All database queries are scoped to the authenticated user; other users' records return `404`.
- The recurring job requires a separate cron bearer secret.
- Production startup fails if JWT or cron secrets are missing or too weak.

The frontend stores the session token in browser `localStorage` under `expense-tracker-token`. Logging out clears the stored session.

---

## 10. Deployment

### 10.1 MongoDB Atlas

1. Create a MongoDB Atlas cluster.
2. Create a least-privilege database user with `readWrite` access to the expense tracker database.
3. Allow Vercel egress in Network Access.
4. Copy the SRV connection string and substitute the database user password.

### 10.2 Backend on Vercel

Deploy the backend first with project root `backend`. Set the environment variables listed in section 8. Use `backend/api/index.js` as the serverless entrypoint.

After the first deployment, synchronise indexes once:

```powershell
cd backend
$env:MONGO_URI = "mongodb+srv://..."
npm run sync:indexes
```

Configure a daily cron request to `GET /api/cron/recurring` with:

```text
Authorization: Bearer <CRON_SECRET>
```

### 10.3 Frontend on Vercel

Deploy the frontend with project root `frontend`. Vercel detects Vite automatically and builds with `npm run build`. Set:

```text
VITE_API_URL=https://your-backend.vercel.app/api
VITE_CURRENCY=$
```

`frontend/vercel.json` first proxies `/api/*` to the backend, then rewrites unknown paths to `/index.html`, so API calls and client-side routes such as `/transactions` both work on direct access and refresh.

### 10.4 CORS finalisation

Add the deployed frontend origin to the backend `CLIENT_URL`, with no trailing slash, then redeploy the backend. Multiple origins may be separated by commas.

### 10.5 Publication status

The code and configuration are deployment-ready. Publishing to a live Vercel domain requires client-owned Vercel access and the MongoDB Atlas connection string.

---

## 11. Verification and quality

### 11.1 Commands

```powershell
cd backend
npm run lint
npm test
npm run test:coverage
```

```powershell
cd frontend
npm run lint
npm test
npm run build
```

### 11.2 Latest verified results

| Check | Result |
| --- | --- |
| Backend lint | Clean |
| Backend tests | 37 of 37 passed |
| Backend line coverage | 91.13 percent |
| Backend service coverage | 94.87 percent |
| Frontend lint | Clean |
| Frontend tests | 31 of 31 passed |
| Frontend production build | Successful, no chunk-size warning |
| Backend file-size rule | No source file exceeds 250 lines |
| Frontend component rule | No component exceeds 200 lines |

---

## 12. Troubleshooting

| Symptom | Likely cause | Resolution |
| --- | --- | --- |
| Invalid email or password | Wrong credentials or wrong account | Confirm the exact registered email and password |
| `ORIGIN_NOT_ALLOWED` | Frontend origin missing from `CLIENT_URL` | Add the exact origin without a trailing slash and redeploy the backend |
| `401 Unauthorized` | Missing or expired token | Sign in again; confirm the bearer header is sent |
| Empty charts | No transactions in the selected range | Add transactions or choose a wider range |
| Deep link returns 404 on refresh | SPA rewrite missing | Confirm `frontend/vercel.json` is deployed with the frontend |
| Recurring entries not generated | Cron secret or trigger not configured | Check the cron request and `CRON_SECRET` |
| MongoDB connection failed | Invalid URI or network access | Verify `MONGO_URI`, database user, and Atlas network rules |
| HTTP 429 | Rate limit reached | Wait for the window to reset or raise the configured limit |

---

## 13. Maintenance recommendations

- Keep dependency versions patched and review audit output regularly.
- Rotate `JWT_SECRET` and `CRON_SECRET` when team access changes.
- Back up the MongoDB database on the provider's recommended schedule.
- Monitor API logs for repeated validation, authentication, or rate-limit failures.
- Re-run the verification commands in section 11 before every production release.
- If traffic grows, move rate-limit counters from process memory to a shared store such as Redis or MongoDB.

---

## 14. Support smoke test

After deployment, confirm the API before testing the interface:

```powershell
$api = "https://your-backend.vercel.app/api"
Invoke-RestMethod -Uri "$api/health"
```

Then open the frontend, register a test account, add an account and a transaction, set a budget, create a goal, and confirm that analytics match the entered transaction. Finally, refresh `/transactions` directly to confirm the SPA rewrite is active.
