// "Ask my AI" shared data: used by the site (starters, offline fallback) and
// bundled into the Worker (topic tagging, follow-ups, canned declines).
// Keep it free of browser and Worker APIs.
import { contact } from './contact';

export const limits = { maxTurns: 10, maxChars: 500 } as const;

export const unknownPhrase = `That's not something I know — email Tim at ${contact.email}.`;

export const starters = [
  "What's Tim's AI experience?",
  'Why Forward Deployed Engineering?',
  'Show me a project',
  'How do I reach Tim?',
] as const;

export interface Topic {
  key: string;
  pattern: RegExp;
  /** Offline answer, first person, facts from the live site only. */
  answer: string;
  followUps: string[];
  link?: { href: string; text: string };
}

const reach = `email ${contact.email}, call ${contact.phone}, or find me on LinkedIn at ${contact.linkedin}`;

// First match wins: specific topics before general ones.
export const topics: Topic[] = [
  {
    key: 'contact',
    pattern: /\b(contact|reach|e-?mail|phone|call|linkedin|get in touch)\b/i,
    answer: `The best way to reach me: ${reach}.`,
    followUps: ['Show me a project', "What's Tim's AI experience?"],
  },
  {
    key: 'availability',
    pattern: /\b(availab\w*|remote|relocat\w*|hybrid|on-?site|start date|full[- ]time|part[- ]time|contract\w*|open to|notice)\b/i,
    answer: `I'm looking for AI engineering, Forward Deployed Engineering, or firmware roles. I'm open to remote, hybrid or on-site work, and to some relocation; I'm based in ${contact.location}. For start date and other details, ${reach}.`,
    followUps: ['Why Forward Deployed Engineering?', 'How do I reach Tim?'],
  },
  {
    key: 'fde',
    pattern: /forward[- ]deployed|\bfde\b|customer[- ]facing|field engineer|solutions engineer/i,
    answer: "I build software with AI coding agents every day, and the hard part is never the model. It's fitting it to a real customer's mess. That's the job I want: sitting with the customer, building with AI, and owning the result.",
    followUps: ["What's Tim's AI experience?", 'Tell me about the cell-site work'],
  },
  {
    key: 'solid-tree',
    pattern: /solid[- ]?tree|solidjs|tanstack|virtuali[sz]ed/i,
    answer: 'solid-tree is a library of four SolidJS tree components: a basic tree, a virtualized tree for huge datasets, a bring-your-own-database tree, and a Supabase tree with automatic multi-user leaf locking.',
    followUps: ['Tell me about the bookstore', "What's Tim's AI experience?"],
    link: { href: '/projects/solid-tree/', text: 'solid-tree case study' },
  },
  {
    key: 'bookstore',
    pattern: /book ?store|chantel|axum|htmx|\brust\b/i,
    answer: "I built Chantel's Corner, a live online bookstore with 30,000 books, end to end with AI coding agents: Rust, Axum, Askama, HTMX and PostgreSQL.",
    followUps: ['Show me a project', "What's Tim's AI experience?"],
    link: { href: '/projects/bookstore/', text: 'Bookstore case study' },
  },
  {
    key: 'calgen',
    pattern: /calgen|calibration/i,
    answer: 'Firmware CalGen turns calibration specs into traceable firmware constants with review gates, for a power-electronics scenario. It is a demonstration, not deployed in production hardware.',
    followUps: ['Tell me about the firmware background', 'Show me a project'],
    link: { href: '/projects/firmware-calgen/', text: 'Firmware CalGen case study' },
  },
  {
    key: 'mcp-logger',
    pattern: /mcp[- ]?logger|\bmcp\b|model context protocol/i,
    answer: 'MCP Logger is an MCP server that lets AI coding tools inspect JavaScript logs while they work, so the loop from a runtime error to a fix gets shorter.',
    followUps: ["What's Tim's AI experience?", 'Show me a project'],
    link: { href: '/projects/mcp-logger/', text: 'MCP Logger case study' },
  },
  {
    key: 'ai',
    pattern: /\b(ai|a\.i\.|llms?|claude|gpt|openai|anthropic|agents?|agentic|machine learning|ml|genai|chatbot)\b/i,
    answer: "I've done AI-assisted software development for 3 years. I built Chantel's Corner, a live 30,000-book store, end to end with AI coding agents, and MCP Logger, a tool that lets AI coding assistants read runtime logs. I'm also studying AI Software Engineering at Maestro College (GPA 4.0).",
    followUps: ['Show me a project', 'Why Forward Deployed Engineering?'],
  },
  {
    key: 'projects',
    pattern: /\b(projects?|portfolio|built|build|repos?|github|demo|show me|case stud\w*)\b/i,
    answer: "Four public projects: solid-tree (SolidJS tree components), Firmware CalGen (spec-to-firmware constants with review gates), Chantel's Corner bookstore (Rust, HTMX, PostgreSQL), and MCP Logger (runtime logs for AI coding tools). Each has a case study on this site.",
    followUps: ['Tell me about solid-tree', 'Tell me about the bookstore'],
    link: { href: '/#projects', text: 'All projects' },
  },
  {
    key: 'firmware',
    pattern: /firmware|\bbios\b|drivers?|assembly|embedded|phoenix|low[- ]level|hardware|fastboot/i,
    answer: 'I wrote motherboard BIOS at Phoenix Technologies that shipped in millions of PCs, and invented FastBoot and Save-To-Disk. Then Windows drivers and firmware at Quantum, AMD, Metalithic and Spruce, and DVD firmware for six NUON systems at VM Labs.',
    followUps: ['Why Forward Deployed Engineering?', 'Tell me about Firmware CalGen'],
  },
  {
    key: 'telecom',
    pattern: /at&t|\bcell\b|cell[- ]site|fiber|\b5g\b|telecom|ventel|tower/i,
    answer: 'As a contractor for AT&T through Ventura Telephone (2023–2025), I upgraded 22 cell tower sites across Southern California to Fujitsu flexiHaul 5G fiber-optic transport: SOWs, SFPs, fiber runs and DC power cabling.',
    followUps: ['Why Forward Deployed Engineering?', 'Walk me through the work history'],
  },
  {
    key: 'production',
    pattern: /\b(film|movie|video|cinematograph\w*|photograph\w*|production|director|av)\b/i,
    answer: 'I ran Light Hollywood as a Director of Photography: 11 feature films, 50+ short films, 200+ commercials and 700+ interviews, leading crews of 20–40 contractors. I won Best Cinematography for Days of Reckoning.',
    followUps: ['Why Forward Deployed Engineering?', "What's Tim's AI experience?"],
  },
  {
    key: 'education',
    pattern: /educat\w*|degree|school|college|universit\w*|stud(y|ying)|\bgpa\b|certif\w*|course\w*|bootcamp|per scholas|maestro/i,
    answer: "I'm working on an AAS in AI Software Engineering at Maestro College (GPA 4.0, expected December 2027). I finished Per Scholas MERN Full Stack in 2024 (GPA 3.8, 2nd in class, full scholarship), plus a Dubspot music production certificate.",
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
    answer: 'TypeScript, JavaScript, Python, Rust, SolidJS, Astro and MCP today; C and x86 assembly from my firmware years; MERN from Per Scholas. Plus 23 years of client management and project coordination.',
    followUps: ['Show me a project', "What's Tim's AI experience?"],
  },
  {
    key: 'work',
    pattern: /experience|work history|jobs?|career|employ\w*|resume|cv|background|years/i,
    answer: 'BIOS and firmware engineering from 1988 to 2001 (Phoenix, Quantum, AMD, VM Labs and more), two decades as a Director of Photography, 5G fiber upgrades for AT&T, and since 2022 software and AI-built products at Egghead Rodeo.',
    followUps: ['Tell me about the firmware background', 'Why Forward Deployed Engineering?'],
    link: { href: '/#experience', text: 'Work history' },
  },
];

export const fallbackTopic: Topic = {
  key: 'uncategorized',
  pattern: /$^/,
  answer: `I can tell you about my AI work, projects, firmware background and work history. For anything else, ${reach}.`,
  followUps: ["What's Tim's AI experience?", 'Show me a project'],
};

export function topicFor(text: string): Topic {
  return topics.find(topic => topic.pattern.test(text)) ?? fallbackTopic;
}

/** Fixed replies the Worker sends without calling the model. */
export const declines = {
  salary: `I don't discuss pay here — that's a conversation for Tim directly at ${contact.email}. Happy to talk about my experience or projects.`,
  personal: "I keep to my professional background. Ask me about my work, skills or projects.",
  injection: "I can't change how I work or share my instructions. Ask me about my background, skills or projects.",
} as const;

export const offlineNote = "Live chat is offline right now, so here's a saved answer.";
