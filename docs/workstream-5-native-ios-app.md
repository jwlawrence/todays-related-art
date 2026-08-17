# Workstream 5: Native iOS App (Capacitor Shell + Widget + Push)

## Goal

Ship an installable iOS app on the public App Store that removes the three gaps a PWA cannot close on iOS: a real home-screen widget, reliable notifications, and one-tap install without a browser. **No change to the web UI** — the app is a shell around the deployed site; the web repo remains the only place UI is built.

## Decisions (from design interview, 2026-08-16)

| Question | Decision |
|---|---|
| Why native at all | Home-screen widget, reliable push, install friction. Not "app feel." |
| Audience | Public App Store, any HCPS parent |
| Architecture | Capacitor WebView shell loading the deployed site; native code limited to widget, push, and auth glue |
| Widget v1 | Small widget only: today's class per student + bring-note |
| Widget data | **Local-first**: mappings bridged into App Group storage; widget fetches public `/api/schedule` and joins locally. Works anonymous — preserves "account is for sync, never for access" |
| Push v1 | In scope. **Anonymous device registration**: `{deviceToken, students[]}` posted to server, no account required |
| Push timing | **Night-before**, ~7:30 PM ET, only when tomorrow is a school day (silence otherwise) |
| Sign-in | Add Sign in with Apple as a next-auth provider (App Store guideline 4.8 requires it alongside Google) |
| Repo | This repo (monorepo): `ios/` beside `src/` |
| Platforms | iOS first; Android later (shell is ~free, Android widget is a separate Kotlin build) |
| App name | Working name "Today's Related Art"; finalize at submission |

## Architecture

```
┌─ iOS App ────────────────────────────────┐
│ Capacitor WebView ──loads──► <domain>    │
│                                          │
│ Native pieces:                           │
│  • WidgetKit extension (Swift)           │
│  • Push registration (APNs token → API)  │
│  • App Group storage (mappings bridge)   │
│  • Deep-link handler (auth return)       │
└──────────────────────────────────────────┘
         Web repo = the UI, forever.
```

## Known risks

- **Guideline 4.2 (minimum functionality).** Apple rejects apps that are "just a website." The widget, native push, and SIWA integration are the defense. Rejection-and-appeal is a real possibility; the mitigation is to submit with the widget prominent in screenshots and review notes.
- **Cross-device staleness.** Local-first widget data means mappings edited on another device don't reach the widget until the app is opened on the phone. Accepted for v1 (anonymous users are single-device anyway).

---

## Phase 0: Prerequisites (start today — both gate everything)

1. **Enroll in Apple Developer Program** ($99/yr, 1–2 days identity verification). Everything — TestFlight, push, widget entitlements — waits on this.
2. **Buy a custom domain and attach it to the Vercel project.** Not optional: the shell hardcodes the origin into a shipped binary, and the `apple-app-site-association` file for deep links is served from that origin. A `*.vercel.app` URL baked into the app means a project rename bricks every install. Bundle ID derives from the domain (e.g. `com.<domain>.app`).
3. **Add a `/privacy` page** to the web app. Required for App Store submission; also feeds the privacy-label declarations.

## Phase 1: Capacitor shell

Add Capacitor to this repo; shell loads the production URL (`server.url` in `capacitor.config.ts`). Next.js stays server-rendered — no static export.

- Add: `capacitor.config.ts`, `ios/` (generated), npm scripts (`cap:sync`, `cap:open`)
- Bundled offline fallback page (shell shows it when the origin is unreachable, with a retry) — a WebView that white-screens without network is a rejection magnet
- Status-bar/safe-area handling so the web UI isn't under the notch

**Exit criteria:** app runs on a real device from Xcode, site loads, feels indistinguishable from the PWA.

## Phase 2: Auth glue (the biggest hidden work item)

Google OAuth refuses to run in WebViews (`disallowed_useragent`), and the system-browser bounce **does not carry the session back** — the next-auth cookie lands in Safari's cookie jar, not the WebView's. Required flow:

1. Sign-in buttons in the app open the OAuth URL in `SFSafariViewController` (Capacitor Browser plugin).
2. On callback, the server mints a **short-lived single-use code** and redirects to the app's deep link (`https://<domain>/app-auth?code=…` via Universal Links).
3. The shell catches the deep link, and the WebView exchanges the code at a new endpoint (`/api/app-auth/exchange`) that sets the real session cookie in the WebView.

- Create: `src/app/api/app-auth/exchange/route.ts`, one-time-code storage (signed JWT or table)
- Add: `apple-app-site-association` served from the domain; deep-link handling in the shell
- Add: **Sign in with Apple** provider to next-auth (same bounce flow — no native SIWA plugin needed). Satisfies guideline 4.8.

**Exit criteria:** Google and Apple sign-in both complete inside the app; anonymous mode untouched.

## Phase 3: Widget (the headline feature)

- **Bridge:** Capacitor Preferences plugin configured with App Group `group.<bundleid>`. Whenever students/mappings change in the web UI (and on app launch), a small web-side hook writes the mappings JSON to the bridge — gated on `Capacitor.isNativePlatform()`.
- **Extension:** Swift WidgetKit target. Reads mappings via `UserDefaults(suiteName:)`, fetches public `/api/schedule`, joins color→class locally, renders per-student class + bring-note. Unmapped color states so plainly (product principle #4).
- **Timeline:** entry per day; reload after midnight ET and on app foreground. Handles no-school days with the next-school-day message.

**Exit criteria:** anonymous user, never signed in, sees today's class on the home screen.

## Phase 4: Push (night-before)

- **Registration:** native permission prompt + APNs token, then `POST /api/devices` with `{deviceToken, platform, students[]}`. Re-sync on mapping changes. Opt-in toggle lives in the web UI, shown only when `Capacitor.isNativePlatform()`.
- **Sender: FCM HTTP v1** (plain HTTPS — no APNs HTTP/2 dependency on Vercel's runtime, and it's the same sender Android will need). Reason stated so implementation doesn't re-derive it.
- **Cron:** two Vercel cron entries with **day-shifted schedules** because 7:30 PM ET crosses UTC midnight in winter: `30 23 * * 0-4` (EDT) and `30 0 * * 1-5` (EST), plus an in-handler America/New_York time guard so only one fires. Handler force-fetches ICS (never send from stale cache), resolves **tomorrow's** schedule, sends only when tomorrow is a school day.
- **Hygiene:** delete device rows on FCM "unregistered" responses — these rows hold kids' names; don't let dead tokens accumulate.
- Create: `src/app/api/devices/route.ts`, `src/app/api/cron/notify-eve/route.ts`, `devices` table in `src/lib/db/schema.ts`. Reuse the `lib/ics.ts` extraction and message composer already planned in workstream 2.

**Exit criteria:** phone on a shelf gets "Tomorrow: Emma has PE — bring sneakers" at 7:30 PM before a school day, and silence before a weekend.

## Phase 5: App Store submission

- Screenshots leading with the widget; review notes explaining the native integrations (4.2 defense)
- Privacy labels (data collected: student first names + mappings, device token; no tracking)
- Finalize app name; `/privacy` linked in App Store Connect
- TestFlight round with family before public release
- Update `PRODUCT.md` `Platform:` field as part of this change

## Later (explicitly out of v1)

- Android: Capacitor shell + FCM push are nearly free; the widget is a separate Kotlin implementation. Revisit on demand.
- Medium/lock-screen/week widgets; configurable push time; per-user push via account linking.
