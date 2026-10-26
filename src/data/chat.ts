// "Ask Tim's AI" shared data: used by the site (starters, offline fallback) and
// bundled into the Worker (topic tagging, follow-ups, canned declines).
// Keep it free of browser and Worker APIs.
import { contact } from './contact';

export const limits = { maxTurns: 30, maxChars: 500 } as const;

export const unknownPhrase = `That's not covered here — email Tim at ${contact.email}.`;

export const starters = [
  "What's Tim's AI experience?",
  'Is Tim open to internships or junior roles?',
  'Show me a project',
  'How do I reach Tim?',
] as const;

export interface Topic {
  key: string;
  pattern: RegExp;
  /** Offline answer, third person about Tim, facts from the live site only. */
  answer: string;
  followUps: string[];
  link?: { href: string; text: string };
}

const reach = `email ${contact.email}, call ${contact.phone}, or find Tim on LinkedIn at ${contact.linkedin}`;

// First match wins: specific topics before general ones.
export const topics: Topic[] = [
  {
    key: 'contact',
    pattern: /\b(contact|reach|e-?mail|phone|call|linkedin|get in touch)\b/i,
    answer: `The best way to reach Tim: ${reach}.`,
    followUps: ['Show me a project', "What's Tim's AI experience?"],
  },
  {
    key: 'why-junior',
    pattern: /\bwhy\b.*\b(intern\w*|junior|apprentic\w*|entry[- ]level|start over)\b/i,
    answer: "Tim wrote firmware and BIOS code from 1988 to 2001, then spent twenty years in film. To rebuild an engineering career, Tim went back to school: Per Scholas in 2024 (2nd in class) and now an A.A.S. in AI Software Engineering (4.0 GPA). An internship or junior role is the honest way back in. The fundamentals still apply, and Tim would rather learn today's stack inside a team that ships.",
    followUps: ["What's Tim's AI experience?", 'How do I reach Tim?'],
  },
  {
    key: 'availability',
    pattern: /\b(availab\w*|remote|relocat\w*|hybrid|on-?site|start date|full[- ]time|part[- ]time|contract\w*|open to|notice|intern\w*|junior|apprentic\w*|entry[- ]level|why now)\b/i,
    answer: `Yes. Tim is looking for an on-ramp: internships, apprenticeships and junior roles in AI engineering, software or firmware, and is available now. Tim wrote BIOS and drivers for 13 years, spent twenty in film, and came back to engineering on purpose (Per Scholas, 2nd in class; A.A.S. in AI Software Engineering, 4.0). Remote, hybrid or on-site; based in ${contact.location}. Résumé: timotholt.com/Timothy_Otholt_Resume.pdf. To talk, ${reach}.`,
    followUps: ['Why an internship?', 'How do I reach Tim?'],
  },
  {
    key: 'fde',
    pattern: /forward[- ]deployed|\bfde\b|customer[- ]facing|field engineer|solutions engineer/i,
    answer: "Tim builds software with AI coding agents every day, and the hard part is never the model. It's fitting it to a real customer's mess. That's the job Tim wants: sitting with the customer, building with AI, and owning the result.",
    followUps: ["What's Tim's AI experience?", 'Tell me about the cell-site work'],
  },
  {
    key: 'solid-tree',
    pattern: /solid[- ]?tree|solidjs|tanstack|virtuali[sz]ed/i,
    answer: 'solid-tree is a library of four SolidJS tree components: a basic tree, a virtualized tree for huge datasets, a bring-your-own-database tree, and a Supabase tree with automatic multi-user leaf locking.',
    followUps: ['Tell me about the bookstore', "What's Tim's AI experience?"],
    link: { href: 'https://timotholt.com/solid-tree/', text: 'solid-tree live demo' },
  },
  {
    key: 'bookstore',
    pattern: /book ?store|chantel|axum|htmx|\brust\b/i,
    answer: "Tim built Chantel's Corner, a live online bookstore with 30,000 books, end to end with AI coding agents: Rust, Axum, Askama, HTMX and PostgreSQL.",
    followUps: ['Show me a project', "What's Tim's AI experience?"],
    link: { href: 'https://www.chantelscorner.com/', text: "Chantel's Corner" },
  },
  {
    key: 'calgen',
    pattern: /calgen|calibration/i,
    answer: 'Firmware CalGen turns calibration specs into traceable firmware constants with review gates, for a power-electronics scenario. It is a demonstration, not deployed in production hardware.',
    followUps: ['Tell me about the firmware background', 'Show me a project'],
    link: { href: 'https://timotholt.com/firmware-calgen/', text: 'Firmware CalGen demo' },
  },
  {
    key: 'mcp-logger',
    pattern: /mcp[- ]?logger|\bmcp\b|model context protocol/i,
    answer: 'MCP Logger is an MCP server that lets AI coding tools inspect JavaScript logs while they work, so the loop from a runtime error to a fix gets shorter.',
    followUps: ["What's Tim's AI experience?", 'Show me a project'],
    link: { href: 'https://github.com/timotholt/mcp-logger', text: 'MCP Logger on GitHub' },
  },
  {
    key: 'ai',
    pattern: /\b(ai|a\.i\.|llms?|claude|gpt|openai|anthropic|agents?|agentic|machine learning|ml|genai|chatbot)\b/i,
    answer: "Tim has done AI-assisted software development for 3 years, building Chantel's Corner, a live 30,000-book store, end to end with AI coding agents, and MCP Logger, a tool that lets AI coding assistants read runtime logs. Tim is also studying AI Software Engineering at Maestro College (GPA 4.0).",
    followUps: ['Show me a project', 'Why an internship?'],
  },
  {
    key: 'projects',
    pattern: /\b(projects?|portfolio|built|build|repos?|github|demo|show me|case stud\w*)\b/i,
    answer: "Four public projects: solid-tree (SolidJS tree components), Firmware CalGen (spec-to-firmware constants with review gates), Chantel's Corner bookstore (Rust, HTMX, PostgreSQL), and MCP Logger (runtime logs for AI coding tools). Three run live; click any project card on this page to open it.",
    followUps: ['Tell me about solid-tree', 'Tell me about the bookstore'],
    link: { href: '/#projects', text: 'All projects' },
  },
  {
    key: 'firmware',
    pattern: /firmware|\bbios\b|drivers?|assembly|embedded|phoenix|low[- ]level|hardware|fastboot/i,
    answer: 'Tim wrote motherboard BIOS at Phoenix Technologies that shipped in millions of PCs, and invented FastBoot and Save-To-Disk. Then Windows drivers and firmware at Quantum, AMD, Metalithic and Spruce, and DVD firmware for six NUON systems at VM Labs.',
    followUps: ['Why an internship?', 'Tell me about Firmware CalGen'],
  },
  {
    key: 'telecom',
    pattern: /at&t|\bcell\b|cell[- ]site|fiber|\b5g\b|telecom|ventel|tower/i,
    answer: 'As a contractor for AT&T through Ventura Telephone (2023–2025), Tim upgraded 22 cell tower sites across Southern California to Fujitsu flexiHaul 5G fiber-optic transport: SOWs, SFPs, fiber runs and DC power cabling.',
    followUps: ['Why an internship?', 'Walk me through the work history'],
  },
  {
    key: 'production',
    pattern: /\b(film|movie|video|cinematograph\w*|photograph\w*|production|director|av)\b/i,
    answer: 'Tim ran Light Hollywood as a Director of Photography: 11 feature films, 50+ short films, 200+ commercials and 700+ interviews, leading crews of 20–40 contractors, and won Best Cinematography for Days of Reckoning.',
    followUps: ['Why an internship?', "What's Tim's AI experience?"],
  },
  {
    key: 'education',
    pattern: /educat\w*|degree|school|college|universit\w*|stud(y|ying)|\bgpa\b|certif\w*|course\w*|bootcamp|per scholas|maestro/i,
    answer: "Tim is working on an AAS in AI Software Engineering at Maestro College (GPA 4.0, expected December 2027), and finished Per Scholas MERN Full Stack in 2024 (GPA 3.8, 2nd in class, full scholarship), plus a Dubspot music production certificate.",
    followUps: ["What's Tim's AI experience?", 'Show me a project'],
  },
  {
    key: 'awards',
    pattern: /awards?|prize|won|winner|honou?rs?/i,
    answer: "Core Values Award in Software Engineering from Per Scholas (2024), Best Cinematography at the 168 Hour Film Festival (2006), and winner of IGN's PSXPower contest for new game developers (1997).",
    followUps: ['Show me a project', 'Tell me about the firmware background'],
  },
  {
    key: 'skills',
    pattern: /skills?|stack|languages?|typescript|javascript|python|react|node|tech\w*|tools?/i,
    answer: 'TypeScript, JavaScript, Python, Rust, SolidJS, Astro and MCP today; C and x86 assembly from the firmware years; MERN from Per Scholas. Plus 23 years of client management and project coordination.',
    followUps: ['Show me a project', "What's Tim's AI experience?"],
  },
  {
    key: 'work',
    pattern: /experience|work history|jobs?|career|employ\w*|resume|cv|background|years/i,
    answer: 'BIOS and firmware engineering from 1988 to 2001 (Phoenix, Quantum, AMD, VM Labs and more), two decades as a Director of Photography, 5G fiber upgrades for AT&T, and since 2022 software and AI-built products at Egghead Rodeo.',
    followUps: ['Tell me about the firmware background', 'Why an internship?'],
    link: { href: '/#experience', text: 'Work history' },
  },
];

export const fallbackTopic: Topic = {
  key: 'uncategorized',
  pattern: /$^/,
  answer: `Ask about Tim's AI work, projects, firmware background and work history. For anything else, ${reach}.`,
  followUps: ["What's Tim's AI experience?", 'Show me a project'],
};

export function topicFor(text: string): Topic {
  return topics.find(topic => topic.pattern.test(text)) ?? fallbackTopic;
}

/** Fixed replies the Worker sends without calling the model. */
export const declines = {
  salary: `Pay isn't discussed here — that's a conversation for Tim directly at ${contact.email}. Ask about Tim's experience or projects instead.`,
  personal: "This chat sticks to Tim's professional background. Ask about Tim's work, skills or projects.",
  injection: "This chat can't change how it works or share its instructions. Ask about Tim's background, skills or projects.",
} as const;

export const offlineNote = "Live chat is offline right now, so here's a saved answer.";
