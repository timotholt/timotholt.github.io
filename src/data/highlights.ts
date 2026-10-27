export interface Proof { value: string; count?: string; label: string; detail: string; link?: { href: string; label: string }; }
export const proofs: Proof[] = [
  { value: 'Millions', label: "of PCs shipped Tim's BIOS", detail: 'Phoenix Technologies / Toshiba, NEC, Fujitsu / invented FastBoot' },
  { value: '22', count: '22', label: 'AT&T 5G cell tower sites upgraded', detail: 'Fujitsu flexiHaul transport / VenTel, 2023–2025', link: { href: '/Timothy_Otholt_Cabling_Work.pdf', label: 'Field photos (PDF)' } },
  { value: '30,000', count: '30000', label: 'books in a live store', detail: "Chantel's Corner / built end to end with AI coding agents" },
  { value: '4.0', count: '4.0', label: 'GPA in AI Software Engineering', detail: 'Maestro College / in progress' },
];
