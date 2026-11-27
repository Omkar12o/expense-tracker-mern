# Backend deployment (Vercel + MongoDB Atlas)

## 1. MongoDB Atlas

1. Create a free **M0** cluster.
2. Create a database user with least privilege (`readWrite` on the expense tracker database only).
3. Under **Network Access**, allow `0.0.0.0/0` because Vercel egress IPs are dynamic.
4. Copy the SRV connection string and replace `<password>` with the database user password.

## 2. Vercel CLI

```bash
cd backend
npm install -g vercel
vercel login
vercel link            # choose/create the "expense-tracker-backend" project, root directory = backend
vercel env add MONGO_URI production
vercel env add JWT_SECRET production       # 32+ random chars
vercel env add JWT_EXPIRES_IN production   # 7d
vercel env add CLIENT_URL production       # frontend URL, no trailing slash
vercel env add BCRYPT_ROUNDS production     # 12 (minimum in production)
vercel env add AUTH_RATE_LIMIT_MAX production # 20
vercel env add API_RATE_LIMIT_MAX production  # 1000
vercel env add CURRENCY_SYMBOL production  # $
vercel env add CRON_SECRET production      # random 32+ chars
vercel --prod
```

`JWT_SECRET` and `CRON_SECRET` are required in every environment and have no
production defaults. Set both in the backend Vercel project before deploying;
use independent random strings of at least 32 characters. Vercel injects
`CRON_SECRET` as `Authorization: Bearer <CRON_SECRET>` for cron calls.

After the first deploy, sync indexes once against production Atlas:

```bash
MONGO_URI='mongodb+srv://...' npm run sync:indexes
```

## 3. Smoke test

```bash
BACKEND=https://your-backend.vercel.app/api

curl -s "$BACKEND/health"          # https://<backend-domain>/api/health
curl -s "https://your-backend.vercel.app/health"  # root-level alias
curl -s -X POST "$BACKEND/auth/register" -H 'Content-Type: application/json' \
  -d '{"name":"Smoke User","username":"smoke_demo","email":"smoke@example.com","password":"Password123!"}'

curl -s -X POST "$BACKEND/auth/login" -H 'Content-Type: application/json' \
  -d '{"username":"smoke_demo","password":"Password123!"}'

TOKEN='paste-the-token-from-login-here'
curl -s "$BACKEND/auth/me" -H "Authorization: Bearer $TOKEN"
curl -s -D - "$BACKEND/transactions/export" -H "Authorization: Bearer $TOKEN" -o export.csv
head -1 export.csv   # Date,Type,Category,Account,Amount,Note
```

## 4. Serverless caveats

- `api/index.js` handles `/api`, and `api/[...path].js` forwards every `/api/*` request to the same Express app. No internal rewrite is used, so Vercel preserves the original request path.
- No `setInterval` in the API app; recurring work is triggered by access, the daily Vercel cron, and a local-only timer in `server.js`.
- No persistent disk; attachments are validated http(s) links only.
- Rate-limit counters are in memory and therefore per serverless instance. Upgrade path: store counters in MongoDB/Redis with a shared key.
- Password hashing uses at least 12 bcrypt rounds in production; database
  connections are pooled with `maxPoolSize: 5` to limit cold-start overhead.
- Mongoose connection and promise are cached on `globalThis` for warm invocations.
