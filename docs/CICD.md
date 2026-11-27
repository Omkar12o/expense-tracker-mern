# CI/CD flow — Expense Tracker

This document explains how the automated checks and deployments work.

## 1. Big picture

```text
Developer pushes code / opens a pull request
                  │
                  ▼
        GitHub Actions (CI)
   ┌────────────────┴────────────────┐
   │                                 │
backend-ci                       frontend-ci
npm ci                           npm ci
npm run lint                     npm run lint
npm test                         npm test
                                 npm run build
                                 upload dist artifact
   └────────────────┬────────────────┘
                  ▼
        PR must pass both checks
                  │
                  ▼  (merge to main)
     Vercel Git integration (CD)
   ┌────────────────┴────────────────┐
   │                                 │
backend project                  frontend project
Root: backend                    Root: frontend
Uses Vercel env vars             Uses VITE_* env vars
   └────────────────┬────────────────┘
                  ▼
        Production websites updated
```

Important: the CI workflow does **not** contain secrets. Tests use an in-memory
MongoDB, so GitHub Actions never needs `MONGO_URI`, `JWT_SECRET`, or any Vercel
token. Real environment variables are configured only in the Vercel dashboard.

## 2. What CI checks

### Backend job: `backend-ci`

Display name in GitHub: **Backend / lint + test**

Commands:

```bash
cd backend
npm ci
npm run lint
npm test
```

- `npm ci` installs exactly the versions in `backend/package-lock.json`.
- `npm run lint` catches unsafe or inconsistent code.
- `npm test` runs all backend suites against an in-memory MongoDB.
- MongoDB test binaries are cached in `~/.cache/mongodb-binaries` after the first run.

### Frontend job: `frontend-ci`

Display name in GitHub: **Frontend / lint + test + build**

Commands:

```bash
cd frontend
npm ci
npm run lint
npm test
npm run build
```

- `npm run build` proves the production Vite bundle can be generated.
- The generated `frontend/dist` folder is uploaded as a GitHub artifact named `frontend-dist`.

## 3. Files added

```text
.github/workflows/ci.yml   GitHub Actions CI workflow
docs/CICD.md               This guide
```

No `.env` file, secret, or token is included.

## 4. Set it up in GitHub

1. Commit and push the two files above. This guide was prepared locally and has
   **not** been pushed for you.
2. Open the GitHub repository → **Actions** tab → confirm workflows are enabled.
3. Go to **Settings → Branches → Branch rulesets** (or Branch protection rules).
4. Add a rule for `main`.
5. Enable **Require status checks to pass before merging**.
6. Select these checks:
   - `Backend / lint + test`
   - `Frontend / lint + test + build`
7. Enable **Require branches to be up to date before merging**.

Now no PR can be merged into `main` unless both backend and frontend pass.

## 5. Set it up in Vercel (CD)

Both Vercel projects must already be connected to this GitHub repository.

### Backend project: `expense-tracker-mern-qgx7`

- Root Directory: `backend`
- Framework: leave as Node/Other unless Vercel detected it correctly
- Install command: `npm install` (default is fine)
- Auto-deploy on push to `main`: enabled
- Environment variables in **Settings → Environment Variables**, for
  Production, Preview and Development:
  ```text
  MONGO_URI=<Atlas SRV URI with real URL-encoded password>
  JWT_SECRET=<64-char random secret>
  JWT_EXPIRES_IN=7d
  CLIENT_URL=https://expense-tracker-mern-neon.vercel.app
  BCRYPT_ROUNDS=12
  AUTH_RATE_LIMIT_MAX=20
  API_RATE_LIMIT_MAX=1000
  CURRENCY_SYMBOL=$
  CRON_SECRET=<different 64-char random secret>
  ```

### Frontend project: `expense-tracker-mern-neon`

- Root Directory: `frontend`
- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Auto-deploy on push to `main`: enabled
- Environment variables:
  ```text
  VITE_API_URL=https://expense-tracker-mern-qgx7.vercel.app/api
  VITE_CURRENCY=$
  ```

Do not create duplicate Vercel projects.

## 6. Daily workflow

### For a change

```bash
git checkout -b fix/my-change
# edit files
git add -A
git commit -m "fix: describe the change"
git push origin fix/my-change
```

Open a pull request on GitHub.

Wait for:

```text
Backend / lint + test ✅
Frontend / lint + test + build ✅
```

Then merge into `main`.

Vercel will create a new production deployment for each project. Check the
deployment commit SHA matches the merge commit.

## 7. Verify locally before pushing

Run the same commands CI runs:

```bash
# backend
cd backend
npm ci
npm run lint
npm test

# frontend
cd ../frontend
npm ci
npm run lint
npm test
npm run build
```

PowerShell users: run each command on its own line; `&&` is not supported in
older PowerShell versions.

## 8. Troubleshooting

| Problem | Cause | Fix |
| --- | --- | --- |
| `npm ci` fails in CI | Lockfile does not match `package.json` | Run `npm install` locally, commit the updated lockfile |
| Backend test slow on first CI run | MongoDB binary download | Wait once; the cache makes later runs fast |
| CI green but Vercel fails | Vercel env vars or Root Directory wrong | Check Vercel project settings, not GitHub Actions |
| CI red but Vercel deployed on a direct push | Branch protection only gates PR merges | Avoid direct pushes to `main`; use PRs |
| Need strict deploy-after-tests | Chosen flow uses Vercel Git auto-deploy | Switch to a Vercel CLI deploy job with `VERCEL_TOKEN` |

## 9. Why this design

- CI is fast, deterministic, and secret-free.
- Vercel keeps ownership of production environment variables and builds.
- PRs cannot be merged with broken tests or a broken production build.
- No duplicate projects and no deployment secrets in GitHub.

If you later want deployment to happen **only after** CI passes, add a second
workflow that uses the Vercel CLI with a `VERCEL_TOKEN` GitHub secret. That is a
different flow from the one selected here.
