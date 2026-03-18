# Workstream 3: Notes Visibility + Setup Polish

## Goal

Make "what to bring" notes visible beyond just the hero card (week strip + next day teaser). Add save confirmation feedback. Improve setup error handling.

## Context

- Notes already display in the hero card (`page.tsx:61-67`) with backpack emoji + frosted glass style
- Notes are NOT shown in the `WeekDay` component or `NextDayTeaser`
- The week strip is very compact: 5-column grid, text at 10-11px, ~64px per cell
- Setup uses browser-native `<datalist>` for related arts -- works fine for 5 options, no need to replace
- No success feedback after saving a student
- Silent save failures for authenticated users (fetch error not caught)

## Implementation Steps

### Step 3a: Notes in NextDayTeaser

Add notes below each student's art name in the NextDayTeaser component. This component has plenty of horizontal space -- notes fit naturally.

**Files:**
- Modify: `src/app/page.tsx` -- `NextDayTeaser` component

**Implementation:**
- After each student row (`student.name` + art), check `student.notes?.[nextDay.color!]`
- If note exists, render below with the same backpack-frosted-glass style from the hero card
- Style: `bg-cream-dark rounded-xl px-3 py-2` with backpack emoji + `text-ink-muted text-xs`

### Step 3b: Note indicator in WeekDay

Show a small backpack indicator on week strip days where any student has a note. Do NOT show full note text -- too compact.

**Files:**
- Modify: `src/app/page.tsx` -- `WeekDay` component

**Implementation:**
- After the color dot row, check if any student has `notes?.[day.color!]`
- If yes, show a small `text-[10px]` backpack icon centered below the dot
- No text, just the indicator -- signals "there's a note for this day"

### Step 3c: Tap-to-expand day detail

Tapping a WeekDay cell expands an inline card below the week strip showing full day info including notes.

**Files:**
- Modify: `src/app/page.tsx` -- `WeekStrip` component, new `ExpandedDay` component

**UX specs:**
- Track `selectedDay` state in `WeekStrip`
- On tap, render `ExpandedDay` card below the grid
- Card style: white rounded-2xl, shadow-sm, border cream-dark, `animate-slide-up`
- Content: day name, color label + dot, each student's art + full note (backpack style)
- Tap same cell again or different cell to collapse/swap
- `aria-expanded` on trigger cell, focus management to expanded panel

**Accessibility:**
- Entire WeekDay cell is the tap target (already a full div)
- Expanded panel gets `role="region"` with `aria-label="[Day] details"`
- Keyboard: Enter/Space to toggle, Escape to close

### Step 3d: Save success animation

After saving a student, show a brief green-tinted confirmation before transitioning to the normal card view.

**Files:**
- Modify: `src/app/setup/page.tsx`

**Implementation:**
- Add `justSaved` state (student ID or null)
- After `handleAdd`/`handleUpdate` resolves successfully, set `justSaved` to the student ID
- The StudentCard briefly renders with green-tinted background (`bg-day-green-soft`), checkmark icon, "Saved!" text in `font-display font-bold text-day-green`
- Auto-clear `justSaved` after 1.5s with `setTimeout`
- Use CSS transition (300ms) for the color change

### Step 3e: Note character limit

Cap notes at 60 characters with a character counter in the setup form. Truncate display in week strip with `line-clamp-1`.

**Files:**
- Modify: `src/app/setup/page.tsx` -- add `maxLength={60}` to notes input, add character counter
- Modify: `src/app/page.tsx` -- add `truncate` class to note text in compact views

**Counter style:** `text-ink-muted text-xs` aligned right below the input: "42/60"

### Step 3f: Error handling on save

Catch fetch failures in `handleAdd`/`handleUpdate` and show inline error message. Currently fails silently for authenticated users.

**Files:**
- Modify: `src/app/setup/page.tsx`

**Implementation:**
- Wrap the `addStudent`/`updateStudent` calls in try-catch
- On error, show inline error below the save button: "Couldn't save -- check your connection and try again" in `text-day-red text-sm`
- Do not close the form on error -- keep it open so data isn't lost

## Dependencies

None. All achievable with existing React + Tailwind.

## Key Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Long notes break week strip layout | Character limit (3e) + indicator-only display (3b) -- never show full text in cells |
| Expanded day panel on narrow screens | Full-width card below the grid adapts naturally; test at 320px |
| Orphaned notes when art is cleared | Existing behavior -- notes stay in state even if art is removed. Acceptable for now. |
| Custom dropdown accessibility regression | Not building custom dropdown -- keeping datalist avoids this entirely |

## Testing

- **Visual**: Render week strip with notes of 0, 10, 50, 60 characters -- verify no layout break
- **Visual**: Test expanded day panel at 320px, 375px, 414px viewport widths
- **Manual**: Add student, verify success animation appears and auto-clears
- **Manual**: Simulate network failure during authenticated save, verify error message appears
- **Manual**: Enter 61+ character note, verify character limit enforced
- **Accessibility**: Verify tap-to-expand with keyboard (Enter/Space/Escape)
- **Accessibility**: Verify expanded panel announced by screen reader

## Estimated Effort

Small-Medium (~1.5 days)
