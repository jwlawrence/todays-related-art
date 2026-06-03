# Homepage Login — Design

**Date:** 2026-06-03
**Status:** Approved (pending spec review)

## Problem

Sign-in (Google) currently lives only at the bottom of `/setup`, inside `AccountSection`. The homepage's empty state offers only **"Add a Student"** → `/setup`.

A returning user on a new device (or after clearing local storage) lands on the empty homepage with their student data sitting safely in the database, but the only visible action is "Add a Student." To recover their data they must add a student, navigate to setup, scroll to the bottom, and find the sign-in button. Sign-in should be reachable directly from the homepage.

## Goals

- Logged-out users can sign in directly from the homepage.
- Sign-in is the primary action in the empty state; "Add a Student" remains available as a secondary action.
- Logged-out users who already have local students can sign in from the homepage header to sync.

## Non-goals

- No new auth providers (Google remains the only provider).
- No dedicated `/login` route (a single provider makes `signIn("google")` redirect straight to Google; a page would only add a hop).
- No API, schema, or `useStudents` behavior changes.

## Design

### 1. `SignInButton` component (`src/components/SignInButton.tsx`)

A small client component wrapping the "Continue with Google" button — the Google SVG plus a `signIn("google")` call, lifted out of `AccountSection`. One source of truth for the sign-in control.

Props:
- `variant: "primary" | "secondary" | "compact"`
  - `"primary"` — filled, prominent. Used in the empty state.
  - `"secondary"` — bordered style (the current `AccountSection` look). Used in `AccountSection`.
  - `"compact"` — small pill. Used in the homepage header.

`AccountSection` in `/setup` is refactored to render `<SignInButton variant="secondary" />` instead of its inline markup, so the Google button markup is not duplicated.

### 2. Empty state (`EmptyState` in `src/app/page.tsx`)

Sign-in becomes the primary action:
- Lead with `<SignInButton variant="primary" />` ("Continue with Google").
- Add a supporting line, e.g. *"Already set up your students? Sign in to restore them."*
- Demote **"Add a Student"** to a secondary link/button below the sign-in button.
- Keep the existing explainer copy about color days.

### 3. Homepage header — logged-out (`HomePage` main return in `src/app/page.tsx`)

The header currently renders only when `students.length > 0`, showing an avatar (when authed) plus an "Edit Students" link. For logged-out users, the avatar slot is replaced with `<SignInButton variant="compact" />` next to "Edit Students," so a logged-out user with local students can sync. When authenticated, the avatar shows as today.

## Data flow / behavior

Unchanged. `signIn("google")` triggers the existing `useStudents` flow: on first sign-in, local students are migrated/uploaded to the DB; otherwise DB students are fetched. The returning-user-on-new-device case works because their DB students load after sign-in.

## Testing

Manual verification by running the app:
1. Empty state shows sign-in as the primary action, with "Add a Student" available as secondary.
2. Homepage header shows a sign-in control when logged out with local students present.
3. `AccountSection` on `/setup` still renders and signs in correctly after the refactor.
4. Sign-in round-trips: a returning user's DB students load after authenticating.

## Files

- **New:** `src/components/SignInButton.tsx`
- **Modified:** `src/app/page.tsx` (`EmptyState`, header), `src/app/setup/page.tsx` (`AccountSection`)
