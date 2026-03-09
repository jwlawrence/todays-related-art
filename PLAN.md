# Today's Related Art - Project Plan

## Overview

A simple web app that tells parents which related art (PE, Art, Music, Library, etc.) their children have on any given school day. The school publishes a color-coded Google Calendar (RED, BLUE, YELLOW, GREEN, ORANGE) where each color maps to a different related art per classroom/student.

## Data Source

- **ICS Feed URL:** `https://calendar.google.com/calendar/ical/58e6223a8e58d3fb75b3f3286bc566bd2f9e7bb631bed8499d4d219e4a454bb7%40group.calendar.google.com/public/basic.ics`
- Calendar name: "ES Related Arts"
- Timezone: `America/New_York`
- Events: All-day events with SUMMARY = color name (RED, BLUE, YELLOW, GREEN, ORANGE)
- Uses RRULE recurrence rules (weekly on specific days) with EXDATE exclusions
- Spans Aug 2024 - June 2026

## Phase 1 - MVP

### Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | Next.js 14+ (App Router) | Full-stack in one project, SSR, API routes |
| Language | TypeScript | Type safety |
| ICS Parsing | node-ical | Handles RRULE expansion + URL fetching |
| Styling | Tailwind CSS | Fast iteration, good for color-coded UI |
| Storage | localStorage (client-side) | No database needed for MVP |
| Deployment | Vercel (free tier) | Zero-config Next.js deploys |

### Architecture

```
Browser (localStorage)           Next.js API Route              Google Calendar
+--------------------+    GET /api/schedule?range=week   +-------------------+
| students: [        | -------------------------------->| Fetch ICS feed    |
|   { name: "Emma",  |                                  | (cached 1hr)      |
|     colors: {      | <--------------------------------| Parse RRULE       |
|       RED: "PE",   |    { days: [{date, color}] }     | Return date->color|
|       BLUE:"Art"   |                                  +-------------------+
|     }              |
|   }                |  Client-side: merge color->art
| ]                  |  mapping with server response
+--------------------+
```

### Data Flow

1. Server-side API route fetches and caches the ICS feed (1hr in-memory TTL)
2. API returns date-to-color mapping for requested range (today or week)
3. Client merges server response with locally-stored student color mappings
4. UI displays the resolved related art per student

### Key Design Decisions

- **No auth / no database for MVP** - Student config in localStorage only
- **Server-side ICS fetching** - Avoids CORS issues with Google Calendar
- **Timezone: always America/New_York** - "Today" resolved in school's timezone, not browser
- **PWA** - Installable on home screen for quick access
- **Color-blind accessible** - Text labels always shown alongside color swatches

### Views

#### Today View (Primary)
- Date + color badge prominently displayed
- Each student on one line: Name -> Related Art (large text)
- Goal: answer the question in under 2 seconds

#### Weekly Look-Ahead (Secondary)
- Mon-Fri horizontal strip (weather forecast style)
- Color dot + art name per student per day
- Today's column highlighted

### Pages / Routes

- `/` - Main view (today + weekly look-ahead)
- `/setup` - Add/edit students and their color mappings
- `/api/schedule` - Server-side API for ICS fetching/parsing/caching

### Edge Cases to Handle

- **No school today (weekend/holiday):** Show "No school today" + next school day's schedule
- **No students configured:** Redirect to setup page
- **ICS feed unavailable:** Serve from cache, show "last updated" timestamp
- **Unknown color in feed:** Log warning, display color name without mapping
- **Timezone:** All date logic uses America/New_York via date library

### Implementation Tasks

1. Initialize Next.js project with TypeScript + Tailwind
2. Build the ICS parsing API route (`/api/schedule`)
   - Fetch ICS feed from Google Calendar
   - Parse with node-ical (handles RRULE expansion)
   - Cache in memory (1hr TTL)
   - Return date-to-color map for requested range
   - All dates in America/New_York timezone
3. Build the student setup page (`/setup`)
   - Add student name
   - Map each of 5 colors to a related art (dropdown)
   - Save to localStorage
   - Support multiple students
   - Edit/delete existing students
4. Build the main dashboard (`/`)
   - Today view: date, color badge, each student's art
   - Weekly look-ahead: Mon-Fri strip
   - Handle no-school days gracefully
   - Color-blind accessible (text labels + patterns)
5. PWA setup (manifest.json, service worker basics)
6. Deploy to Vercel

## Phase 2 - Future Enhancements (not in scope for MVP)

- Google OAuth for cross-device sync
- Database (Turso/SQLite) for persistent user data
- Push notifications at 7 AM
- Manual color override fallback
- ICS health monitoring cron job
- Share config between co-parents
- Multi-school support

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| ICS feed URL changes | Store as env var; cache serves stale data on failure |
| Timezone bugs | Resolve "today" in America/New_York; unit test DST transitions |
| RRULE parsing errors | Use battle-tested node-ical; snapshot test fixtures |
| Color name format changes | Case-insensitive matching; trim whitespace |
| Feed temporarily unavailable | In-memory cache with stale-while-revalidate |
