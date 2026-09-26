const baseUrl = process.env.BASE_URL || "http://localhost:3000";
const endpoint = process.env.ENDPOINT || "/api/dod?page=1&pageSize=20";
const requests = Number(process.env.REQUESTS || 100);
const concurrency = Math.max(1, Number(process.env.CONCURRENCY || 10));

if (!Number.isInteger(requests) || requests < 1 || requests > 10000) {
  throw new Error("REQUESTS must be an integer between 1 and 10000");
}

const startedAt = performance.now();
let nextRequest = 0;
let completed = 0;
let failed = 0;
const statuses = new Map();

async function worker() {
  while (true) {
    const requestId = nextRequest++;
    if (requestId >= requests) return;

    try {
      const response = await fetch(new URL(endpoint, baseUrl));
      statuses.set(response.status, (statuses.get(response.status) || 0) + 1);
      if (!response.ok) failed++;
    } catch {
      failed++;
    } finally {
      completed++;
    }
  }
}

await Promise.all(
  Array.from({ length: Math.min(concurrency, requests) }, () => worker()),
);

const elapsedMs = performance.now() - startedAt;
console.log(
  JSON.stringify(
    {
      baseUrl,
      endpoint,
      requests: completed,
      failed,
      concurrency,
      elapsedMs: Math.round(elapsedMs),
      requestsPerSecond: Number((completed / (elapsedMs / 1000)).toFixed(2)),
      statuses: Object.fromEntries(statuses),
    },
    null,
    2,
  ),
);

process.exitCode = failed > 0 ? 1 : 0;
