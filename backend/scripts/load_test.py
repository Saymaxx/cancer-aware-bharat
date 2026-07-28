"""A first, deliberately simple load test -- not a replacement for a real
tool (Locust/k6) if this ever needs serious load characterization, but
enough to answer "does this endpoint fall over under concurrent traffic"
before that investment is justified. No extra dependencies: stdlib only.

Usage (server must already be running, e.g. `uvicorn app.main:app`):
    python scripts/load_test.py
    python scripts/load_test.py --url http://localhost:8000/hospitals --requests 500 --concurrency 50
"""
import argparse
import statistics
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed


def _one_request(url: str) -> tuple[bool, float, int]:
    start = time.perf_counter()
    try:
        with urllib.request.urlopen(url, timeout=10) as resp:
            status = resp.status
            resp.read()
        ok = 200 <= status < 300
    except urllib.error.HTTPError as exc:
        status = exc.code
        ok = False
    except Exception:
        status = 0
        ok = False
    elapsed_ms = (time.perf_counter() - start) * 1000
    return ok, elapsed_ms, status


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--url", default="http://localhost:8000/hospitals")
    parser.add_argument("--requests", type=int, default=200)
    parser.add_argument("--concurrency", type=int, default=20)
    args = parser.parse_args()

    print(f"Load testing {args.url} -- {args.requests} requests, concurrency {args.concurrency}")
    latencies: list[float] = []
    statuses: dict[int, int] = {}
    failures = 0

    start = time.perf_counter()
    with ThreadPoolExecutor(max_workers=args.concurrency) as pool:
        futures = [pool.submit(_one_request, args.url) for _ in range(args.requests)]
        for future in as_completed(futures):
            ok, elapsed_ms, status = future.result()
            latencies.append(elapsed_ms)
            statuses[status] = statuses.get(status, 0) + 1
            if not ok:
                failures += 1
    total_s = time.perf_counter() - start

    latencies.sort()

    def pct(p: float) -> float:
        idx = min(len(latencies) - 1, int(len(latencies) * p))
        return latencies[idx]

    print()
    print(f"Total time:      {total_s:.2f}s")
    print(f"Throughput:      {args.requests / total_s:.1f} req/s")
    print(f"Failures:        {failures}/{args.requests}")
    print(f"Status codes:    {statuses}")
    print(f"Latency (ms):    min={latencies[0]:.1f}  p50={pct(0.5):.1f}  p95={pct(0.95):.1f}  p99={pct(0.99):.1f}  max={latencies[-1]:.1f}  mean={statistics.mean(latencies):.1f}")


if __name__ == "__main__":
    main()
