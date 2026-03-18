# Shared Prerequisites

These tasks are shared across multiple workstreams and should be done first.

## P1: Extract ICS logic to shared module

Move `fetchAndParseICS()` and `parseICSData()` from `src/app/api/schedule/route.ts` into `src/lib/ics.ts`. This is the single most impactful refactor -- it enables reuse by:
- Schedule API route (existing)
- Health check endpoint (Workstream 1)
- Notification sender (Workstream 2)
- Admin config validation (Workstream 4)

**Files:**
- Create: `src/lib/ics.ts`
- Modify: `src/app/api/schedule/route.ts` -- import from `lib/ics.ts`

## P2: Add `appConfig` table to DB schema

Key-value store for app-wide settings. Used by Workstreams 1, 2, and 4.

**Files:**
- Modify: `src/lib/db/schema.ts`

**Schema:**
```sql
CREATE TABLE app_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Initial keys:**
- `schoolYear`: "2025-2026"
- `lastSuccessfulFetch`: ISO timestamp
- `cachedColorMap`: JSON string of the color map (persisted cache)

## P3: Add `lastVerifiedAt` column to students

Timestamp updated whenever a student's color map is saved. Enables stale-data detection for Workstream 4.

**Files:**
- Modify: `src/lib/db/schema.ts` -- add column
- Modify: `src/app/api/students/route.ts` -- set on save

## P4: Set up vitest with basic test config

No test infrastructure exists. Every workstream needs testing.

**Files:**
- Create: `vitest.config.ts`
- Create: `src/__tests__/` directory
- Modify: `package.json` -- add `vitest` dev dependency and `test` script

**Minimal config:**
```ts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
```

## P5: Persist schedule cache to DB

Fix the cold-start fragility. After each successful ICS fetch, write the parsed color map to the `appConfig` table. On cold start with cache miss, read from DB before falling back to a fresh fetch.

**Files:**
- Modify: `src/app/api/schedule/route.ts`

**Logic:**
1. Check in-memory cache (fast, existing behavior)
2. If miss, check DB `appConfig` for `cachedColorMap` + `lastSuccessfulFetch`
3. If DB cache is fresh enough (<1 hour), use it
4. Otherwise, fetch ICS feed
5. On successful fetch, update both in-memory cache AND DB

## Recommended Build Order

```
Week 1:  P1-P5 (prerequisites) + Workstream 3 (UI polish, low risk)
Week 2:  Workstream 1 (health/resilience)
Week 3:  Workstream 2 steps 2a-2e (email notifications)
Week 4:  Workstream 2 steps 2f-2g (service worker + web push, if needed)
July:    Workstream 4 steps 4d-4f (re-setup UI)
```

## DB Migration Plan

Run a single migration that covers all schema changes:

```sql
-- appConfig: key-value store for app-wide settings (Workstreams 1, 2, 4)
CREATE TABLE app_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- notificationPrefs: user notification settings (Workstream 2)
CREATE TABLE notification_prefs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  channel TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  endpoint TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add lastVerifiedAt to students (Workstream 4)
ALTER TABLE students ADD COLUMN last_verified_at TIMESTAMP;
```

## Open Questions

1. **Notification channel**: Email (free via Resend), SMS (~$1.35/year via Twilio), or Web Push (requires PWA install on iOS)?
2. **Admin UI**: Simple admin page for ICS URL updates, or just update env var / DB directly?
3. **Analytics**: Should we add GA4 events to validate assumptions (e.g., do parents use the week strip)?
