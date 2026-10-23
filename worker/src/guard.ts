import { declines } from '../../src/data/chat';

export type GuardReason = keyof typeof declines;

// Cheap checks before any model call. Patterns lean narrow: a miss still goes to
// the model, which has the same rules; a false hit wrongly refuses a recruiter.
const patterns: Record<GuardReason, RegExp[]> = {
  injection: [
    /\b(ignore|disregard|forget|override|bypass)\b.{0,40}\b(instructions?|rules|prompts?|guidelines|directions|above|previous|prior)\b/i,
    /\b(system|hidden|initial|original)\s+(prompt|message|instructions?)\b/i,
    /\b(reveal|show|print|repeat|output|dump|leak)\b.{0,30}\b(your|the)\s+(instructions?|rules|prompt|persona|context|configuration)\b/i,
    /\b(you are now|from now on,? you|new instructions|developer mode|jailbreak|do anything now|\bDAN\b)/i,
    /\b(pretend|role-?play|act as|simulate)\b.{0,30}\b(you are|you're|to be|an? (different|new|unfiltered|evil|other)|dan)\b/i,
    /<\/?(system|instructions?|prompt)>|\[(system|inst)\]/i,
    /[A-Za-z0-9+/]{40,}={0,2}/, // long base64-looking payloads
  ],
  salary: [
    /\b(salary|salaries|compensation|wages?|income|paycheck|equity|stock options|bonus)\b/i,
    /\b(pay|rate|comp)\s*(range|expectations?|requirements?|band)\b/i,
    /\b(hourly|daily|day) rate\b/i,
    /\bhow much\b.{0,30}\b(make|earn|charge|cost|paid|pay|want|ask)\b/i,
    /\b(expected|desired|current|previous)\s+(pay|rate|salary)\b/i,
    /\$\s?\d/,
  ],
  personal: [
    /\b(how old|age|birthday|date of birth|born in|year (were you|was he) born)\b/i,
    /\b(married|wife|husband|spouse|girlfriend|boyfriend|kids|children|divorced)\b/i,
    /\b(religio\w*|church|ethnic\w*|race|gender|sexual\w*|politic\w*|vote|voted)\b/i,
    /\b(health|medical|disabilit\w*|illness|diagnos\w*)\b/i,
    /\b(home|street|mailing) address\b|\bwhere (does|do) (he|tim|you) live\b/i,
    /\b(ssn|social security|criminal|arrest\w*|convict\w*|visa status|citizenship)\b/i,
  ],
};

export function guard(text: string): GuardReason | null {
  for (const reason of Object.keys(patterns) as GuardReason[]) {
    if (patterns[reason].some(p => p.test(text))) return reason;
  }
  return null;
}
