export const sections = [
  { key: 'contact', label: 'Contact', bg: '#E8541C', fg: '#14110F', accent: '#381006' },
  { key: 'highlights', label: 'Highlights', bg: '#1C1C1C', fg: '#F4F1EA', accent: '#DAA47D' },
  { key: 'projects', label: 'Projects', bg: '#0F4C5C', fg: '#F4F1EA', accent: '#BFE3EA' },
  { key: 'skills', label: 'Skills', bg: '#5B2A6E', fg: '#F4F1EA', accent: '#DEC5EB' },
  { key: 'jobs', label: 'Job history', bg: '#14213D', fg: '#F4F1EA', accent: '#AFCAE8' },
  { key: 'awards', label: 'Awards', bg: '#C99A2E', fg: '#14110F', accent: '#493008' },
  { key: 'education', label: 'Education', bg: '#194F32', fg: '#F4F1EA', accent: '#C6E4CA' },
] as const;

export type SectionKey = typeof sections[number]['key'];
export const sectionByKey = Object.fromEntries(sections.map(section => [section.key, section])) as Record<SectionKey, typeof sections[number]>;
export const sectionStyle = (key: SectionKey) => {
  const { bg, fg, accent } = sectionByKey[key];
  return `--sec-bg:${bg};--sec-fg:${fg};--section-accent:${accent}`;
};
