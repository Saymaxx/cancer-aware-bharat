FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Runs as root by default otherwise -- a container-escape or dependency RCE
# then has root inside the container for free. uid/gid 1000 is arbitrary but
# fixed, so bind-mounted volume ownership stays predictable across runs.
RUN groupadd -g 1000 appuser && useradd -u 1000 -g appuser -m appuser \
    && chown -R appuser:appuser /app
USER appuser

# Orchestrators (Docker Compose, Kubernetes, ECS) use this to know when the
# container is actually ready to serve traffic and to restart it if it
# silently wedges -- there was previously no signal at all.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health', timeout=3)" || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
