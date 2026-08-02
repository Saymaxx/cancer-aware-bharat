# Cancer Aware Bharat

A full-stack platform for a cancer-awareness and early-detection NGO: patients submit symptom enquiries, hospitals partner and receive assignments, volunteers register and work campaigns, and admin/superadmin dashboards run day-to-day and org-wide operations.

- **Frontend**: React 19 + TypeScript, Vite, Tailwind CSS 4, React Router 7, TanStack React Query
- **Backend**: FastAPI + SQLAlchemy 2.0 + Alembic, PostgreSQL, JWT auth
- **Deploying?** See [`DEPLOYMENT.md`](DEPLOYMENT.md) for the real runbook — env vars, storage backend choice, and a post-deploy smoke test.

## Run it locally

**Prerequisites:** Node.js 20+, Python 3.12+, Docker (for Postgres) or a local PostgreSQL instance.

### 1. Database

```bash
cd backend
docker compose up -d
```

This starts Postgres on `localhost:5433` with the credentials `backend/.env.example` already expects. No Docker? Point `DATABASE_URL` at any Postgres instance instead.

### 2. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements-dev.txt
cp .env.example .env             # defaults are fine for local dev
alembic upgrade head
python -m app.seed                # creates demo accounts, password: ChangeMe123!
uvicorn app.main:app --reload
```

API docs (dev only — gated off when `ENVIRONMENT=production`): `http://localhost:8000/docs`

### 3. Frontend

```bash
npm install
npm run dev
```

Opens at `http://localhost:3000`. It calls the backend at `http://localhost:8000` by default (override with `VITE_API_URL`).

### Demo accounts (from `python -m app.seed`, local dev only)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@awarebharat.local` | `ChangeMe123!` |
| Super Admin | `superadmin@awarebharat.local` | `ChangeMe123!` |
| Hospital | `hospital1@awarebharat.local` | `ChangeMe123!` |

Never run `app.seed` against a production database — it refuses to run when `ENVIRONMENT=production` anyway. Use `python -m app.create_superadmin` for a real first account instead (see `DEPLOYMENT.md`).

## Tests

```bash
# Backend
cd backend && pytest -v

# Frontend
npm test          # or: npm run test:watch
npm run lint       # tsc --noEmit
```

## Project layout

```
backend/
  app/
    core/         config, security (JWT/bcrypt), rate limiting, storage, logging
    models/       SQLAlchemy models
    schemas/      Pydantic request/response schemas (CamelModel — snake_case in Python, camelCase on the wire)
    routers/      one router per resource
    services/     audit logging, notifications, email
  alembic/versions/  numbered, reversible migrations
  tests/          pytest, one file per router

src/
  components/     public site + four dashboards (admin-dashboard/, superadmin-dashboard/, hospital-dashboard/, volunteer-dashboard/, patient-dashboard/), one file per tab
  api/            client.ts (fetch wrapper), hooks.ts (React Query hooks), mappers.ts
```

## CI

`.github/workflows/ci.yml` runs on every push/PR: frontend type-check + build, backend pytest suite (against a real Postgres service container), an Alembic migration round-trip (`downgrade` then `upgrade`, not just `upgrade`), and a dependency vulnerability audit on both sides that fails the build on any new high/critical finding.
