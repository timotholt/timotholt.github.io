# Highlights + Skills rework (plan)

Tim, 2026-10-25: the black Highlights and purple Skills sections "suck". Main gripes: the
chip/circuit gimmick, the colors, and too many screens for little content. Wanted: plain
proof points for Highlights, grouped skill cards for Skills, softer colors.

## Highlights (2 slots, was 4)

Drop the BIOS-chip SVG slot and the three fly-in metric slots.

- **Slot 1, intro.** Keep the existing "From firmware to *what's next*" heading and the two
  short paragraphs (they move here from the first metric slot).
- **Slot 2, proof points.** Four rounded cards, 2x2 on desktop, stacked on phones:
  1. **Millions** of PCs shipped my BIOS: Phoenix Technologies, Toshiba / NEC / Fujitsu; invented FastBoot.
  2. **22** AT&T cell sites upgraded to Fujitsu 5G fiber transport (VenTel, 2023–2025).
  3. **30,000** books in Chantel's Corner, a live store I built end to end with AI coding agents.
  4. **4.0** GPA, AI Software Engineering, Maestro College (in progress).

  The "selected projects" count goes (Projects already says it). Big number in Archivo,
  label + one line of detail in JetBrains Mono.

## Skills (2 slots, was 9)

Drop the "Pinout" package drawing, the PIN/SIGNAL/DIR table and the logic waves.
Heading becomes **Skills**. Four rounded group cards, two per slot (side by side on
desktop, stacked on phones):

| Group | Years line | Skills (pill tags) |
|---|---|---|
| AI & software | 3 yrs AI-assisted dev | AI coding agents, TypeScript, JavaScript, Python, React / Node (MERN), SolidJS, Astro, MCP, Rust / Axum |
| Firmware & systems | 9 yrs firmware, 10 yrs Windows / macOS | BIOS (C, x86 asm), Windows device drivers, DVD / audio firmware, Windows & macOS support |
| Field & telecom | 22 AT&T sites | 5G fiber transport, SFPs & fiber runs, DC power cabling, SOWs |
| Delivery & production | 23 yrs client work | Client & project management, leading 20–40 contractors, film / live / AV, Ableton audio |

Each card: group title, years line, one-sentence summary, pill tags. Pills are rounded,
static (no hover effects at all).

## Colors (`src/data/sections.ts`)

| Section | Now | Proposed bg | fg | accent |
|---|---|---|---|---|
| Highlights | #1C1C1C black | **#8E4430** terracotta | #F4F1EA | #F6D2B8 |
| Skills | #5B2A6E purple | **#6E2F48** berry rose | #F4F1EA | #F2C9D8 |

Warm hues the palette lacks (green, teal, navy, gold already used). Cream text on both
passes WCAG AA. Cards use a translucent cream fill (`fg` at ~8%) and a 1px `fg` ~18% border,
radius 20px, matching the rounded chat panel and rail.

## Motion

Keep the existing scroll style (cards fly in from alternating sides and settle when the
slot lands; number counter for 22 / 30,000 / 4.0). Drop the chip zoom, the package parallax,
the logic sweep and the row flash. No hover/focus transforms (contact.spec enforces).

## Code + tests

- `src/pages/index.astro`: replace `pins`/`specs` data and both sections' markup.
- `src/styles/global.css`: remove dead chip/pinout/metric rules, add one new block.
- `src/scripts/home.ts`: replace `chipScene`/`skillsScene`/metric part of `profileScene`.
- Slots drop from 13 to 4 across these sections, so the page gets 9 fewer rail dots.
  `tests/rail.spec.ts` selectors (`.metric`, `.pinout-row`, `.chip-section`, `.pin-slot`)
  change to the new classes on purpose. Add a test in `tests/sections.spec.ts` that the
  proof cards and skill groups fit inside their slot at all four viewports.
- Check 375x812, 1000x560, 1280x720, 1440x900 with before/after screenshots.
