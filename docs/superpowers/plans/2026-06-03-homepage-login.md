# Homepage Login Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let logged-out users sign in directly from the homepage — primary in the empty state, and a compact control in the header — instead of only from the bottom of `/setup`.

**Architecture:** Extract the existing "Continue with Google" button (currently inline in `AccountSection`) into a reusable `SignInButton` component with three visual variants. Wire it into the homepage empty state (primary action) and the homepage header (compact, logged-out only), and refactor `AccountSection` to consume it. No API, schema, or `useStudents` behavior changes — sign-in triggers the existing migration/fetch flow.

**Tech Stack:** Next.js 16 (App Router, client components), React 19, NextAuth v5 (`signIn` from `next-auth/react`), Tailwind CSS v4.

---

## Testing note

This project has **no test framework** (no test deps or scripts in `package.json`). Verification is done via the TypeScript compiler and the dev server, matching the spec's manual-verification approach. Each task's verification step uses `npx tsc --noEmit` and/or running `npm run dev` and observing the UI. Do **not** add a test framework.

## File Structure

- **Create:** `src/components/SignInButton.tsx` — single source of truth for the "Continue with Google" control; renders one of three variants. Sole responsibility: render a sign-in button that calls `signIn("google")`.
- **Modify:** `src/app/setup/page.tsx` — `AccountSection` consumes `SignInButton` (variant `secondary`) instead of inline markup.
- **Modify:** `src/app/page.tsx` — `EmptyState` leads with `SignInButton` (variant `primary`); homepage header shows `SignInButton` (variant `compact`) when logged out.

---

### Task 1: Create the reusable `SignInButton` component

**Files:**
- Create: `src/components/SignInButton.tsx`

This component is lifted from the existing inline button in `src/app/setup/page.tsx:214-225`. It keeps the exact Google SVG and the `signIn("google")` call, and adds a `variant` prop for the three placements. The `secondary` variant reproduces the current `AccountSection` button styling exactly so the refactor in Task 2 is visually identical.

- [ ] **Step 1: Write the component file**

Create `src/components/SignInButton.tsx` with this exact content:

```tsx
"use client";

import { signIn } from "next-auth/react";

type Variant = "primary" | "secondary" | "compact";

const GoogleIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export function SignInButton({
  variant = "secondary",
  className = "",
}: {
  variant?: Variant;
  className?: string;
}) {
  const handleClick = () => signIn("google");

  if (variant === "primary") {
    return (
      <button
        onClick={handleClick}
        className={`inline-flex items-center justify-center gap-2 bg-ink text-cream px-8 py-3.5 rounded-2xl font-display font-bold text-base hover:bg-ink/90 transition-all hover:scale-[1.02] active:scale-[0.98] ${className}`}
      >
        <span className="bg-white rounded-full p-1 flex items-center justify-center">
          <GoogleIcon size={18} />
        </span>
        Continue with Google
      </button>
    );
  }

  if (variant === "compact") {
    return (
      <button
        onClick={handleClick}
        className={`inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted hover:text-ink transition-colors bg-cream-dark hover:bg-white px-3 py-1.5 rounded-full ${className}`}
      >
        <GoogleIcon size={14} />
        Sign in
      </button>
    );
  }

  // secondary (default) — matches existing AccountSection styling
  return (
    <button
      onClick={handleClick}
      className={`w-full flex items-center justify-center gap-2 bg-white border border-cream-dark hover:bg-cream-dark py-3 rounded-xl font-display font-bold text-sm text-ink transition-all active:scale-[0.98] ${className}`}
    >
      <GoogleIcon size={18} />
      Continue with Google
    </button>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors related to `SignInButton.tsx`. (The component is not yet imported anywhere, so this confirms it compiles in isolation.)

- [ ] **Step 3: Commit**

```bash
git add src/components/SignInButton.tsx
git commit -m "feat: add reusable SignInButton component"
```

---

### Task 2: Refactor `AccountSection` to use `SignInButton`

**Files:**
- Modify: `src/app/setup/page.tsx`

Replace the inline Google button in the logged-out branch of `AccountSection` (currently `src/app/setup/page.tsx:214-225`) with `<SignInButton variant="secondary" />`. This proves the extracted component is a drop-in replacement before it is reused elsewhere. `signIn` is still imported in this file for nothing else? — verify: `signIn` is only used by this button, but `signOut` is still used below, so keep the `signOut` import and drop `signIn`.

- [ ] **Step 1: Add the import**

At the top of `src/app/setup/page.tsx`, add this import alongside the existing imports (e.g. after the `useStudents` import on line 6):

```tsx
import { SignInButton } from "@/components/SignInButton";
```

- [ ] **Step 2: Replace the inline button**

In `AccountSection`, find the logged-out return block. Replace this exact markup:

```tsx
        <button
          onClick={() => signIn("google")}
          className="w-full flex items-center justify-center gap-2 bg-white border border-cream-dark hover:bg-cream-dark py-3 rounded-xl font-display font-bold text-sm text-ink transition-all active:scale-[0.98]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>
```

with:

```tsx
        <SignInButton variant="secondary" />
