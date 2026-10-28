export const sections = [
  { key: 'contact', label: 'Contact', bg: '#123A6B', fg: '#F4F1EA', accent: '#A9CBF2' },
  { key: 'highlights', label: 'Highlights', bg: '#8E4430', fg: '#F4F1EA', accent: '#F6D2B8' },
  { key: 'projects', label: 'Projects', bg: '#0F4C5C', fg: '#F4F1EA', accent: '#BFE3EA' },
  { key: 'process', label: 'How Tim builds', bg: '#1E1E1E', fg: '#F4F1EA', accent: '#F2B880' },
  { key: 'skills', label: 'Skills', bg: '#6E2F48', fg: '#F4F1EA', accent: '#F2C9D8' },
  { key: 'jobs', label: 'Work History', bg: '#14213D', fg: '#F4F1EA', accent: '#AFCAE8' },
  { key: 'education', label: 'Education', bg: '#194F32', fg: '#F4F1EA', accent: '#C6E4CA' },
  { key: 'awards', label: 'Awards', bg: '#C99A2E', fg: '#14110F', accent: '#493008' },
] as const;

export type SectionKey = typeof sections[number]['key'];
export const sectionByKey = Object.fromEntries(sections.map(section => [section.key, section])) as Record<SectionKey, typeof sections[number]>;
export const sectionStyle = (key: SectionKey) => {
  const { bg, fg, accent } = sectionByKey[key];
  return `--sec-bg:${bg};--sec-fg:${fg};--section-accent:${accent}`;
};

// The top menu lists the same screens as the scroll rail, in page order, under the rail's short names.
export const navLinks = [
  { id: 'home', label: 'Home' },
  ...(['highlights', 'projects', 'process', 'skills', 'jobs', 'education', 'awards'] as const).map(key => ({ id: key === 'jobs' ? 'experience' : key, label: sectionByKey[key].label })),
  { id: 'contact', label: 'Contact' },
];
