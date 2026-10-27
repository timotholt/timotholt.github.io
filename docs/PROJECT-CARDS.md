# Project cards (home page)

## Problem (Tim, 2026-10-26)

1. The links a visitor should click (live site, code) were small mono text at the bottom of the card, hard to find.
2. On laptops the spacing above and below the card was uneven.
3. The screenshot was cropped to a thin strip; you could not see much of the app.
4. The description leaned on library names (TanStack Query, ...).

## Layout

- **Laptop (900px+):** screenshot on the left, shown whole at its own shape and as large as the slot allows;
  a details column on the right: title, a short pitch, then the buttons.
- **Phone (under 900px):** stacked: screenshot (phone crop, capped in height), title, pitch, buttons side by side.
- The slot centers the card (and, on the first slot, the "Built to work" heading) with even space above and below.

## Buttons

Same pills as the hero (`.button-pill`, shared): rounded, sentence case, bold.

Two buttons only (Tim, 2026-10-26):

- **Open Live Site ↗** (filled accent), or **View on GitHub ↗** when there is no live site (MCP Logger).
- **Case Study ↗** (outline).

The whole card still opens the primary target (stretched title link); the buttons sit above it.

## Copy

New optional `tagline` in the project schema: one or two sentences that say why the project matters. `summary` stays for the case-study
page. The card's stack line shows at most three items.

## Verify

Screenshots of every project slot at 375x812, 375x560, 1000x560, 1440x900 and 1920x1080; the hero must be
pixel-identical after the shared pill class; full test suite.
