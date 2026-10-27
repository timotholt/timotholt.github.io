---
title: Inductor & Firmware Checker
summary: Sizes inductors for power electronics from real core data, then generates the matching firmware constants and shows which ones break when a requirement changes.
tagline: "Sizes inductors for power electronics from real core data: give it the inductance and current you need, and it ranks real cores and windings, checks saturation and window fit, and draws the winding. A second workspace generates the matching firmware constants and shows which ones break when a requirement changes."
category: AI-assisted engineering
stack: [Python, C, JavaScript, Power electronics]
repo: https://github.com/timotholt/firmware-calgen
demo: https://timotholt.com/firmware-calgen/
year: "2026"
order: 2
problem: Sizing an inductor means checking core data, saturation and winding fit by hand, and the firmware constants that depend on that hardware are often copied from documents into code, so a changed requirement can silently break them.
approach: Built two linked workspaces. Magnetics ranks real catalog cores and windings for a required inductance and current, checks saturation and window fit, draws the winding, and audits past designs read back from their PDF drawings. Firmware traces every generated constant to its spec, blocks code generation when a check fails, and suggests repairs.
outcome: A working public demo on a realistic UPS power-electronics scenario. It is a screening and review tool, not a validated or shipped design.
---
It brings 13 years of BIOS and firmware work together with today's spec-driven, AI-assisted workflow.
