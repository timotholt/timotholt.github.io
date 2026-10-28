export interface AwardEntry {
  year: string;
  title: string;
  what: string;
  meta: string;
  italicWhat?: boolean;
  link?: { href: string; label: string };
}

export const awards: AwardEntry[] = [
  { year: '2024', title: 'Core Values Award in Software Engineering', what: 'Ambition, Integrity & Perseverance', meta: 'Per Scholas', link: { href: '/certificates/Per_Scholas_Core_Values_Award.png', label: 'Certificate' } },
  { year: '2006', title: 'Best Cinematography', what: 'Days of Reckoning', meta: '168 Hour Film Festival', italicWhat: true },
  { year: '1997', title: 'Winner, PSXPower Contest', what: 'For new game developers · Prize: Sony Net Yaroze PlayStation dev kit', meta: 'IGN' },
];
