# Type scale

## Problem (2026-10-26)

Every element sized itself with its own `clamp(min, min(Xvw, Ysvh), max)` or a fixed px value. The
content column stops growing at 1000px, but the type kept following the window, so line breaks moved
with window size (5–10 text blocks re-wrapped between common laptop sizes), and stragglers such as the
hero buttons kept one size while everything around them scaled.

## Rule

**One root size, a few roles, everything in rem.**

- `src/styles/type.css` is the only stylesheet that sets a font size. It sets the root size and the
  roles. Section CSS picks a role (an element or a class), never a size.
- The root font size follows the page column, so text and column grow together and line breaks
  don't move when the window changes.
- Spacing tied to the type is in `rem` / `em`, or `calc(N * var(--u))`, where `--u` is 1% of the
  reference column in rem (`tokens.css`).

### Root formula (`type.css`)

| Window | Root font size | At the reference |
| --- | --- | --- |
| Laptop/desktop (900px+) | `--scale × (min(1000px, 100vw − 120px, 143svh) × 0.016 + 1rem − 16px)` | 16px when the column is 1000px |
| Phone (under 900px) | `--scale × (clamp(16px, (100vw − 84px) × 0.05498, 20.48px) + 1rem − 16px)` | 16px on a 375px phone; holds at 20.48px from ~460px |

- `min(1000px, 100vw − 120px, 143svh)` is the section column (`layout.css` uses the same rule), so
  short windows narrow the column and shrink the type with it, and a slot still fits one screen.
- Phone column = screen − 84px of margins, so 375–430px phones break lines the same way.
- **`--scale`** (default 1) is the knob: `--scale: 1.1` makes the page type 10% bigger.
- **Browser text size:** inside the root's own `font-size`, `1rem` is the browser default, so
  `+ 1rem − 16px` adds the visitor's text-size setting. It's exact at the reference size and close
  elsewhere (a 20px default makes the page 25% bigger at a 1000px column). Exact tracking everywhere
  would need typed CSS division (`1rem / 16px`), which Safari doesn't ship yet.

### Roles

Heading levels follow the page outline. When the size and the level disagree, use the class
(`.h1`, `.h2`, `.h3`), never a lower heading level just for its size.

| Role | Used for | Laptop rem (px at reference) | Phone rem (px at 375) |
| --- | --- | --- | --- |
| `h1`, `.h1` | case-study and 404 titles | 8.125 (130) | 3.516 (56) |
| `.display` | hero name, Highlights intro | 6.1875 (99) | 2.8125 (45) |
| `h2`, `.h2` | section headings, proof numbers | 4.375 (70) | 1.992 (32) |
| `h3`, `.h3` | card / job / skill titles, years, hero title, contact name, page marks, case-study lede and subheads | 2.125 (34) | 1.172 (19) |
| `.lead` | hero mantra, contact rows, case-study "next" link | 1.25 (20) | 1.055 (17) |
| `body`, `p` | all running text | 1.1875 (19) | 0.867 (14) |
| `.label` | small mono: stack lines, years, tags, card links, eyebrows, spec tables, back link | 0.8125 (13) | 0.656 (10.5) |
| `.button` | every `.button` | 0.9375 (15) | 0.8125 (13) |

Buttons size their padding, gap and height in `em`, so they scale with their text.

### Kept fixed (px, in `type.css`)

Chrome that sits over or around the page rather than in its column keeps one size at every window
and ignores `--scale`; page zoom still scales it.

- **Scroll rail, readout and dot tooltips:** navigation instruments pinned to the window edge; they
  stay the same size while the page under them changes.
- **Chat panel:** a dialog over the page with its own layout; its 16px input stops iOS from zooming.
- **Top nav and footer, skip link:** site chrome, the same on every page.

### Spacing changes needed for one global column

Work History, Education and Awards used to get their own narrower column on short windows. With one
root size for the whole page, they fit by tighter spacing instead: list row padding 2.4 → 1.2 `--u`,
list top margin 2.7 → 1.2 `--u`, section heading gap 1.8 → 1.4 `--u`. On phones, the hero's
button and title gaps shrank by 2–6px so the hero still fits at 415×780.

## Tests

- `tests/type-scale.spec.ts`: fails if any stylesheet other than `type.css` sets `font-size` or a
  size inside `font:` (only `font: inherit` is allowed). Exceptions need a commented allowlist entry.
- `tests/type-audit.spec.ts`: renders the home page at 1000×640 and 1100×704 (same shape, the column
  grows ~11%) and fails if any visible text element's font size or padding doesn't grow by the column
  ratio (3% tolerance). Fixed chrome is listed in the test with its reason.
- Existing fit tests (slots one screen tall, readable contact rows, hero fit on phones).

## Result (2026-10-26)

- Laptop: line breaks identical at 920×700, 1000×560, 1100×800, 1280×720, 1440×900, 1750×1000 and
  2200×1200; every slot fits one screen.
- Phone: identical at 375, 390, 414 and 430 wide (except one list paragraph at 414+); 480 wide
  holds the capped size, so it breaks differently.
- Sizes snapped to roles, so some text moved by 1–2px against the old per-element sizes (e.g. body
  text is 19px at the reference instead of 18 or 20).
