# CSS and home script refactor audit

CSS bytes: **59,731 before → 50,983 after** (sum of `src/styles/*.css`).

## Final files

| File | Bytes |
| --- | ---: |
| `src/styles/base.css` | 1,344 |
| `src/styles/chat.css` | 7,588 |
| `src/styles/contact.css` | 4,118 |
| `src/styles/global.css` | 600 |
| `src/styles/header.css` | 2,954 |
| `src/styles/hero.css` | 6,206 |
| `src/styles/highlights.css` | 1,868 |
| `src/styles/layout.css` | 3,262 |
| `src/styles/lists.css` | 4,316 |
| `src/styles/projects.css` | 10,666 |
| `src/styles/rail.css` | 4,278 |
| `src/styles/skills.css` | 2,454 |
| `src/styles/tokens.css` | 228 |
| `src/styles/utilities.css` | 1,101 |
| `src/scripts/chrome.ts` | 803 |
| `src/scripts/home.ts` | 53 |
| `src/scripts/keys.ts` | 3,579 |
| `src/scripts/rail.ts` | 7,098 |
| `src/scripts/scenes.ts` | 8,693 |
| `src/scripts/state.ts` | 630 |

## Deleted selector groups

152 distinct selector groups removed. Each required a class or ID absent from all six built HTML pages and from runtime selector/class creation in `src/scripts/*.ts`. Rules with uncertain dynamic matches were retained, including `.rail-dot.passed`.

```css
#projects .project-card:has(.has-shot) .card-top
#skills .logic-sweep
#trace-active
#trace-base
#wave-line
#waveform
.about-grid
.about-grid p:last-child
.about-grid>div
.award-line
.award-line p
.award-line>span
.band.is-active .trace-via
.bios-chip
.button-text
.button-text:hover
.card-top
.card-top span:first-child
.case-topline
.chip-dive-iris
.chip-section .bios-chip
.cinematic #projects
.cinematic #projects .card-links
.cinematic #projects .project-card
.cinematic #projects .project-card .card-content
.cinematic #projects .project-card .card-links
.cinematic #projects .project-card .card-top
.cinematic #projects .project-card .project-function
.cinematic #projects .project-card .project-media
.cinematic #projects .project-card .spec-table
.cinematic #projects .project-card h3
.cinematic #projects .project-function
.cinematic #projects .project-grid
.cinematic #projects .project-note
.cinematic #projects .project-progress
.cinematic #projects .section-heading
.cinematic #projects .section-heading h2
.cinematic #projects .section-heading p
.cinematic #projects .section-label
.cinematic #projects .spec-table
.cinematic #projects .spec-table>div
.cinematic #skills
.cinematic #skills .section-heading
.cinematic #skills .section-label
.cinematic #skills>.wrap
.cinematic .about-grid
.cinematic .about-grid p
.cinematic .about-grid>div
.cinematic .about-section
.cinematic .about-section h2
.cinematic .hero
.cinematic .hero h1
.cinematic .hero-actions
.cinematic .hero-art
.cinematic .hero-meta
.cinematic .hero-pitch
.cinematic .metric
.cinematic .metric small
.cinematic .metric+.metric
.cinematic .metric-grid
.cinematic .metric-label
.cinematic .metric-value
.cinematic .pinout h3
.cinematic .pinout p
.cinematic .pinout-row
.cinematic .project-progress
.cinematic .socials
.cinematic .wave-panel
.color-section .about-grid>div
.color-section .card-top span:first-child
.color-section .chip-leads text
.color-section .chip-stage-label
.color-section .metric
.color-section .metric small
.color-section .metric-slot
.color-section .metric-value
.color-section .pin-number
.color-section .pinout
.color-section .pinout p
.color-section .pinout-row
.color-section .project-card .card-top
.contact-links
.contact-links a:hover
.contact-mail
.contact-mail span
.contact-mail:hover
.credential
.credential h3
.credential p
.credential-grid
.credential>span
.headshot
.hero-art
.hero-meta
.hero-race-traces
.hero-race-traces path
.hero-ref
.job-list>.job-slot:last-child .cred-item
.js-reveal
.logic-sweep
.mesh-label
.mesh-label-a
.mesh-label-b
.metric
.metric small
.metric+ .metric
.metric+.metric
.metric-grid
.metric-label
.metric-slot:first-child
.metric-slot:first-child .about-grid>div
.metric-slot:first-child .metric
.metric-slot:first-child .metric-value
.metric-value
.metric:last-child
.package-drawing
.pin-number
.pin-slot
.pinout
.pinout h3
.pinout p
.pinout-head
.pinout-head span:last-child
.pinout-row
.pinout-row .logic-wave
.pinout-row .pin-number
.pinout-row h3
.pinout-row p
.pinout-row p:before
.pinout-row>span:not(.pin-number)
.pinout-row>span:not(.pin-number)::before
.pinout-row>span:not(.pin-number):before
.portrait-caption
.portrait:has(canvas[width]) .mesh-label
.project-progress
.scene-wipe
.signal-system
.signal-system path
.signal-system svg
.skills-intro
.skills-visual
.socials
.socials a:hover
.soon
.status-dot
.trace-section.is-active .trace-via
.wave-axis
.wave-bottom
.wave-panel
.wave-panel:after
.wave-panel:before
.wave-top
```

## Verification and limits

- `npm run build`: passed with no build warnings.
- `npx astro check`: 0 errors and 0 warnings (one existing unused-variable hint in `tests/rail.spec.ts`).
- Static selector/declaration cascade comparison of the built pages at 320, 390, 480, 481, 740, 741, 767, 768, 800, 899, 900, 1050, 1051, and 1200 px, plus reduced-motion passes at 390, 800, and 1200 px: no differences after normalizing equivalent CSS value formatting.
- Browser screenshot and interaction parity remain for the user’s Playwright and pixel-diff gate. The static audit does not simulate every dynamic state or computed layout.
