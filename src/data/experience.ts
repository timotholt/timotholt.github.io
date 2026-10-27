export interface Job { role: string; company: string; date: string; detail: string; link?: { href: string; label: string }; }
export interface JobPage { label: string; era: string; jobs: Job[]; }
export const experience: Job[] = [
  { role: 'Partner · Software Engineer & IT Support', company: 'Egghead Rodeo · Los Angeles, CA', date: '2022–now', detail: "Built Chantel's Corner, a live online bookstore with 30,000 books, end to end with AI coding agents (Rust, Axum, HTMX, PostgreSQL). On-call Windows and macOS support for private clients." },
  { role: 'Director of Photography & Owner', company: 'Light Hollywood LLC · Burbank, CA', date: '2003–2026', detail: 'Shot 11 feature films, 50+ short films, 200+ commercials, and 700+ interviews. Award for Best Cinematography for Days of Reckoning. Led 20–40 contractors on productions up to $500,000.' },
  { role: 'Contractor for AT&T', company: 'Ventura Telephone (VenTel) · Ventura, CA', date: '2023–2025', detail: 'Upgraded 22 AT&T cell tower sites across Southern California to Fujitsu flexiHaul HSN8300NA 5G fiber-optic transport. Wrote SOWs, installed SFPs, pulled SC/LC fiber runs and jumpers, and DC power plant cabling.', link: { href: '/Timothy_Otholt_Cabling_Work.pdf', label: 'Field photos (PDF)' } },
  { role: 'Firmware Engineer', company: 'VM Labs · Mountain View, CA', date: '2000–2001', detail: 'Shipped DVD firmware for six NUON DVD/game systems from Toshiba, Samsung, and Panasonic, with a global team on fault-tolerant firmware for high-volume products.' },
  { role: 'Senior Software Engineer', company: 'Spruce Technologies · San Jose, CA', date: '1998–2000', detail: 'Designed and delivered Plug-and-Play support for the Windows NT driver of the Spruce Dolby AC-3 audio card, and tuned driver performance for professional audio.' },
  { role: 'Programmer', company: 'Metalithic Systems · Sausalito, CA', date: '1996–1998', detail: 'Wrote Windows device drivers for Digital Wings, an FPGA-based digital audio workstation.' },
  { role: 'Design Engineer', company: 'Advanced Micro Devices · Santa Clara, CA', date: '1994–1996', detail: 'Wrote Windows device drivers and firmware for the InterWave audio card; integrated 13+ software components from a distributed team of 25+ engineers.' },
  { role: 'Design Engineer', company: 'Quantum · Milpitas, CA', date: '1992–1993', detail: 'Wrote the Windows device driver and hard-drive firmware for the Passport XL removable drive, built for 24/7 enterprise use and 50,000+ hours MTBF.' },
  { role: 'Software Engineer', company: 'Phoenix Technologies · San Jose, CA', date: '1988–1992', detail: 'Wrote motherboard BIOS in C and x86 assembly that shipped in millions of PCs from Toshiba, NEC, and Fujitsu. Invented and shipped FastBoot and Save-To-Disk.' }
];
// Job history is paged so every rail dot lands a full, settled screen.
export const jobPages: JobPage[] = [
  { label: 'Work · since 2002', era: 'Since 2002', jobs: [experience[0], experience[2], experience[1]] },
  { label: 'Work · engineering 1996–2001', era: 'Engineering 1996–2001', jobs: experience.slice(3, 6) },
  { label: 'Work · engineering 1988–1996', era: 'Engineering 1988–1996', jobs: experience.slice(6, 9) },
];
