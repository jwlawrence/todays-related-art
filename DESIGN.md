---
name: Today's Related Art
description: The household's reference manual for the school color-day rotation, lying open at today's tab
colors:
  board: "#F2EDDF"
  board-shade: "#E5DEC9"
  milk: "#FDFCF6"
  ink: "#17150F"
  ink-soft: "#57503E"
  ink-faint: "#6B6350"
  vermilion: "#D93A1B"
  vermilion-deep: "#B02A10"
  day-red: "#C22F1F"
  day-blue: "#2843BC"
  day-yellow: "#F2B705"
  day-green: "#4E9C43"
  day-orange: "#E06214"
typography:
  legend:
    fontFamily: "Archivo, 'Helvetica Neue', sans-serif"
    fontWeight: 600
    letterSpacing: "0.12em"
    fontVariation: "'wdth' 75"
  display:
    fontFamily: "Archivo, 'Helvetica Neue', sans-serif"
    fontWeight: 800
    letterSpacing: "-0.015em"
    lineHeight: 0.98
  mono:
    fontFamily: "'Fragment Mono', 'Courier New', monospace"
    fontWeight: 400
    letterSpacing: "0.01em"
  body:
    fontFamily: "'EB Garamond', Georgia, serif"
    fontSize: "1.0625rem"
    lineHeight: 1.55
rounded:
  press: "3px"
  tab: "4px"
  rail-tab: "5px"
components:
  button-primary:
    backgroundColor: "{colors.day-yellow}"
    textColor: "{colors.ink}"
    typography: "{typography.legend}"
    rounded: "{rounded.press}"
    padding: "14px 28px"
  button-primary-hover:
    backgroundColor: "{colors.milk}"
  button-secondary:
    backgroundColor: "{colors.milk}"
    textColor: "{colors.ink}"
    typography: "{typography.legend}"
    rounded: "{rounded.press}"
    padding: "12px 24px"
  button-secondary-hover:
    backgroundColor: "{colors.board}"
  button-destructive:
    backgroundColor: "{colors.vermilion-deep}"
    textColor: "{colors.milk}"
    typography: "{typography.legend}"
    rounded: "{rounded.press}"
    padding: "10px 16px"
  button-destructive-hover:
    backgroundColor: "{colors.milk}"
    textColor: "{colors.vermilion-deep}"
  input:
    backgroundColor: "{colors.milk}"
    textColor: "{colors.ink}"
    typography: "{typography.mono}"
    rounded: "{rounded.press}"
    padding: "10px 12px"
---

# Design System: Today's Related Art

## Overview

**Creative North Star: "The Household Reference Manual"**

Every surface is a page of a printed reference manual — a school-district
binder of board stock, printed in ink, divided by five full-strength color
section boards, lying open at today's tab. The world deliberately refuses the
family-app defaults: no cream gradients, no rounded pastel cards, no soft
washes. Color arrives at full strength as a *section divider*, never as a
tint; text is *printed* on the material it sits on; corrections arrive on
vermilion errata slips, exactly like a manual's printed corrections.

The signature material is the **milk-acetate leaf**: a translucent white
sheet laid over the day's board, its opacity solved at runtime so the board
color glows through while ink stays fully legible on top. The signature
mechanism is the **hinge**: nothing fades or eases — every change is a
stepped, two-frame snap, as if a physical leaf were flipped at its bound
edge.

**Key Characteristics:**
- Board-stock ground (`#F2EDDF`) with a fixed fractal-noise grain overlay (5% opacity) over everything — ink and stock alike
- Five full-strength section boards; color is structural, never decorative
- Milk-acetate leaves with runtime-solved alpha carry the primary reading
- Vermilion reserved exclusively for errata (errors, unmapped states, destructive actions)
- Four fixed type voices: condensed-caps legend, heavy grotesk display, mono machine voice, Garamond prose
- Hairline rules and a heavy `2px` ink rule under running headers
- Motion is `steps(2)` only — 90ms state changes, one 540ms stepped idle loop; zero easing curves anywhere
- One narrow column, phone-first; on desktop the page lies on a darker desk

