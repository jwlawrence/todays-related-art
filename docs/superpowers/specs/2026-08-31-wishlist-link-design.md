# Related Arts Wish List Link

Date: 2026-08-31

## Problem

A public Amazon wish list collects supplies for the related arts classrooms.
Nothing in the app points to it, so no one finds it.

## Decision

Add one link to the main page (`src/app/page.tsx`) in two places: the colophon
footer of the schedule view, and the bottom of the empty state. Both are back
matter — below the answer the app exists to give, never in front of it.

The link is not added to the header, the day board, the student leaves, the
setup page, or `/widget`. The first three sit in the morning-scramble glance
path that PRODUCT.md protects; setup is visited about once a year; `/widget` is
a deliberately minimal tokenized surface.

## URL

`https://www.amazon.com/hz/wishlist/ls/2E3W3XGQ1AW5Z`

Linked directly rather than through the `tinyurl.com/2jfw7whv` short link. The
short link 301s to `redirect.viglink.com`, an affiliate-monetization redirector,
before reaching Amazon. The direct URL is one hop and adds no third-party
tracker to a page other parents use.

## Copy

- Link text: **Related arts wish list**, followed by an outbound arrow glyph.
- Subline: **Supplies for the related arts classrooms**

No shipping claim is made — items may reach the school by hand rather than
direct shipment, and the copy must not assert otherwise.

## Placement and framing

In the schedule footer the link sits above the existing colophon, so the line
"not affiliated with the district" reads immediately after it. That adjacency is
deliberate: a supply drive surfaced by this app must not be mistaken for an
official district collection.

## Visual treatment

Bound by DESIGN.md. No new colors, no new type voices, no vermilion — vermilion
is reserved for errata, and a working link is not a correction.

- Link: `type-legend`, `text-[11px]`, `text-ink`, underlined at
  `underline-offset-4`, hover to `text-ink-soft`. One step louder than the 10px
  `ink-faint` colophon so it registers as an invitation rather than fine print.
- Subline: `type-mono`, `text-[11px]`, `text-ink-soft`.
- Outbound arrow: inline SVG, 11px, `strokeWidth 2.5`, `strokeLinecap="square"`,
  matching the arrow already used on the empty-state primary button.
- Hover uses `step-motion` — a two-frame snap, per the no-easing rule.

## Implementation shape

A single local component in `src/app/page.tsx`, alongside the file's existing
local components (`PunchHole`, `StudentLeaf`, `PagerButton`):

```
function WishListLink({ className }: { className?: string })
```

It renders the link, the arrow, and the subline. Because the destination is
external it uses a plain `<a>` with `target="_blank"` and
`rel="noopener noreferrer"`, not `next/link`.

Two call sites:

1. `EmptyState` — above the existing `{editionLabel()} · reads the public
   HCPSS…` line, centered with the surrounding column.
2. The schedule `<footer>` — above the existing colophon paragraph.

The URL lives in a module-level `const WISHLIST_URL` at the top of the file.

## Out of scope

- No analytics event on the click.
- No environment variable for the URL; it is a stable literal.
- No changes to `/setup` or `/widget`.

## Verification

- `npx tsc --noEmit` and `npm run build` pass.
- Both surfaces render the link: the empty state (no students) and the schedule
  view (at least one student).
- The link opens the Amazon wish list in a new tab.
