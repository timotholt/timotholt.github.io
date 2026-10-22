export const sections = [
  { key: 'contact', label: 'Contact', bg: '#0F3D2A', fg: '#F4F1EA', accent: '#A8E0C0' },
  { key: 'highlights', label: 'Highlights', bg: '#1C1C1C', fg: '#F4F1EA', accent: '#DAA47D' },
  { key: 'projects', label: 'Projects', bg: '#0F4C5C', fg: '#F4F1EA', accent: '#BFE3EA' },
  { key: 'skills', label: 'Skills', bg: '#5B2A6E', fg: '#F4F1EA', accent: '#DEC5EB' },
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
