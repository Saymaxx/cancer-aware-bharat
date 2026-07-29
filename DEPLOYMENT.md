# Deployment Runbook

Not deployed yet -- this documents how to, so it's a deliberate decision
whenever it happens rather than a scramble. Nothing here has been run
against real infrastructure.

## Recommended architecture

Three independently-hosted pieces, each on the platform best suited for it:

| Piece | Suggested host | Why |
|---|---|---|
| Postgres | Railway, Render, Neon, or Supabase (managed) | Backups, connection pooling, and upgrades handled for you |
| FastAPI backend | Railway, Render, or Fly.io | All three build directly from `backend/Dockerfile` |
| Static frontend | Vercel, Netlify, or Cloudflare Pages | Auto-detects Vite, zero-config CDN + HTTPS |

Self-hosting all three on one VPS with `docker compose` is also viable if
you'd rather manage it yourself, but isn't what's set up here.

## 1. Provision Postgres

Create the database on whichever provider you pick and note the connection
string. It needs to come out as SQLAlchemy's `postgresql+psycopg://` form,
e.g.:

```
postgresql+psycopg://user:password@host:5432/dbname
```

Most managed providers give you a `postgresql://` URL -- just swap the
scheme to `postgresql+psycopg://`.

## 2. Deploy the backend

Builds from [`backend/Dockerfile`](backend/Dockerfile). Set these environment
variables on the host:

| Variable | Value |
|---|---|
| `ENVIRONMENT` | `production` -- gates the two startup checks below (and refuses to run `app.seed`) |
| `DATABASE_URL` | from step 1 |
| `JWT_SECRET_KEY` | a long random string -- `python -c "import secrets; print(secrets.token_urlsafe(48))"` -- **not** the `dev-secret-change-me` default. With `ENVIRONMENT=production` set, the app now refuses to start on the placeholder or on anything under 32 characters, instead of just silently accepting it |
| `CORS_ORIGINS` | your frontend's real URL once you know it, e.g. `https://cancer-aware-bharat.vercel.app`. With `ENVIRONMENT=production` set, the app now refuses to start if this is still the localhost-only dev default |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `480` is fine to start; tighten later if you add refresh tokens. A token can also be revoked early via `/auth/logout`, which now actually invalidates it server-side rather than only clearing it client-side |
| `UPLOAD_DIR` | `./uploads` -- only used when `STORAGE_BACKEND=local` (the default); see the note on file storage below |
| `STORAGE_BACKEND` | `local` to start, `s3` before real patient volume -- see below |
| `LOG_LEVEL` | `INFO` is fine to start. All requests and unhandled errors are logged; see `backend/app/core/logging_config.py` |

**Run once after the first deploy** (as a one-off command / release step,
however your platform does that):

```bash
alembic upgrade head
python -m app.create_superadmin --email you@yourorg.org --name "Your Name" --role superadmin
```

Do **not** run `python -m app.seed` against production -- it creates
demo hospital/admin/volunteer accounts with the password `ChangeMe123!`,
documented in this repo's README. It exists for local dev only. Use
`create_superadmin.py` (above) for your first real account, then create
hospital accounts and further staff through the app itself once you're
logged in.

### File uploads: local disk vs. object storage

`STORAGE_BACKEND=local` (the default) writes uploaded patient reports to
`UPLOAD_DIR` on local disk. Most container platforms wipe the filesystem
on every deploy, and if you ever run more than one backend instance, each
instance only sees its own uploads -- fine for a first launch, not fine
once there's real patient volume.

To switch to object storage, set:

```bash
STORAGE_BACKEND=s3
S3_BUCKET=your-bucket-name
S3_REGION=ap-south-1               # match your bucket's region
# S3_ENDPOINT_URL=...              # only for a non-AWS endpoint (R2, MinIO)
```

Credentials are **not** app config -- set `AWS_ACCESS_KEY_ID` /
`AWS_SECRET_ACCESS_KEY` (boto3's standard env vars) on the platform, or
attach an IAM role/instance profile if your platform supports one, so the
key never has to live in this app's own settings or logs. The app refuses
to start with `STORAGE_BACKEND=s3` and no `S3_BUCKET` set (see
`backend/app/core/config.py`), the same way it refuses to start on a
placeholder JWT secret.

The bucket needs no public access at all -- every download still goes
through the authenticated `/enquiries/{id}/reports/{id}/download` route
(role/ownership-checked exactly as before), which streams the object
through the backend rather than issuing a public or presigned URL. See
`backend/app/core/storage.py` for the two backends; switching between
them touches no other file.

## 3. Deploy the frontend

Build command: `npm run build`. Output directory: `dist`. Set at build time:

| Variable | Value |
|---|---|
| `VITE_API_URL` | your backend's public URL from step 2, e.g. `https://cab-api.up.railway.app` (no path suffix -- the frontend appends `/v1` itself) |

Vite inlines `VITE_API_URL` into the JS bundle at build time -- if you
change the backend URL later, you must rebuild the frontend, not just
restart it.

Every route is mounted at both its original unprefixed path and again
under `/v1` (see `backend/app/main.py`); the frontend always calls the
`/v1` path. Nothing outside the frontend depends on this today, but if
you build another client against this API, prefer `/v1` too -- it's the
one that gets versioning guarantees going forward.

## 4. Close the loop on CORS

Once the frontend has a real URL, go back to the backend's `CORS_ORIGINS`
and set it to that exact origin (no trailing slash). Requests from the
frontend will fail silently (CORS block, not a clear error) until this
matches -- this bit us once already during local dev when the `.env` had
gone stale, see `git log --oneline | grep -i port` for the story.

## 5. Smoke test after every deploy

```bash
curl https://your-backend-url/health
```

`/health` actually runs `SELECT 1` against the database and returns 503
if that fails -- a 200 here means the app can really reach Postgres, not
just that the process is up. Wire this into your platform's own health
check / load balancer target if it supports one, so a database outage
gets caught automatically instead of waiting for a user to notice.

Then in the browser: submit a patient enquiry, log in as the account you
created in step 2, confirm it shows up. That exercises frontend build,
backend connectivity, CORS, and the database in one pass.

If something looks wrong afterward, two places to look before guessing:
the `audit_logs` table (every login success/failure and logout, with
role/IP/timestamp -- not tied to a specific patient case) for account
activity, and each enquiry's own timeline for anything patient-specific.

## Not covered here (deliberately out of scope for this pass)

- CI/CD auto-deploy on push (the platforms above all support connecting a
  GitHub repo directly if you want that; `.github/workflows/ci.yml` only
  runs tests, it doesn't deploy)
- Refresh tokens / shorter-lived access tokens
- Custom domain + DNS setup