## Colors

Full-strength section pigments on warm board stock, printed in near-black ink; nothing is tinted, washed, or desaturated.

### Primary

The five section boards. Each is a day's divider, applied full-bleed as the open section's background, as the fore-edge tab fill, and as the punch-hole color showing through an acetate leaf. They come only from `BOARD_HEX` in `src/lib/colors.ts` (mirrored as `--color-day-*` in `src/app/globals.css`); never invent a sixth.

- **Oxide Red** (`day-red`, #C22F1F): RED day board. Milk text prints on it.
- **Ultramarine** (`day-blue`, #2843BC): BLUE day board. Milk text prints on it.
- **Chrome Yellow** (`day-yellow`, #F2B705): YELLOW day board. Ink text prints on it. Doubles as the fill of the primary action button — the one place a board color appears outside a day context.
- **Grass** (`day-green`, #4E9C43): GREEN day board. Ink text prints on it.
- **Oxide Orange** (`day-orange`, #E06214): ORANGE day board. Ink text prints on it.

### Secondary

The errata pair. A correction color, not a section color.

- **Vermilion** (`vermilion`, #D93A1B): borders of errata slips (error state, unmapped-color slip, delete-confirmation zone).
- **Vermilion Deep** (`vermilion-deep`, #B02A10): errata label text, "not mapped" text, destructive button fill and hover-text color.

### Neutral

- **Board** (`board`, #F2EDDF): the page itself — app background on mobile, the column's background on desktop. Also the PWA theme color.
- **Board Shade** (`board-shade`, #E5DEC9): the desk under the page (desktop body background ≥768px) and the "no school" board where a day color would go.
- **Milk** (`milk`, #FDFCF6): opaque white sheets — forms, cards, errata slips, notices — and the light text choice on dark boards.
- **Ink** (`ink`, #17150F): the print. Default text, heavy rules, focus outlines, the dark text choice on light boards.
- **Ink Soft** (`ink-soft`, #57503E): secondary print — datelines, sublabels, student-name legends.
- **Ink Faint** (`ink-faint`, #6B6350): tertiary print — colophon, hints, placeholder-adjacent text, dotted add-affordance outline.

### Named Rules

**The Errata Rule.** Vermilion and vermilion-deep mark *corrections only*: load errors, unmapped colors, and destructive confirmation. They are never a section color, never a highlight, never decoration. A screen with no problem shows no vermilion.

**The Named Color Rule.** A color never appears without its name in text beside it. Every board says "Red Day"; every week-index tab carries the color word in mono; every swatch in setup sits next to its label. A parent who cannot distinguish the swatches loses nothing. (Durable colorblind requirement — red and green are both in the palette.)

**The Full-Strength Rule.** Board colors are used at 100% or not at all. The only sanctioned transparency over a board is the milk-acetate leaf (white at solved alpha) and the 40%-opacity `onBoard` hairline under a board's header.

## Typography

**Display/Legend Font:** Archivo, variable `wdth` axis (fallback 'Helvetica Neue', sans-serif) — `--font-head`
**Body Font:** EB Garamond, normal + italic (fallback Georgia, serif) — `--font-body`
**Machine Font:** Fragment Mono, 400, normal + italic (fallback 'Courier New', monospace) — `--font-mono`

**Character:** A printed manual's typographic kit: one grotesk doing double duty (condensed caps for wayfinding, full-width heavy for the fact itself), a typewriter voice for machine-supplied data, and a book serif reserved for the rare passage of actual prose.

### Hierarchy

The four voices are CSS classes in `src/app/globals.css`; sizes are set per use, not per voice.

- **Legend** (`.type-legend` — 600, condensed `font-stretch: 75%`, uppercase, +0.12em tracking): all wayfinding and field labels. Used at 10–13px. The running header's app title is a 13px legend, not a display setting.
- **Display** (`.type-display` — 800, full width, −0.015em, line-height 0.98): the one fact only — the class name on a leaf (2.6rem), the empty-state title (3rem), a student-card name (1.35rem), "No school" (2.4rem).
- **Mono** (`.type-mono` — Fragment Mono, +0.01em): everything machine-supplied or machine-shaped: dates, edition labels, statuses, BRING lines, class names in the week index, hints, the colophon. Used at 10–14px.
- **Body** (`.type-body` — Garamond 1.0625rem/1.55): connected prose sentences only. Rare by design; appears on the empty-state cover.

### Named Rules

**The 17px Serif Rule.** Garamond appears only at `1.0625rem` (17px) and above, and only for running prose. Labels, data, and UI strings never wear the serif.

**The Four Voices Rule.** Every piece of text is exactly one of legend, display, mono, or body. Untyped text (plain font-weight-500/600 sentences) appears only inside errata slips, where the message is the point.

## Layout

One narrow centered column, `max-w-md` (28rem), designed for a phone held in one hand. Horizontal padding is `px-5` on mobile, `sm:px-8` at ≥640px. There is no multi-column layout anywhere.

- **Narrow (viewport ≤ column):** the page is the screen — board stock edge to edge.
- **Wider than the column (≥28rem, the `page:` breakpoint):** the moment gutters would appear, the body background switches to `board-shade` and the column becomes a manual lying on a desk: `page:my-8` (`md:my-10`), a faint hairline border (`page:border page:rule-faint`), and the desk shadow (see Elevation & Depth). The page edge is never invisible — if there is space beside the column, the desk shows.
- **Running header:** every page opens with a baseline-aligned row (13px legend title left, legend/mono utility links right), then a heavy `border-t-2 border-ink` rule with the mono dateline/edition line under it. This is the manual's running head; new pages must reproduce it.
- **Tab rail:** on the home page a vertical stepped rail hangs at the fore edge of the *open board* (`absolute right-0 top-5` inside the board's relative wrapper), one 44px-tall tab per weekday, 3px gaps; the open day's tab extends wider (`w-12` vs `w-8`). Boards carry `min-h-[272px]` so the section is always tall enough for its tab stack, and board content reserves `pr-16` so the rail never covers the reading.
- **Colophon:** pages close with a hairline-ruled footer in 10px mono, ink-faint — edition label, data source, non-affiliation.
- **Grain:** a fixed, pointer-transparent fractal-noise overlay (`body::after`, 240px SVG tile, opacity 0.05, z-40) sits over the entire viewport, unifying ink, boards, and stock as one printed sheet.

Spacing uses default Tailwind steps ad hoc; there is no bespoke spacing scale to inherit — match the local rhythm of the surface you extend.

## Elevation & Depth

Depth is physical, not atmospheric: sheets of paper casting small soft shadows on the stock beneath them. There are no glows, no colored shadows, no elevation-on-hover.

### Shadow Vocabulary

- **Paper** (`box-shadow: 0 2px 6px rgba(23, 21, 15, 0.28)`): the standard lift for anything laid on the page — acetate leaves, milk sheets (forms, cards, notices, errata slips), and the chrome-yellow primary button.
- **Tab** (`box-shadow: 0 1px 3px rgba(23, 21, 15, 0.25)`): the shallower lift of the fore-edge rail tabs.
- **Desk** (`box-shadow: 0 18px 60px rgba(23, 21, 15, 0.22)`, as `page:shadow-[…]`): whenever the desk shows (viewport ≥28rem); the whole page's shadow on the desk.

All three are ink-tinted (23, 21, 15 = `ink`). Punch holes are the inverse device: depth by *revealing* the layer beneath (a leaf's holes are filled with the board color; the week index's selected tab is punched with board stock).

### Named Rules

**The Three Shadows Rule.** Only the three shadows above exist. New surfaces pick the one matching their material (sheet on page → Paper; tab → Tab; page on desk → Desk) rather than inventing a fourth.

## Shapes

Square by default — print does not have border radius. The exceptions are physical, not stylistic:

- **Pressed corners** (3px): buttons and inputs only — the slight rounding of a pressed, die-cut piece.
- **Tab free edges** (4px, rail 5px): a tab rounds *only* the corners away from its bound edge. Week-index and setup swatches are `rounded-r-[4px]`; the fore-edge rail is `rounded-l-[5px]` (bound at the right, the page edge); the empty-state cover tabs are `rounded-b-[4px]` (hanging from the top). The bound edge is always square.
- **Punch holes:** the only circles in the world (9px on leaves, 8px in the index; the icon's spine holes). Always `aria-hidden`, always filled with the layer beneath.
- **Rules:** hairlines are 1px borders — full-strength ink (`.rule`) or ink at 22% (`.rule-faint`, via `color-mix`). Running headers use a heavy `2px` ink rule. On a colored board, the divider is the board's `onBoard` color at 40% opacity.
- **Dotted outline** (`1.5px dotted ink-faint`, inset): the un-cut, not-yet-real affordance — "+ Add student".

### Named Rules

**The Bound Edge Rule.** Every shape and motion respects its binding: tabs round only their free edge, hinges rotate from the top (bound) edge, punch holes sit at the bound edge of a leaf. Nothing floats free of the page.

## Components

Motion grammar first, because every interactive component uses it: **nothing eases and nothing fades**. State changes (`.step-motion`) transition background-color, color, border-color, and transform in `90ms steps(2, end)`. A day board or form entering the page hinges in (`.step-hinge`: `rotateX(-18deg)` → flat, 900px perspective, 90ms, two frames, origin `50% 0`). The loading sheet idles on `.step-half-hinge` (540ms `steps(2)`, infinite alternate, −10° → −4°) — the one longer duration, still stepped. `prefers-reduced-motion: reduce` disables all of it. Focus is mechanical everywhere: `outline: 2px solid ink; outline-offset: 2px`, square.

### Buttons

- **Shape:** pressed corners (`rounded-[3px]`) on filled buttons; text-only actions have no box at all.
- **Primary** (one per screen at most): chrome-yellow fill, 1px ink border, ink legend text (12–13px), Paper shadow; hover snaps the fill to milk. The empty state's "Continue with Google" is the canonical instance.
- **Secondary:** milk fill, 1px ink border, ink legend text, no shadow; hover snaps to board.
- **Destructive:** vermilion-deep fill, matching border, milk legend text; hover inverts to milk fill with vermilion-deep text. Appears only inside a vermilion-bordered confirmation slip.
- **Text actions** (the workhorse): legend voice, 11–12px, ink, `underline underline-offset-4`; hover shifts ink ↔ ink-soft (or to vermilion-deep for a destructive text action). Used for all navigation ("Edit students", "Back to schedule", "Return to today", "Cancel").

### Inputs / Fields

- **Style:** milk fill, `rounded-[3px]`, `border-ink/30`, mono voice at 13–14px ink, placeholder ink-faint, `px-3 py-2.5`.
- **Focus:** border snaps to full ink (`.step-motion`); no ring, no glow (the global square ink outline covers keyboard focus).
- **Labels:** 11px ink legend above the field.

### Cards / Containers

- **Milk sheet:** the standard container — opaque milk, square corners, Paper shadow, `p-5`. No border. Forms, student cards, account section, notices all use it.
- **Errata slip:** a milk sheet with a 1px vermilion border and an 11px "ERRATA" legend in vermilion-deep, followed by the plain-text message and a text action. Used for load errors, unmapped colors, and the delete-account confirmation. This is the only error presentation at page scale (the glance-scale widget prints errors inline; see The Widget below).
- **Ruled table rows:** lists (week index, per-color mappings in setup) are rows separated by `rule-faint` hairlines with a closing bottom hairline, never boxed cells.

### The Acetate Leaf (signature)

One per student, laid on the day's board: background is pure white at the *runtime-solved* alpha from `src/lib/colors.ts` — a binary search on the white overlay until the composite luminance hits the 0.66 band (floor 0.55 for boards already lighter than the band), so ink reads at full strength on every board while the color glows through. Anatomy: two board-colored punch holes down the bound (left) edge (`pl-9` reserves the margin), 11px ink-soft student-name legend, 2.6rem ink display class name, and an optional BRING line — 10px "BRING" legend + ` · ` + 13px mono note in ink-soft above a faint hairline. Paper shadow. Never put milk-opaque content on a board when the acetate treatment is the reading surface.

### The Section Board (signature)

The open day: full-bleed board color (`pb-8 pl-5 pr-16 pt-6`), hinge-in on change. Header row in the board's `onBoard` color — "{Color} Day" legend (13px) left, mono day/date (11px) right — over the 40%-opacity hairline. `onBoard` is computed, not chosen: whichever of milk or ink has higher WCAG contrast on the board (milk on red and blue, ink on yellow, green, orange). "No school" renders the same board anatomy on `board-shade` with ink text.

### Tab Rail (signature)

Fore-edge navigation: per weekday a board-colored tab (board-shade when no school), `h-11`, legend single-letter label in the tab's `onBoard` color, `rounded-l-[5px]`, Tab shadow, 3px gaps. Selected tab widens `w-8` → `w-12` via `.step-motion` and carries `aria-pressed`. Off days keep their tab (ink-faint letter on board-shade).

### Navigation

The running header (see Layout) is the only chrome. Signed-in state is a 24px square milk tile with a 1px ink rule holding the account's initial in 10px mono; signed-out is the compact sign-in (13px Google mark + underlined "Sign in" legend). No menus, no icons-as-navigation, no bottom bars.

### The Widget (glance scale)

`/widget` is the one surface that drops the acetate: at glance scale, text prints *directly* on the full-bleed board in the day's `onBoard` color, with softened literals for secondary lines — `rgba(23,21,15,0.88)` on light boards, `rgba(253,252,246,0.92)` on dark. Anatomy: legend "{Color} Day" + mono three-letter day over a 1px soft hairline, then per student a name legend and a 27px display class name (sizes step *up* below 200px width). An unmapped color prints inline in mono in the `onBoard` color ("Not mapped — set it in the app") — no vermilion slip, no leaf, no shadows, no tab rail, no grain at glance scale.

## Do's and Don'ts

### Do:

- **Do** print the color's name in text wherever its swatch, board, or tab appears ("Red Day", "Yellow", "not mapped") — the Named Color Rule is a durable accessibility requirement.
- **Do** use `steps(2, end)` for every transition and animation — 90ms for state changes, hinged at the bound edge (`transform-origin: 50% 0`) for entrances — and honor `prefers-reduced-motion`.
- **Do** compute text-on-board and leaf alpha through `src/lib/colors.ts` (`COLOR_CONFIG`, `getColorStyle`) instead of hard-coding milk/ink choices or overlay opacities.
- **Do** keep corners square unless the element is a pressed button/input (3px) or a tab's free edge (4–5px).
- **Do** open every page with the running header (legend title, heavy 2px ink rule, mono dateline); the home page closes with the mono colophon.
- **Do** present every error, absence, or destructive confirmation at page scale as a vermilion-bordered errata slip on milk; the glance-scale widget prints errors inline on the board instead.
- **Do** state machine facts (dates, editions, statuses, BRING lines) in the mono voice.

### Don't:

- **Don't** ease, fade, cross-fade, or spring anything — no `ease-*`, no opacity transitions, no durations other than the stepped 90ms (and the 540ms loading loop).
- **Don't** use vermilion or vermilion-deep as a section, accent, or emphasis color; it exists only for errata.
- **Don't** tint, wash, or pastel a board color, and don't put transparency over a board except the solved milk-acetate leaf and the 40% `onBoard` hairline.
- **Don't** set Garamond below 17px or use it for labels and UI strings.
- **Don't** round card or container corners, add borders to milk sheets, or introduce shadows beyond the three in Elevation & Depth.
- **Don't** add glyph icon sets. The world is typographic; the only pictorial marks are the Google identity button's mark (a third-party requirement) and square-linecap inline SVG arrows.
- **Don't** imply district affiliation on any surface; the colophon's "not affiliated with the district" line is part of the design.
