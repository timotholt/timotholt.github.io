# Scrollbar (the rail as a Mac-style scrollbar)

## Ask (Tim, 2026-10-29)

Reskin the rail as a macOS scrollbar on every platform (the OS bar stays hidden): a gray track with a draggable pill
thumb, plus tick marks as guidance, and a popup that says where you are going.

Decisions (Tim):

- Thumb: Mac pill, length = the share of the page on screen.
- Color: pure Mac gray. No section color bands.
- Always visible (no fade-out).
- Same on phones, tablets and laptops.

## Design

- **Track:** fixed to the right edge, full height, like a native bar. Light gray with a hairline on its left edge.
  Laptops 15px wide, phones 11px.
- **Thumb:** gray rounded pill, inset 3px in the track, darker on hover and while dragging. Its length is one rail cell
  (every page is one screen tall, so a cell is exactly the share of the page on screen); its center rides the same
  progress tip the fill used, so it sits on a tick when you land on that page.
- **Ticks:** a short gray line per page (the old dots, still buttons: click/Enter jumps there). The first page of each
  section gets a longer tick, so sections still read as groups.
- **Popups (same dark pill as today):**
  - Hovering the track shows the name of the page that spot leads to, beside the pointer's tick.
  - While scrolling or dragging, the readout (page name and %) rides beside the thumb, then fades out about a second
    after scrolling stops. At rest nothing covers the page.
  - Phones: the readout shows only while dragging the thumb (it would cover content otherwise).
- **Input:** press the track to jump there, then keep dragging; grab the thumb to drag it without jumping (keeps the
  grab offset, like macOS). Works with mouse, pen and touch; on touch only the rail itself captures the gesture.

## Tests

- Rail tests move from the fill and bands to the thumb: thumb rides from the top of the track to the bottom, the
  readout rides the thumb, dragging the thumb scrolls, a tap-drag works on phones.
- The section-band assertions are removed (there are no bands any more); the section palette checks stay.
- Full gate: `npm test`, `npx astro check`.
