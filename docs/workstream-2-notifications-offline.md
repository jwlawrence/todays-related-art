# Workstream 2: Proactive Daily Notification + Offline Cache

## Goal

Send parents a morning notification with today's schedule so they don't need to open the app. Add offline support so the app works without network.

## Context

- The app's core promise is "answer the question in under 2 seconds" -- proactive notifications make it zero seconds
- No PWA service worker exists yet (manifest.json is present but basic)
- No push notification infrastructure exists
- Web Push on iOS requires PWA install (Add to Home Screen) -- conversion funnel is lossy
- For a small user base (1-5 families), email or SMS may be more reliable than Web Push
- The widget already provides a glanceable daily check -- notifications compete for the same job

## Strategy

Build notification logic delivery-channel-agnostic. Start with email (simplest, works everywhere), add Web Push as an enhancement later.

## Implementation Steps

### Step 2a: Extract ICS logic into shared module (Prerequisite)

Move `fetchAndParseICS()` and `parseICSData()` from the API route into a shared module. This is reused by schedule API, notification sender, and health check.

**Files:**
- Create: `src/lib/ics.ts` -- extracted ICS fetch/parse logic
- Modify: `src/app/api/schedule/route.ts` -- import from `lib/ics.ts`

### Step 2b: Notification content composer

New module that takes today's schedule + a user's students and produces notification text. Handles multi-student, notes, and no-school days.

**Files:**
- Create: `src/lib/notifications.ts`

**Examples:**
- Single student: "Emma has PE today -- bring sneakers"
- Multi student: "Emma: PE (bring sneakers) | Liam: Music"
- No school: "No school today -- enjoy the day off!"

### Step 2c: DB -- notification preferences table

Store user notification preferences and delivery endpoints.

**Files:**
- Modify: `src/lib/db/schema.ts` -- add `notificationPrefs` table

**Schema:**
```sql
CREATE TABLE notification_prefs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  channel TEXT NOT NULL, -- 'email' or 'push'
  enabled BOOLEAN NOT NULL DEFAULT true,
  endpoint TEXT, -- email address, or push subscription JSON
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Step 2d: Email notification via Vercel cron

Vercel cron at 7 AM ET (Mon-Fri) hits a notification API route. It force-fetches ICS (bypass cache), composes per-user messages, sends via Resend.

**Files:**
- Modify: `vercel.json` -- add cron entry
- Create: `src/app/api/cron/notify/route.ts` -- notification sender

**Cron config:**
```json
{ "path": "/api/cron/notify", "schedule": "0 12 * * 1-5" }
```
(12:00 UTC = 7 AM ET during EDT; adjust for EST: 0 12 * * 1-5)

**Critical safeguard:** The cron MUST force-fetch ICS (bypass in-memory cache) before generating payloads. Never send notifications from stale cache.

**DST handling:** Check current America/New_York time in the handler. If it's not between 6:30-7:30 AM local time, skip (handles DST transition edge cases). Or schedule two cron times to cover both UTC offsets.

### Step 2e: Opt-in UI

On the homepage (after setup complete, 2nd+ visit), show an inline card below the hero: "Get a morning reminder?" with email toggle.

**Files:**
- Modify: `src/app/page.tsx` -- add `NotificationOptIn` component

**UX specs:**
- White rounded-2xl card, matching existing card style
- Headline (Fredoka bold): "Get tomorrow's art the night before"
- Body (DM Sans, text-ink-light): "We'll email you each school morning so you know what to pack."
- CTA button: "Turn on reminders" -- `bg-ink text-cream rounded-2xl`
- Dismiss: "Not now" text link, `text-ink-muted`. If dismissed, hide for 2 weeks.
- After opt-in: brief confirmation with green checkmark + "Reminders are on" that fades after 3s
- Animate in with standard `animate-slide-up`

### Step 2f (Enhancement): Service worker + offline cache

Manual `public/sw.js` for offline support. Cache app shell on install, stale-while-revalidate for schedule API.

**Files:**
- Create: `public/sw.js` -- service worker (~50 lines)
- Modify: `src/app/layout.tsx` -- register service worker

**Caching strategy:**
- App shell (HTML, CSS, JS): cache-first (Next.js uses hashed filenames)
- `/api/schedule` responses: stale-while-revalidate -- show cached immediately, update in background
- Student data: already in localStorage, inherently offline

**Offline indicator:**
- When serving from cache with no network, show a tiny pill at the top: "Offline -- showing cached schedule" in `text-ink-muted text-xs`
- Include cached date -- if it doesn't match today, show "Cached from [weekday]" as a warning
- `role="status"`, `aria-live="polite"`

### Step 2g (Enhancement): Web Push

Add full Web Push support for users who install the PWA. Only build after email flow is proven.

**Files:**
- Create: `src/lib/vapid.ts` -- VAPID key management
- Create: `src/app/api/push/subscribe/route.ts` -- save push subscriptions
- Modify: `public/sw.js` -- add `push` event listener
- Modify: notification opt-in UI -- add push toggle (requires button click for permission)

**Dependencies:** `web-push` npm package

**iOS consideration:** Web Push only works for Home Screen PWAs (iOS 16.4+). Add a "Add to Home Screen" prompt before offering push notifications on iOS.

## Dependencies

- `resend` (email notifications, free tier: 100 emails/day)
- `web-push` (only for step 2g, Web Push enhancement)

## Key Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Notification sends wrong schedule (stale cache) | Force-fetch ICS in cron, never use in-memory cache for notifications |
| DST transition causes wrong timing | Check local time in handler; schedule cron for both UTC offsets |
| iOS Safari push requires PWA install | Start with email (works everywhere); add push as enhancement |
| Offline cache serves yesterday's schedule | Include date in cached response; show "Cached from [day]" warning if stale |
| Push subscription expires silently | Handle 410 Gone from push service, clean up stale subscriptions |
| Multiple devices get duplicate notifications | One notification per user (email), not per device |

## Testing

- **Unit**: Test notification content composer with: single student, multi student, notes, no school, missing color map
- **Unit**: Test DST boundary dates (2nd Sunday March, 1st Sunday November)
- **Integration**: Simulate cron with stale cache, verify fresh ICS fetch occurs
- **Integration**: Simulate push 410 Gone, verify subscription cleanup
- **Manual**: Test on iOS Safari (PWA), Chrome Android, desktop browsers
- **Manual**: Grant notification permission, revoke in settings, verify graceful handling
- **E2E**: Receive notification -> tap -> app opens -> verify displayed data matches notification

## Estimated Effort

- Steps 2a-2e (email notifications): ~2 days
- Steps 2f-2g (service worker + web push): ~2 more days
