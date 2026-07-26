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
| `DATABASE_URL` | from step 1 |
| `JWT_SECRET_KEY` | a long random string -- `python -c "import secrets; print(secrets.token_urlsafe(48))"` -- **not** the `dev-secret-change-me` default |
| `CORS_ORIGINS` | your frontend's real URL once you know it, e.g. `https://cancer-aware-bharat.vercel.app` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `480` is fine to start; tighten later if you add refresh tokens |
| `UPLOAD_DIR` | `./uploads` -- see the note on file storage below |

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

### File uploads won't survive a redeploy

Uploaded patient reports currently land on local disk (`UPLOAD_DIR`).
Most container platforms wipe the filesystem on every deploy, and if you
ever run more than one backend instance, each instance only sees its own
uploads. Fine for a first launch; before real patient volume, swap
`backend/app/routers/enquiries.py`'s upload handler for S3-compatible
object storage (the platform's own blob storage, Cloudflare R2, or AWS S3
all work) -- the change is contained to that one file.

## 3. Deploy the frontend

Build command: `npm run build`. Output directory: `dist`. Set at build time:

| Variable | Value |
|---|---|
| `VITE_API_URL` | your backend's public URL from step 2, e.g. `https://cab-api.up.railway.app` |

Vite inlines `VITE_API_URL` into the JS bundle at build time -- if you
change the backend URL later, you must rebuild the frontend, not just
restart it.

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

Then in the browser: submit a patient enquiry, log in as the account you
created in step 2, confirm it shows up. That exercises frontend build,
backend connectivity, CORS, and the database in one pass.

## Not covered here (deliberately out of scope for this pass)

- CI/CD auto-deploy on push (the platforms above all support connecting a
  GitHub repo directly if you want that; `.github/workflows/ci.yml` only
  runs tests, it doesn't deploy)
- Refresh tokens / shorter-lived access tokens
- Object storage wiring for uploads (see note above)
- Custom domain + DNS setup
