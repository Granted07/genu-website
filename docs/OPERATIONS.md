# Operations

## Required production configuration

Set these environment variables in the deployment platform:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_PASS_HASH`
- `ADMIN_JWT_SECRET` (at least 16 characters; use a long random value)
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

Redis is required for shared rate-limit and cache state across serverless instances. Without it, the app uses per-instance memory fallbacks.

## Admin authentication

`POST /api/admin/auth` checks the bcrypt password once and returns a short-lived JWT while also setting the `admin_session` HTTP-only cookie. Admin routes accept either that cookie or an `Authorization: Bearer <token>` header. Rotate `ADMIN_JWT_SECRET` to revoke all active sessions.

## Rate limits and uploads

The root middleware applies a global limit to `/api/*`. Route-level limits protect public reads, login attempts, authenticated admin requests, and uploads. Hall of Noise uploads are limited to 50 MB and are stored only after metadata insertion succeeds.

## Health monitoring

Monitor `GET /api/health` with an uptime service. A healthy response is HTTP 200 with `status: "ok"`; a database failure returns HTTP 503 with `status: "degraded"`.

## Database migration

Apply the SQL files in `supabase/migrations/` through the Supabase SQL editor or your migration pipeline. The content index migration is idempotent. Existing preview RPCs remain compatible; the app tries `offset_count` first and falls back to a bounded query until the RPCs are updated.

## Load testing

Start the app, then run:

```text
node scripts/load-test.mjs
```

Useful overrides are `BASE_URL`, `ENDPOINT`, `REQUESTS`, and `CONCURRENCY`. Run this only against an environment you own, and keep request counts within the script's limit.

## Error reporting

Set `ERROR_REPORTING_WEBHOOK` to receive JSON error events from the logger. The webhook must accept POST requests and should be protected by the deployment's secret-management and network controls.
