# Cancer Aware Bharat — Backend

FastAPI + PostgreSQL API that replaces the frontend's `localStorage`-based
`enquiryStore.ts` mock. Field names on the wire are camelCase to match the
existing `src/types.ts` exactly.

## Local setup

```bash
cd backend
python -m venv .venv
.venv/Scripts/activate        # .venv/bin/activate on macOS/Linux
pip install -r requirements-dev.txt
cp .env.example .env          # edit if your DB creds differ

docker compose up -d          # starts Postgres on localhost:5432
alembic upgrade head          # creates all tables
python -m app.seed            # dev hospitals + admin/superadmin accounts

uvicorn app.main:app --reload --port 8000
```

Then open http://localhost:8000/docs for interactive API docs.

## Dev seed accounts

All seeded with password `ChangeMe123!`:

- `admin@awarebharat.local` — admin
- `superadmin@awarebharat.local` — superadmin
- `hospital1@awarebharat.local`, `hospital2@awarebharat.local` — hospital portal login

## Project layout

```
app/
  core/       config, DB session, JWT/password helpers
  models/     SQLAlchemy tables (mirrors src/types.ts)
  schemas/    Pydantic request/response models (camelCase aliases)
  routers/    HTTP endpoints
  services/   enquiry_workflow.py — the approve/assign/accept state machine,
              ported 1:1 from the frontend's enquiryStore.ts
alembic/      migrations
```

## Running tests

```bash
pytest
```
