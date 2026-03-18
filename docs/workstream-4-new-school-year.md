# Workstream 4: New School Year Re-setup Flow

## Goal

Ensure the app transitions gracefully between school years. Prompt returning parents to verify their color-to-art mappings. Handle ICS feed URL changes without code deploys.

## Context

- The ICS feed spans Aug 2024 - June 2026 -- it will expire
- Color-to-art mappings change each school year (different teachers, different schedules)
- The existing setup page already supports editing students and their mappings
- A prior bug (`8504e68`) resurrected deleted students via the localStorage-to-DB migration -- this pattern is fragile
- No `schoolYear` or `lastVerifiedAt` metadata exists on student records
- The school publishes a new calendar each year, likely with a new ICS URL

## Strategy

Lay the groundwork now with schema changes (cheap). Build the UI closer to summer (July). Plan the human process for obtaining the new ICS URL.

## Implementation Steps

### Now (March-April)

#### Step 4a: Schema -- add `lastVerifiedAt` and `schoolYear`

Add `lastVerifiedAt` timestamp to the students table. Add `schoolYear` to the `appConfig` table (shared with Workstream 1).

**Files:**
- Modify: `src/lib/db/schema.ts` -- add `lastVerifiedAt` column to students table
- Use: `appConfig` table from Workstream 1 -- store `schoolYear` key (e.g., "2025-2026")

**Schema change:**
```sql
ALTER TABLE students ADD COLUMN last_verified_at TIMESTAMP;
-- In appConfig table:
INSERT INTO app_config (key, value) VALUES ('schoolYear', '2025-2026');
```

#### Step 4b: Update `lastVerifiedAt` on save

When a student's color map is saved (add or update), set `lastVerifiedAt` to current timestamp.

**Files:**
- Modify: `src/app/api/students/route.ts` -- set `lastVerifiedAt` in PUT handler

#### Step 4c: Stale badge on homepage

If any student's `lastVerifiedAt` is >10 months old, show a subtle "Last updated: [month year]" below their name in the hero card.

**Files:**
- Modify: `src/app/page.tsx` -- add conditional badge in `HeroColor` student cards

**Style:** `text-ink-muted text-xs` -- e.g., "Last updated: Sep 2025"

### Later (July-August)

#### Step 4d: Re-setup prompt

Full-width card above the hero card prompting returning users to review their mappings.

**Files:**
- Modify: `src/app/page.tsx` -- add `NewYearPrompt` component

**When to show:**
- Current date is August 1 - September 15
- AND user has existing students
- AND `schoolYear` in appConfig doesn't match current school year
- AND prompt hasn't been dismissed this cycle

**UX specs:**
- White rounded-2xl card with left accent border in `bg-ink`
- Headline (Fredoka bold): "New school year?"
- Body (DM Sans): "Your kids' classes may have changed. Take a minute to check."
- Primary CTA: "Review mappings" -- navigates to setup page in review mode
- Secondary: "Everything's the same" -- updates `schoolYear`, dismisses for the year
- Tertiary (smallest text): "Remind me next week" -- snoozes 7 days
- Max 3 snoozes, then becomes persistent (non-dismissible)

**Dismiss logic:**
- "Remind me next week": store `dismissedUntil` in localStorage, re-show after 7 days
- "Everything's the same": update `schoolYear` in appConfig, update all students' `lastVerifiedAt`
- After 3 snoozes: card becomes non-dismissible, only "Review mappings" and "Everything's the same" remain

#### Step 4e: Review mode on setup page

Setup page loads with all students in edit mode, pre-populated with existing data.

**Files:**
- Modify: `src/app/setup/page.tsx` -- add `reviewMode` query param support

**UX specs:**
- All student cards auto-expand into edit forms
- Each color row shows "Still [Art name]?" hint in `text-ink-muted text-xs`
- Saving a student updates `lastVerifiedAt` and collapses that card with success animation (from Workstream 3)
- After all students reviewed, show confirmation: "All set for the new year!" with brief color-dot bounce animation
- CTA: "See today's schedule" -- navigates home
- Optional: "Remove [student]" link for graduated/transferred students -- "[Name] no longer at this school?"

#### Step 4f: ICS URL update process (human + technical)

Document and prepare for the annual ICS feed URL change.

**Human process (May-June):**
1. Contact school admin to request next year's calendar ICS URL
2. Verify the new URL returns valid ICS data with color events
3. Update the `appConfig` DB row for `icsUrl` (or update `ICS_FEED_URL` env var + redeploy)

**Technical support:**
- Modify `fetchAndParseICS()` to check `appConfig.icsUrl` first, fall back to env var
- Use Workstream 1's health check to validate the new feed
- Create: `docs/annual-maintenance.md` documenting the process

**Files:**
- Modify: `src/lib/ics.ts` (or `schedule/route.ts`) -- DB-first ICS URL lookup
- Create: `docs/annual-maintenance.md`

## Dependencies

None. All built with existing stack.

## Key Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Dismissed prompt never returns -- parent runs stale schedule all year | Temporary dismissal (7 days), max 3 snoozes, then persistent |
| Deleted students resurrected by migration logic | Clear localStorage migration flag during re-setup; coordinate both storage layers |
| No schoolYear metadata to distinguish stale records | Adding `lastVerifiedAt` + `schoolYear` now (steps 4a-4b) |
| Partial re-setup (1 of 2 students updated) | Each student card saves independently; `lastVerifiedAt` tracks per-student |
| School changes color system entirely (new colors, different number) | Requires code changes regardless -- re-setup flow can't handle this automatically |
| False trigger mid-year | Use `schoolYear` comparison, not just date-based; only show Aug 1 - Sep 15 |
| ICS URL changes with no notice | Workstream 1 health monitoring detects feed failure; `appConfig` allows runtime URL update |

## Testing

- **Unit**: Test new-year detection with dates at year boundary (Aug 1, Sep 15, Sep 16, Jan 1)
- **Integration**: Simulate re-setup: update student -> verify `lastVerifiedAt` updated -> verify prompt dismissed
- **Integration**: Simulate dismiss -> snooze -> re-appear after 7 days
- **Integration**: Clear students -> verify migration doesn't resurrect old data
- **Manual**: Partial re-setup (update 1 of 2 students, close app, reopen) -- verify consistent state
- **E2E**: Full flow: old year data -> trigger prompt -> review all students -> verify homepage shows updated data

## Estimated Effort

- Steps 4a-4c (schema + stale badge, now): ~half day
- Steps 4d-4f (re-setup UI + URL process, July): ~1.5 days
