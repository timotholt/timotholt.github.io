export interface Proof { value: string; count?: string; label: string; detail: string; photos?: { href: string; label: string; thumbs: string[]; total: number }; }
export const proofs: Proof[] = [
  { value: 'Millions', label: "of PCs shipped Tim's BIOS", detail: 'Phoenix Technologies / Toshiba, NEC, Fujitsu / invented FastBoot' },
  { value: '22', count: '22', label: 'AT&T 5G cell tower sites upgraded', detail: 'Fujitsu flexiHaul transport / VenTel, 2023–2025', photos: { href: '/Timothy_Otholt_Cabling_Work.pdf', label: 'Field photos', thumbs: ['/field-photos/rack.jpg', '/field-photos/fiber.jpg', '/field-photos/meter.jpg', '/field-photos/ground.jpg'], total: 9 } },
  { value: '30,000', count: '30000', label: 'books in a live store', detail: "Chantel's Corner / built end to end with AI coding agents" },
  { value: '4.0', count: '4.0', label: 'GPA in AI Software Engineering', detail: 'Maestro College / in progress' },
];
