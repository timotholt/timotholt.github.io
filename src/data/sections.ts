export const sections = [
  { id: 'contact', key: 'contact', label: 'Contact', color: '#b83800', darkColor: '#ff7540' },
  { id: 'highlights', key: 'highlights', label: 'Highlights', color: '#1553ad', darkColor: '#78afff' },
  { id: 'projects', key: 'projects', label: 'Projects', color: '#7130a5', darkColor: '#ce96ff' },
  { id: 'skills', key: 'skills', label: 'Skills', color: '#006d69', darkColor: '#55d2cb' },
  { id: 'jobs-since', key: 'jobs-since', label: 'Job history · Since 2002', color: '#267039', darkColor: '#82d991' },
  { id: 'jobs-eng', key: 'jobs-eng', label: 'Job history · Engineering', color: '#566b18', darkColor: '#bdd870' },
  { id: 'education', key: 'education', label: 'Education', color: '#806000', darkColor: '#f0cc54' },
  { id: 'awards', key: 'awards', label: 'Awards', color: '#ae2d69', darkColor: '#ff91bc' },
] as const;

export type SectionKey = typeof sections[number]['key'];
export const sectionByKey = Object.fromEntries(sections.map(section => [section.key, section])) as Record<SectionKey, typeof sections[number]>;
export const sectionStyle = (key: SectionKey) => `--sec:${sectionByKey[key].color};--sec-dark:${sectionByKey[key].darkColor}`;
