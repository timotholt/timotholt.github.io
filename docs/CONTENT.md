# timotholt.com — Content Plan (draft for Tim)

Sources: `jobhunter/applications/_general-swe/resume.html`, `alchimetis-ai-intern/resume.html`,
`STANDARD_ANSWERS.md` (public-safe sections only), GitHub repos. Every claim below is from
those sources. Nothing invented. Edit freely; Codex applies this file verbatim.

Legend: **NOW** = what the site says today · **NEW** = proposed · ❓ = needs your call

---

## Global fixes (errors on the site today)

| Item | NOW | NEW |
|---|---|---|
| Location | Los Angeles, CA | **La Habra, CA** |
| IGN 1997 | "Featured, IGN PSXPower" | **Winner, IGN PSXPower Contest — prize: Sony Net Yaroze PS1 dev kit** |
| LinkedIn | TODO | **linkedin.com/in/timotholt** |
| "YEAR: See repository" on every card | filler | real year, or drop the row |
| Pitch | generic ("useful software where people, systems, and new technology meet") | specific — see Hero |

---

## 00 · Hero (photo + name)

- Eyebrow: `AVAILABLE FOR ENGINEERING ROLES · SOUTHERN CALIFORNIA`
- Name: **Tim Otholt.**
- Title: **Agentic AI Engineer** / Forward Deployed Engineer
- Pitch (2 lines max):
  > I build software by directing AI coding agents — I write the specs, run agents in parallel,
  > gate their work with tests, and review every change. Before that, my BIOS code shipped in millions of PCs.
- Chip: `LOC / La Habra, CA` · `LOCAL / time PT`
- Buttons: View my work · Ask my AI (coming soon) · Get in touch
- Links: GitHub · LinkedIn · Email

## 01 · BIOS chip

No copy needed beyond labels. Change caption `SILICON / SIGNAL PATH` → `PHOENIX BIOS · 1988` (true, ties chip to story).

## 02 · Profile + stats

- Headline: **From BIOS to agents.** (NOW: "From firmware to what's next." — vague)
- Body:
  > I spent 13 years writing firmware and drivers — BIOS at Phoenix Technologies, then Quantum, AMD,
  > and VM Labs. Then twenty years running a production company in Burbank, leading crews of 20–40 on
  > 200+ commercials and 11 features. Now I'm back in engineering, building with AI agents and finishing
  > an A.A.S. in AI Software Engineering with a 4.0.
- Stats (one slot each). NOW: 22 cell sites · 05 projects · 4.0 GPA. "05 projects" is weak.
  1. **Millions** — PCs shipped with my BIOS (Toshiba, NEC, Fujitsu)
  2. **30,000** — books live on Chantel's Corner, built with AI agents
  3. **200+** — commercials shot, plus 11 features
  4. **22** — AT&T cell sites upgraded, zero service interruption
  5. **4.0** — GPA, A.A.S. AI Software Engineering
  ❓ 5 stats = 5 slots (was 3). OK?

## 03 · Work (projects) — reorder strongest first

| # | NOW | NEW |
|---|---|---|
| TO-001 | Bookstore — "server-rendered bookstore with accounts and carts" | **Chantel's Corner** — A live online bookstore with 30,000 books, built end to end with AI coding agents, from prototype to deployment. Rust · Axum · HTMX · PostgreSQL. Live: chantelscorner.com |
| TO-002 | Firmware CalGen — "calibration specs into traceable constants" | **firmware-calgen** — Turns datasheets into tested C firmware constants. Every value traced to its source and gated by automated checks and a gcc build; an LLM drafts only labels, scored against a blind answer key. Python · C · gcc |
| TO-003 | solid-tree (unchanged) | **solid-tree** — Accessible, fast tree view for SolidJS: virtualization, async/realtime sources, Supabase record locking, multi-select, drag-and-drop, headless API. Live demo |
| TO-004 | timotholt.com | **timotholt.com** — this site. Spec-driven, built by AI agents (Codex + Claude Code) with a Playwright test gate. Astro · GSAP · GitHub Pages |
| TO-005 | MCP Logger | ❓ **Keep or cut.** Last touched Oct 2025, small. Keeping it = 5 project slots; cutting = 4. |

Section intro NOW: "5 projects across interface, firmware, product, and portfolio engineering." →
NEW: **"Everything here was built spec-first with AI coding agents, then tested and reviewed by me."**

Case-study pages: rewrite problem/approach/outcome from the same facts (Codex drafts, you approve).

## 04 · Pinout (skills) — 9 rows → 9 rows, sharper

