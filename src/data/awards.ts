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
  { year: '2006', title: 'Best Cinematography', what: 'Days of Reckoning', meta: '168 Hour Film Festival', italicWhat: true, link: { href: 'https://www.168film.com/film-festival/nominations-awards/2006', label: '168 Film Festival 2006 results', arrowOnly: true } },
  { year: '1997', title: 'Winner, PSXPower Contest', what: 'For new game developers · Prize: Sony Net Yaroze PlayStation dev kit', meta: 'IGN', link: { href: 'https://www.ign.com/articles/1997/04/23/psxpower-yaroze-contest-winner', label: 'IGN article', arrowOnly: true } },
];
