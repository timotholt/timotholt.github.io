---
title: solid-tree
summary: "A library of four SolidJS tree components: a basic tree, a virtualized tree for huge datasets, a bring-your-own-database tree, and a batteries-included Supabase tree with automatic multi-user leaf locking. Built for the SolidJS ecosystem using the amazing TanStack Query library."
tagline: "Tree views for SolidJS apps, from a simple list to a live, multi-user tree that locks what someone else is editing."
category: Interface engineering
stack: [SolidJS, TanStack Query, TanStack Virtual, Supabase, TypeScript]
repo: https://github.com/timotholt/solid-tree
demo: https://timotholt.com/solid-tree/
year: "2026"
order: 1
problem: Large hierarchical interfaces need to stay responsive and usable by keyboard, even when data loads or changes asynchronously.
approach: Built a headless tree API with virtualization, async and realtime sources, multi-select, rename, checkboxes, drag-and-drop, and Supabase record locking.
outcome: A reusable foundation for demanding tree interfaces, open source on GitHub with a live demo of all four trees.
---
This project concentrates complex tree behavior behind a reusable API so applications can choose their own visual treatment.
