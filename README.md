# timotholt.com

Tim Otholt's portfolio: a static Astro site on GitHub Pages (live at https://timotholt.com) with an
"Ask Tim's AI" chat served by a Cloudflare Worker that calls Claude.

## Run locally

```sh
npm ci
npm run dev        # http://localhost:4321
npm run build      # static site in dist/
npx astro check    # type check (0 errors expected)
npm test           # Playwright suite (layout, rail, motion, links, chat)
```

## Where things live

| What | Where |
|---|---|
| Page composition | `src/pages/index.astro` (one component per section) |
| Sections | `src/components/sections/*.astro` |
| Content (jobs, skills, education, awards, highlights, contact) | `src/data/*.ts` |
| Projects (cards + case-study pages) | `src/content/projects/*.md`, one file per project |
| Project screenshots | `public/projects/<slug>-desktop.webp` and `<slug>-phone.webp` |
| Section colors (page + rail) | `src/data/sections.ts` |
| Styles | `src/styles/*.css`, imported in order by `global.css` |
| Scroll rail, keyboard glide, scenes | `src/scripts/` (`rail.ts`, `rail-drag.ts`, `keys.ts`, `scenes.ts`, `chrome.ts`, `state.ts`) |
| Chat UI | `src/components/ChatPanel.astro`, `src/scripts/chat.ts`, `src/styles/chat.css` |
| Chat Worker | `worker/` (see `docs/DEPLOY-CHAT.md`); its knowledge is `docs/persona.md` |
| Field cabling photo sheet (job attachment) | Source `docs/cabling-work/cabling-work.html`; `npm run build:cabling` writes `public/Timothy_Otholt_Cabling_Work.pdf` and `.png` (300 DPI). Photos must have GPS stamps blurred before they go in `docs/cabling-work/img/` |

Adding a project means adding one Markdown file in `src/content/projects/` (plus optional screenshots).
Every section is exactly one screen tall (`--slot-h`); the rail gets one dot per screen.

## Deploy

Pushing to `main` runs the GitHub Actions workflow, which builds and publishes `dist/` to GitHub Pages.
Screenshot URLs carry a content hash, so updated images show immediately.

## House rules

- No hover effects that move or resize anything (a test enforces it).
- Only two fonts: Archivo and JetBrains Mono.
- One layout breakpoint: phone layout below 900px, laptop layout from 900px. Size small phones fluidly (`clamp()`), not with extra breakpoints.
- Never commit secrets; the repo is public.
