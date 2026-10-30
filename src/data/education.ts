export interface EducationEntry {
  year: string;
  title: string;
  gpa?: string;
  what?: string;
  meta: string;
  link?: { href: string; label: string; arrowOnly?: boolean };
}

export const education: EducationEntry[] = [
  { year: '2027', title: 'AAS in AI Software Engineering', gpa: ', GPA 4.0', what: 'In progress, expected December 2027', meta: 'Maestro College' },
  { year: '2024', title: 'MERN Full Stack Software Engineering', gpa: ', GPA 3.8', what: '2nd in class, Core Values Award, full scholarship', meta: 'Per Scholas', link: { href: '/certificates/Per_Scholas_Certificate_of_Completion.png', label: 'Certificate', arrowOnly: true } },
  { year: '2014–2016', title: 'Electronic Music Production Certificate', what: 'Ableton Live', meta: 'Dubspot Hollywood' },
];
