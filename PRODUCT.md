# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Parents and caregivers of elementary students in **Howard County Public Schools (HCPS), Maryland**. HCPS elementary schools share one district-wide color-day rotation, so any HCPS parent is a potential user.

Today the real user base is the author's family plus a few friends. Wider sharing with the HCPS parent community is possible but not committed — the product is not currently promoted, onboarded, or supported at community scale.

The user is almost never sitting down. They are holding a phone with one hand while doing something else, and they need one fact.

## Product Purpose

Answer a single recurring question: **which related art (Music, Art, PE, Media, Technology/PE) does my child have on a given school day?**

HCPS publishes the rotation as color days (RED, BLUE, YELLOW, GREEN, ORANGE) rather than as class names, so a parent holding the school calendar still cannot answer the question. They must remember which color maps to which class for each child — a mapping that differs per child, per classroom, and per school year.

Success is the parent knowing what to pack, in seconds, without thinking about calendars or colors.

## Positioning

The district calendar publishes the color. The teacher's handout supplies the color-to-class mapping. No official source joins the two, and no general calendar app can — the mapping lives on paper in a backpack, and it is different for every child.

This product exists to hold that join: the district feed provides the day's color, the parent provides the meaning once, and every reading after that is instant.

## Operating Context

Four distinct moments, all confirmed as real:

| Moment | Question being asked | Distance |
|---|---|---|
| Morning scramble | "What does she have *today*?" | Seconds, one hand, high distraction |
| Night before | "What do I pack for *tomorrow*?" | Calmer, planning the next school day |
| Home-screen glance | "Anything I need to know?" | Zero-navigation; read without opening the app |
| Weekly planning | "What's coming this week?" | Sunday-shaped; gym shoes, library books, instruments |

The same question at four distances. Setup, by contrast, is a rare event — done once at the start of a school year and revisited when mappings change.

Source of truth is a public Google Calendar ICS feed ("ES Related Arts"), fetched server-side. Days resolve in `America/New_York`, the school's timezone, never the browser's.

## Capabilities and Constraints

**Confirmed functionality**

- Per-student color-to-related-art mapping, multiple students per household.
- Optional per-color "what to bring" note attached to a student (e.g. gym shoes on PE days).
- Today's resolved class, a next-school-day view when today is a day off, and a Mon–Fri week strip.
- Anonymous use backed by `localStorage`; Google sign-in adds cross-device sync via Postgres.
- A tokenized `/widget` surface that renders a compact daily view for home-screen use.
- Installable PWA (manifest present).

**Technical constraints**

- One district-wide ICS feed supplies the color for every user; only the color-to-class mapping is per-student. Multi-school support would mean multiple feeds, which the current model does not have.
- The feed URL is environment configuration (`ICS_FEED_URL`), changeable without a deploy.
- **The feed is extended in place each year, not replaced.** Verified 2026-08-16: the documented feed already carries the 2026–27 school year (2026-08-24 through 2027-06-08) on the same URL. This contradicts `docs/workstream-4-new-school-year.md`, which assumes each year brings a new URL and plans a human process around obtaining one.
- **A school year rolls over the mappings, not the feed.** The colors keep rotating, but which class a color means changes with new teachers and schedules. Nothing currently prompts a returning parent to re-verify, and a stale mapping fails silently — it shows a confident, wrong answer.
- Schedule caching is in-memory with a 1-hour TTL, which does not survive serverless cold starts.
- Google is the only auth provider.

**Terminology**

"Related art" is HCPS's own term for what other districts call specials or encore. Use the district's word, not a generic synonym. Color days are named by color only — the district never publishes the class name.

**Undecided**

- Whether the product is ever promoted beyond the author's circle to the broader HCPS community.
- Whether multi-district or multi-school support is ever pursued.

## Brand Commitments

Name: **Today's Related Art** (short form "Related Art", used in the PWA manifest and iOS web-app title).

No logo, wordmark, or brand guidelines exist. No voice or personality has been formally committed.

## Evidence on Hand

- **Live district ICS feed** — the real data source, in `ICS_FEED_URL`. Verified 2026-08-16 against the URL documented in `PLAN.md`: calendar "ES Related Arts", timezone `America/New_York`, 418 events spanning 2024-08-26 to 2027-06-08. Every `SUMMARY` is still a bare color name, so the format drift `PLAN.md` treats as the top risk has not occurred. Production's `ICS_FEED_URL` was not inspected and could point elsewhere.
- **Real users** — the author's family and a few friends. Genuine but small.
- **Google Analytics** installed (`G-SL0PYBP0X2`). Whether usable traffic data exists is unverified.
- **Planning docs** — `PLAN.md`, four workstream docs in `docs/`, and a homepage-login spec and plan under `docs/superpowers/`. These are plans, not shipped features; several describe work not yet built.
- **Missing assets** — `public/manifest.json` references `/icon-192.png` and `/icon-512.png`, neither of which exists. There is no app icon.

Do not fabricate testimonials, install counts, school endorsements, district affiliation, or usage metrics. This app has no relationship with HCPS beyond reading a public calendar, and must not imply one.

## Product Principles

1. **One fact, no navigation.** Every surface answers "what does my child have?" on arrival. Morning, night-before, widget, and weekly are the same question at different distances — none of them should require a tap to reach the answer.
2. **The account is for sync, never for access.** Anonymous use is a first-class path, not a degraded trial. Signing in adds cross-device continuity and nothing else.
3. **Color is a label, never the message.** Every color carries its name and the resolved class in text. A parent who cannot distinguish the swatches loses nothing.
4. **The district supplies the day; the parent supplies the meaning.** The app never guesses or defaults a color-to-class mapping. An unmapped color says so plainly rather than inventing an answer.
5. **A phone held one-handed is the target, not a compromise.** The single narrow column is the intended design, not a desktop layout waiting to happen.

## Accessibility & Inclusion

Colorblind accessibility is a **durable requirement**, not a nice-to-have. The five day colors include red and green — the most commonly confused pair — so color alone can never carry meaning. Text labels ship alongside every swatch, dot, and wash.

The reading context compounds this: outdoors, in morning light, at arm's length, in a hurry. Contrast and type size are functional requirements, not stylistic ones.
