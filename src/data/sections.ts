// Three colors repeat down the page in order: blue, yellow, green.
export const sections = [
  { key: 'contact', label: 'Home', bg: '#123A6B', fg: '#F4F1EA', accent: '#A9CBF2' },
  { key: 'projects', label: 'Projects', bg: '#E3BF5C', fg: '#14110F', accent: '#493008' },
  { key: 'highlights', label: 'Highlights', bg: '#194F32', fg: '#F4F1EA', accent: '#C6E4CA' },
  { key: 'process', label: 'Building With AI', bg: '#123A6B', fg: '#F4F1EA', accent: '#A9CBF2' },
  { key: 'skills', label: 'Skills', bg: '#E3BF5C', fg: '#14110F', accent: '#493008' },
  { key: 'jobs', label: 'Work History', bg: '#194F32', fg: '#F4F1EA', accent: '#C6E4CA' },
  { key: 'education', label: 'Education & Awards', bg: '#123A6B', fg: '#F4F1EA', accent: '#A9CBF2' },
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
  ...(['projects', 'highlights', 'process', 'skills', 'jobs', 'education'] as const).map(key => ({ id: key === 'jobs' ? 'experience' : key, label: sectionByKey[key].label })),
];