```

- [ ] **Step 3: Drop the now-unused `signIn` import**

The only remaining usage of `signIn` was the button just replaced. In the import line:

```tsx
import { useSession, signIn, signOut } from "next-auth/react";
```

change it to (keep `signOut` — it is still used by the sign-out and delete-account buttons):

```tsx
import { useSession, signOut } from "next-auth/react";
```

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors. In particular, no "`signIn` is declared but never read" and no "Cannot find name `signIn`".

- [ ] **Step 5: Commit**

```bash
git add src/app/setup/page.tsx
git commit -m "refactor: use SignInButton in setup AccountSection"
```

---

### Task 3: Make sign-in the primary action in the homepage empty state

**Files:**
- Modify: `src/app/page.tsx`

In `EmptyState` (currently `src/app/page.tsx:206-233`), lead with the primary `SignInButton`, add a supporting line, and demote "Add a Student" to a secondary link below.

- [ ] **Step 1: Add the import**

At the top of `src/app/page.tsx`, add alongside the existing imports (e.g. after the `Link` import on line 4):

```tsx
import { SignInButton } from "@/components/SignInButton";
```

- [ ] **Step 2: Replace the empty-state call-to-action**

In `EmptyState`, find this exact block (the explainer line + the "Add a Student" link near the end of the function):

```tsx
      <p className="text-ink-muted mb-8 max-w-xs text-xs leading-relaxed">
        Check the schedule sheet from your child&apos;s teacher to find
        which color matches which class.
      </p>
      <Link
        href="/setup"
        className="inline-block bg-ink text-cream px-8 py-3.5 rounded-2xl font-display font-bold text-base hover:bg-ink/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
      >
        Add a Student
      </Link>
```

Replace it with (sign-in primary, "Add a Student" demoted to a secondary link):

```tsx
      <p className="text-ink-muted mb-6 max-w-xs text-xs leading-relaxed">
        Check the schedule sheet from your child&apos;s teacher to find
        which color matches which class.
      </p>
      <SignInButton variant="primary" />
      <p className="text-ink-muted mt-3 mb-5 max-w-xs text-xs leading-relaxed">
        Already set up your students? Sign in to restore them.
      </p>
      <Link
        href="/setup"
        className="text-sm font-display font-bold text-ink-muted hover:text-ink transition-colors underline underline-offset-4 decoration-ink-muted/30 hover:decoration-ink"
      >
        Or add a student without signing in
      </Link>
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Visual verification**

Run: `npm run dev`, open the app in a browser with no students saved (clear `localStorage` for the site if needed, and be signed out).
Expected: empty state shows "Continue with Google" as the prominent primary button, the "Already set up your students?" line, and a smaller "Or add a student without signing in" link beneath it. The existing color-day explainer copy is still present above.

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: make sign-in the primary action in homepage empty state"
```

---

### Task 4: Add a compact sign-in control to the homepage header when logged out

**Files:**
- Modify: `src/app/page.tsx`

In the main `HomePage` return (the header at `src/app/page.tsx:272-289`), show `<SignInButton variant="compact" />` when there is no session, in place of the avatar (which only renders when authed). This lets a logged-out user with local students sync. `useSession` is already imported and `session` is already in scope in `HomePage`.

- [ ] **Step 1: Update the header actions block**

In `HomePage`, find this exact block:

```tsx
        <div className="flex items-center gap-2">
          {session?.user && (
            <span className="w-6 h-6 rounded-full bg-cream-dark flex items-center justify-center text-[10px] font-bold text-ink-muted">
              {(session.user.name || session.user.email || "?")[0].toUpperCase()}
            </span>
          )}
          <Link
            href="/setup"
            className="text-xs font-semibold text-ink-muted hover:text-ink transition-colors bg-cream-dark hover:bg-white px-3 py-1.5 rounded-full"
          >
            Edit Students
          </Link>
        </div>
```

Replace it with (avatar when authed, compact sign-in when logged out):

```tsx
        <div className="flex items-center gap-2">
          {session?.user ? (
            <span className="w-6 h-6 rounded-full bg-cream-dark flex items-center justify-center text-[10px] font-bold text-ink-muted">
              {(session.user.name || session.user.email || "?")[0].toUpperCase()}
            </span>
          ) : (
            <SignInButton variant="compact" />
          )}
          <Link
            href="/setup"
            className="text-xs font-semibold text-ink-muted hover:text-ink transition-colors bg-cream-dark hover:bg-white px-3 py-1.5 rounded-full"
          >
            Edit Students
          </Link>
        </div>
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Visual verification**

Run: `npm run dev`. Sign out but keep at least one student saved locally (so the main view renders rather than the empty state).
Expected: the homepage header shows a small "Sign in" pill (with Google icon) next to "Edit Students." When signed in, the pill is replaced by the avatar circle.

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: add compact sign-in to homepage header when logged out"
```

---

### Task 5: Full end-to-end verification

**Files:** none (verification only)

- [ ] **Step 1: Build**

Run: `npm run build`
Expected: build succeeds with no type or lint errors.

- [ ] **Step 2: Round-trip sign-in check**

Run: `npm run dev`. From the empty state, click "Continue with Google" and complete Google sign-in.
Expected: after redirect back, the existing `useStudents` flow loads the signed-in user's DB students (or migrates local ones). A returning user with DB students sees their students appear. This confirms no behavior regression in the sign-in flow.

- [ ] **Step 3: Confirm `/setup` still works**

Navigate to `/setup` while signed out.
Expected: `AccountSection` at the bottom still shows the "Continue with Google" button (now rendered via `SignInButton`), visually identical to before. Sign-out and delete-account controls still appear when signed in.
