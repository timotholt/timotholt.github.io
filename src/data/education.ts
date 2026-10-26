export interface EducationEntry {
  year: string;
  title: string;
  gpa?: string;
  what?: string;
  meta: string;
}

export const education: EducationEntry[] = [
  { year: '2027', title: 'AAS in AI Software Engineering', gpa: ', GPA 4.0', what: 'In progress, expected December 2027', meta: 'Maestro College' },
  { year: '2024', title: 'MERN Full Stack Software Engineering', gpa: ', GPA 3.8', what: '2nd in class, Core Values Award, full scholarship', meta: 'Per Scholas' },
  { year: '2014–2016', title: 'Electronic Music Production Certificate', what: 'Ableton Live', meta: 'Dubspot Hollywood' },
  { year: '1985–1987', title: 'Information & Computer Science Coursework', meta: 'University of Hawaii at Mānoa' },
];
