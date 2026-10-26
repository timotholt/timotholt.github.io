export interface SkillGroup { title: string; years: string; summary: string; tags: string[]; }
// Skills, two groups per slot so each rail dot lands a full, settled screen.
export const skillGroups: SkillGroup[] = [
  { title: 'AI & software', years: '3 yrs AI-assisted · 2 yrs MERN', summary: 'Shipping real products with AI coding agents, from a live 30,000-book store to public projects.', tags: ['AI coding agents', 'TypeScript', 'JavaScript', 'Python', 'React / Node (MERN)', 'SolidJS', 'Astro', 'MCP', 'Rust / Axum'] },
  { title: 'Firmware & systems', years: '9 yrs firmware · 10 yrs Windows / macOS', summary: 'BIOS and device drivers that shipped in millions of PCs, plus DVD and pro-audio firmware.', tags: ['BIOS (C, x86 asm)', 'Windows device drivers', 'DVD / audio firmware', 'Windows & macOS support'] },
  { title: 'Field & telecom', years: '22 AT&T sites · 2023–2025', summary: 'Upgraded AT&T cell sites to 5G fiber transport, from the SOW to the last fiber jumper.', tags: ['5G fiber transport', 'SFPs & fiber runs', 'DC power cabling', 'SOWs'] },
  { title: 'Delivery & production', years: '23 yrs client work', summary: 'Two decades running film, live and AV productions on real budgets and deadlines.', tags: ['Client & project management', 'Leading 20–40 contractors', 'Film / live / AV', 'Ableton audio'] },
];
export const skillPages: SkillGroup[][] = [skillGroups.slice(0, 2), skillGroups.slice(2, 4)];
