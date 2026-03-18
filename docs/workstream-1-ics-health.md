# Workstream 1: ICS Health & Resilience

## Goal

Prevent silent failures when the ICS calendar feed breaks, changes format, or goes stale. Ensure parents always know if the data they're seeing might be outdated.

## Context

- The app depends on a single Google Calendar ICS feed (URL in env var `ICS_FEED_URL`)
- The current in-memory cache (`src/app/api/schedule/route.ts`) dies on Vercel serverless cold starts
- On fetch failure, stale cache is served with `X-Cache-Status: stale` header, but the client never checks this
- The ICS feed data runs through June 2026 -- it will expire
- The real risk is not "feed goes down" (Google is reliable) but "feed format changes" (e.g., "RED" becomes "Red Day") causing every day to show "No School Today"

## Implementation Steps

### Step 1a: Persist schedule cache to DB

Add an `appConfig` table (key/value) to the database. After each successful ICS fetch, write the parsed color map + timestamp to DB. On cold start, seed from DB instead of returning empty data.

**Files:**
- Modify: `src/lib/db/schema.ts` -- add `appConfig` table
- Modify: `src/app/api/schedule/route.ts` -- write to DB after successful fetch, read from DB on cache miss

**Schema:**
```sql
CREATE TABLE app_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Step 1b: Content validation

After parsing ICS, verify the color map has entries for at least 3 upcoming weekdays. If not, flag `feedStatus: "degraded"`. Add fuzzy/case-insensitive color matching to handle format changes (e.g., "Red Day" still matches RED).

**Files:**
- Modify: `src/app/api/schedule/route.ts` -- add validation logic after parsing
- Modify: `src/lib/types.ts` -- add `feedStatus?: "fresh" | "stale" | "degraded"` to `ScheduleResponse`

### Step 1c: Client staleness banner

If `lastUpdated` is >4 hours old, show a subtle amber banner below the header: "Schedule last synced [time ago]." At 24+ hours, show with a "Retry" button.

**Files:**
- Modify: `src/app/page.tsx` -- add `StaleBanner` component

**UX specs:**
- 4+ hours stale: amber-tinted subtle banner, `text-ink-muted`, dismissible for session
- 24+ hours stale: amber background (`bg-day-yellow-soft`), non-dismissible, with "Retry" link
- Use `role="status"` and `aria-live="polite"` for screen readers
- Never block or replace the hero card -- banner goes above it

### Step 1d: Fetch timeout

Add `AbortController` with 10-second timeout to the ICS fetch to prevent hanging connections from blocking the API route.

**Files:**
- Modify: `src/app/api/schedule/route.ts` -- wrap fetch with AbortController

### Step 1e (Optional): Vercel cron health check

Add a daily health check cron that emails via Resend on failure. Vercel Hobby plan supports 1x/day.

**Files:**
- Create: `vercel.json` -- cron config
- Create: `src/app/api/cron/health/route.ts` -- health check endpoint

**Cron config:**
```json
{ "crons": [{ "path": "/api/cron/health", "schedule": "0 11 * * *" }] }
```

## Dependencies

- None required for steps 1a-1d
- Optional: `resend` npm package for email alerts (step 1e)

## Key Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| ICS format change silently breaks all color parsing | Content validation (1b) detects empty color maps; fuzzy matching handles name variations |
| In-memory cache lost on cold start | DB-persisted cache (1a) survives restarts |
| Staleness banner is too aggressive, erodes trust | Threshold at 2x cache TTL (4 hours); dismissible at lower severity |
| Health check false positive (reports OK but content is wrong) | Validate content (parsed colors for upcoming days), not just HTTP status |

## Testing

- **Unit**: Test `parseICSData` with valid ICS, empty ICS, wrong summary names, mixed valid/invalid events
- **Unit**: Test content validation -- verify it detects empty color maps from structurally valid ICS
- **Integration**: Mock fetch returning 200/403/404/500/timeout, verify stale cache served + banner shown
- **Manual**: Change `ICS_FEED_URL` to invalid URL, verify degradation behavior

## Estimated Effort

Small (~1 day for steps 1a-1d, +half day for 1e)
