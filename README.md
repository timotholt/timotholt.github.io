# timotholt.com — Phase 1

Static Astro portfolio. Content is drafted for Tim's review. No chat worker is included.

## Run locally

```sh
npm ci
npm run dev
```

Open the URL Astro prints (normally `http://localhost:4321`). Verify with `npm run build` and `npx astro check`.

## Edit content

Each featured project is one Markdown file in `src/content/projects/`. Frontmatter controls the home-page card, case-study sections, repository, optional live demo, and display order. Adding a file creates `/projects/<slug>/` at build time. The home page copy is in `src/pages/index.astro`.

## Tim review checklist

- TODO(tim): Replace `/public/headshot-placeholder.svg` with an approved headshot and update the hero image path and alt text.
- TODO(tim): Confirm the hero title line, public location (`Los Angeles, CA`), and `America/Los_Angeles` clock timezone.
- TODO(tim): Approve the six featured projects and all draft copy, especially the Galaxy Demo description and outcome.
- TODO(tim): Supply a LinkedIn URL; the site currently shows a placeholder.
- TODO(tim): Supply an approved resume PDF as `public/resume.pdf`, then replace the Contact placeholder with a download link.
- TODO(tim): Add approved screenshots for each case study.
- TODO(tim): Publish and verify live demo URLs for Firmware CalGen, MCP Logger, and Galaxy Demo. Their case studies currently link to repositories only.

The deploy workflow runs checks and publishes `dist/` to GitHub Pages when pushed to `main`. Local implementation does not configure Pages, push, or change DNS.
