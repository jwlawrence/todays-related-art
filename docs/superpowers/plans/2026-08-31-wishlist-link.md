# Related Arts Wish List Link Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Surface the Amazon classroom-supply wish list as a link in the back matter of the main page, on both the schedule view and the empty state.

**Architecture:** One local presentational component, `WishListLink`, added to `src/app/page.tsx` alongside that file's existing local components. It is rendered twice — once above the schedule footer's colophon, once above the empty state's colophon. No new files, no new dependencies, no state, no data flow.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS v4 with the project's custom design tokens from `src/app/globals.css`.

## Global Constraints

Copied verbatim from `docs/superpowers/specs/2026-08-31-wishlist-link-design.md`:

- URL is exactly `https://www.amazon.com/hz/wishlist/ls/2E3W3XGQ1AW5Z` — never the `tinyurl.com/2jfw7whv` short link, which redirects through the `redirect.viglink.com` affiliate tracker.
- Link text is exactly **Related arts wish list**.
- Subline is exactly **Supplies for the related arts classrooms**. Make no claim about shipping.
- No vermilion. `vermilion` and `vermilion-deep` are reserved for errata per DESIGN.md; a working link is not a correction.
- No new colors and no new type voices. Use only `type-legend`, `type-mono`, `text-ink`, `text-ink-soft`, `text-ink-faint`.
- External destination: plain `<a>` with `target="_blank"` and `rel="noopener noreferrer"`. Not `next/link`.
- Hover transitions use `step-motion` only — no easing curves.
- Do not modify `src/app/setup/page.tsx` or `src/app/widget/page.tsx`.

There is no test runner in this project (`package.json` has no test script). Verification is TypeScript compilation, a production build, and a rendered check of both surfaces in the browser.

---

### Task 1: Add the wish list link to both back-matter surfaces

**Files:**
- Modify: `src/app/page.tsx:13` (add the URL constant beside `MONTHS`)
- Modify: `src/app/page.tsx` (add the `WishListLink` component near the other local components)
- Modify: `src/app/page.tsx:496` (empty-state colophon — insert the link above it)
- Modify: `src/app/page.tsx:660` (schedule footer — insert the link above the colophon paragraph)

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: `function WishListLink({ className }: { className?: string }): JSX.Element` — a module-local component, not exported. `className` is appended to the wrapper `<div>` so the empty state can center it.

- [ ] **Step 1: Add the URL constant**

Immediately after the `MONTHS` constant on line 13 of `src/app/page.tsx`:

```tsx
const WISHLIST_URL = "https://www.amazon.com/hz/wishlist/ls/2E3W3XGQ1AW5Z";
```

- [ ] **Step 2: Add the `WishListLink` component**

Place it after the `ErrorState` component and before `EmptyState`, so it is defined above both of its call sites:

```tsx
/* Back matter: the classroom supply drive, offered after the answer, never before it */
function WishListLink({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <a
        href={WISHLIST_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="type-legend step-motion inline-flex items-center gap-1.5 text-[11px] text-ink underline underline-offset-4 hover:text-ink-soft"
      >
        Related arts wish list
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="square"
          aria-hidden="true"
        >
          <path d="M7 17L17 7M9 7h8v8" />
        </svg>
      </a>
      <p className="type-mono mt-1.5 text-[11px] text-ink-soft">
        Supplies for the related arts classrooms
      </p>
    </div>
  );
}
```

- [ ] **Step 3: Render it in the empty state**

In `EmptyState`, the closing block currently reads:

```tsx
      <p className="type-mono mt-14 text-[10px] text-ink-faint">
        {editionLabel()} · reads the public HCPSS &ldquo;ES Related
        Arts&rdquo; calendar
      </p>
```

Replace it with:

```tsx
      <WishListLink className="mt-14" />

      <p className="type-mono mt-6 text-[10px] text-ink-faint">
        {editionLabel()} · reads the public HCPSS &ldquo;ES Related
        Arts&rdquo; calendar
      </p>
```

The `mt-14` moves from the colophon to the link so the spacing above the back
matter block is unchanged; the colophon then sits `mt-6` below the link. The
empty state's column is `text-center`, which the link inherits.

- [ ] **Step 4: Render it in the schedule footer**

The footer currently reads:

```tsx
      <footer className="border-t rule px-5 py-4 sm:px-8">
        <p className="type-mono text-[10px] leading-relaxed text-ink-faint">
          {editionLabel()} · reads the public HCPSS &ldquo;ES Related
          Arts&rdquo; calendar · not affiliated with the district
        </p>
      </footer>
```

Replace it with:

```tsx
      <footer className="border-t rule px-5 py-4 sm:px-8">
        <WishListLink />

        <p className="type-mono mt-3 text-[10px] leading-relaxed text-ink-faint">
          {editionLabel()} · reads the public HCPSS &ldquo;ES Related
          Arts&rdquo; calendar · not affiliated with the district
        </p>
      </footer>
```

The colophon gains `mt-3` so "not affiliated with the district" reads directly
after the wish list link without crowding it.

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: exits 0, no output.

- [ ] **Step 6: Build**

Run: `npm run build`
Expected: build completes, `/` compiles without error.

- [ ] **Step 7: Verify both surfaces render**

Run: `npm run dev`, then in the browser:

1. Visit `http://localhost:3000` with no students in `localStorage` (use a
   private window, or run `localStorage.clear()` in the console and reload).
   Expected: the empty state shows "Related arts wish list ↗" with the subline
   below it, above the edition colophon.
2. Add a student via `/setup`, then return to `/`.
   Expected: the schedule footer shows the same link above the colophon.
3. Click the link.
   Expected: opens `amazon.com/hz/wishlist/ls/2E3W3XGQ1AW5Z` in a new tab.

- [ ] **Step 8: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: link the related arts classroom wish list from the back matter"
```

---

## Self-Review

**Spec coverage.** URL choice — Step 1. Copy (link text, subline, no shipping
claim) — Step 2. Visual treatment (type voices, sizes, colors, arrow, hover)
— Step 2. Implementation shape (local component, plain `<a>`, module-level
const) — Steps 1–2. Both call sites — Steps 3–4. Out-of-scope items (no
analytics, no env var, no `/setup` or `/widget` changes) — enforced by Global
Constraints and by the file list, which names only `src/app/page.tsx`.
Verification — Steps 5–7. No gaps.

**Placeholder scan.** No TBDs, no "handle edge cases", no "similar to Task N".
Every code step carries its literal content.

**Type consistency.** `WishListLink` takes one optional `className` prop and is
called two ways — `<WishListLink className="mt-14" />` in Step 3 and
`<WishListLink />` in Step 4. The default `className = ""` makes the second
form valid. Consistent.