| PIN | SIGNAL | NOW | NEW |
|---|---|---|---|
| 01 | `AGENTIC_AI` | "AI-assisted software development · 3 yrs" | Spec-driven agentic engineering: design specs and agent instructions, parallel multi-agent development, automated test gates, review of agent output · Claude Code, Codex · 3 yrs · Expert |
| 02 | `FW_BIOS` | ok | BIOS and firmware from CPU reset through the boot loader; FastBoot and Save-To-Disk · 9 yrs · Expert |
| 03 | `DRIVERS` | (merged into 01) | Windows device drivers — Quantum, AMD, Metalithic, Spruce |
| 04 | `DEBUG_HW` | — | In-circuit emulators, logic analyzers, oscilloscopes |
| 05 | `LANG_BUS[0..6]` | "TypeScript · JS · Python · SolidJS · Astro · MCP" | Python · TypeScript · JavaScript · C · x86 assembly · SQL · Rust |
| 06 | `CLIENT_MGMT` | ok | Client management and project coordination · 23 yrs · Expert |
| 07 | `IT_SUPPORT` | "Windows and macOS · 10 yrs" | Windows and macOS support for private clients · 10 yrs · Expert |
| 08 | `RF_FIBER` | ok | Fiber-optic router upgrades at 22 AT&T cell sites (Ventel, 2023–2025) |
| 09 | `AV_FILM` + `AUDIO_DAW` | 2 rows | Merge: Film, live-event AV, and music production — DP on 200+ commercials; Best Cinematography 2006; Ableton (Dubspot) |

Drop: `MERN` row (now part of LANG_BUS + Per Scholas in POST).

## 05 · Field notes (experience) — 4 rows → 10 rows (your favorite animation, more of it)

NOW the six firmware jobs are squashed into one row. Split them — they're the strongest thing you have.

1. **2022–now · Egghead Rodeo (Partner)** — Software Engineer & IT Support. Built Chantel's Corner (30,000-book live store) with AI agents; on-call Windows/macOS support.
2. **2023–2025 · Ventel Telephone, contractor for AT&T** — Upgraded fiber-optic routers at 22 cell sites across Southern California without interrupting service.
3. **2003–2026 · Light Hollywood LLC, Owner & Director of Photography** — Led crews of 20–40 on 200+ commercials and 11 features; corporate clients incl. Mercedes, BMW, T-Mobile.
4. **2003 · Bay Meadows Racetrack, IT Support** — 500+ PCs on a Novell NetWare network. ❓ keep?
5. **2000–2001 · VM Labs, Firmware Engineer** — Shipped DVD firmware for six NUON systems from Toshiba, Samsung, and Panasonic.
6. **1998–2000 · Spruce Technologies, Senior Software Engineer** — Plug-and-Play support for the Windows NT driver of the Dolby AC-3 audio card.
7. **1996–1998 · Metalithic Systems, Programmer** — Windows drivers for Digital Wings, an FPGA-based digital audio workstation.
8. **1994–1996 · AMD, Design Engineer** — Drivers and firmware for the InterWave audio card; integrated 13+ components from a 25+ engineer team.
9. **1992–1993 · Quantum, Design Engineer** — Driver and hard-drive firmware for the Passport XL removable drive; built for 50,000+ hours MTBF.
10. **1988–1992 · Phoenix Technologies, Software Engineer** — BIOS in C and x86 assembly, shipped in millions of PCs (Toshiba, NEC, Fujitsu). Invented and shipped FastBoot and Save-To-Disk.

❓ FCS Security (2026, data-center security officer, AWS hall) — omitted. Include?

## 06 · Power-on self-test (education + awards)

```
OTHOLT-BIOS v2026.10   (C) 1988-2026
Phoenix BIOS ........ FastBoot / Save-To-Disk          OK
Checking education .....
  A.A.S. AI Software Engineering, Maestro College   GPA 4.00   (Dec 2027)
  Software Engineer course, Per Scholas 2024        GPA 3.8    400+ hrs, full scholarship
  Info & Computer Science, Univ. of Hawaii 1985-87  COURSEWORK
  Electronic Music Production, Dubspot 2014-2016    CERT
Checking awards .........
  WINNER, IGN PSXPower Contest 1997 (Net Yaroze dev kit)   OK
  Best Cinematography, 168 Hour Film Festival 2006         OK
  Core Values Award, Per Scholas 2024 (2nd in class)       OK
All systems nominal. Booting Tim...
```

## 07 · Contact

- Headline: **Let's make something work.** (keep)
- Body: **Hiring for AI engineering, forward deployed, or firmware work? I'd like to hear about it.**
- Email: tim@timotholt.com ⚠ only works after Cloudflare Email Routing is set up — until then use timotholt@gmail.com ❓
- LinkedIn: linkedin.com/in/timotholt
- Resume PDF: ❓ publish a web version **without your phone number**? (resumes list (408) 406-1832 — I'd keep that off a public site)

---

## Open questions (answer inline)

1. 5 stats OK?
2. MCP Logger: keep or cut?
3. Bay Meadows (2003 IT) row: keep?
4. FCS Security (2026): include?
5. Contact email until DNS moves: tim@timotholt.com or gmail?
6. Resume PDF: publish phone-free version?
