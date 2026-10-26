// "How I build with AI": the working method, each step backed by something checkable on this site.
export const processSteps = [
  {
    title: 'Spec first',
    years: 'Plan before code',
    summary: 'Every change starts as a short written spec: the goal, the constraints, and what done looks like. This site began as docs/SPEC.md.',
    tags: ['Specs', 'Agent instructions', 'Scope control'],
  },
  {
    title: 'Agents in parallel',
    years: 'Claude Code + Codex',
    summary: 'I split the work and run AI coding agents side by side on separate tasks, keeping them out of each other’s files, while I direct and decide.',
    tags: ['Claude Code', 'OpenAI Codex', 'Task splitting'],
  },
  {
    title: 'Gate everything',
    years: 'Nothing ships red',
    summary: 'No change goes live until the gate is green: nearly 60 browser tests on this site, plus a 51-screenshot pixel diff whenever I refactor.',
    tags: ['Playwright', 'Pixel diff', 'CI deploys'],
  },
  {
    title: 'Review every change',
    years: 'Human in the loop',
    summary: 'I read what the agents produce and catch what tests miss: a 2px overlap, a stale image cache, a CSS rule that quietly came back to life.',
    tags: ['Code review', 'Debugging', 'Root causes'],
  },
];
export const processPages = [processSteps.slice(0, 2), processSteps.slice(2, 4)];
