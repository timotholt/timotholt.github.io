export interface AwardEntry {
  year: string;
  title: string;
  what: string;
  meta: string;
  italicWhat?: boolean;
  link?: { href: string; label: string; arrowOnly?: boolean };
}

export const awards: AwardEntry[] = [
  { year: '2024', title: 'Core Values Award in Software Engineering', what: 'Ambition, Integrity & Perseverance', meta: 'Per Scholas', link: { href: '/certificates/Per_Scholas_Core_Values_Award.png', label: 'Certificate', arrowOnly: true } },
];
