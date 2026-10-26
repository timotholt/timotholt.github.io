import { contact } from '../../src/data/contact';
import { personaText } from './prompt';

// The site speaks about Tim in third person; first person means the model slipped.
const firstPerson = /\bI('m|'ve|'d|'ll)?\b|\b(my|me|mine|myself)\b/i;
const hype = /\b(rock ?star|ninja|guru|wizard|10x|world[- ]class|genius|unicorn|visionary|legendary|best in the (world|industry))\b/i;
const allowedLinks = ['timotholt.com', 'timotholt.github.io', 'github.com/timotholt', 'linkedin.com/in/timotholt', 'chantelscorner.com'];
const digitsOnly = (s: string) => s.replace(/\D/g, '');
const normalizeNumber = (s: string) => s.replace(/,/g, '').replace(/\.$/, '');
const personaNumbers = new Set((personaText.match(/\d[\d,.]*/g) ?? []).map(normalizeNumber));

/** Problems with a finished model answer; empty means it may stand. */
export function checkAnswer(text: string): string[] {
  const problems: string[] = [];
  if (hype.test(text)) problems.push('hype word');
  if (firstPerson.test(text)) problems.push('first person');
  if (text.trim().split(/\s+/).length > 160) problems.push('too long');
  for (const email of text.match(/[\w.+-]+@[\w-]+(\.[\w-]+)+/g) ?? []) {
    if (email.toLowerCase() !== contact.email) problems.push(`email ${email}`);
  }
  const phones = text.match(/\(?\d{3}\)?[\s.-]?\d{3}[\s.-]\d{4}/g) ?? [];
  for (const phone of phones) {
    if (digitsOnly(phone) !== digitsOnly(contact.phoneHref).slice(1)) problems.push(`phone ${phone}`);
  }
  const withoutContacts = phones.reduce((rest, phone) => rest.replace(phone, ' '), text);
  for (const link of withoutContacts.match(/\b(https?:\/\/)?([\w-]+\.)+(com|net|org|io|dev|ai|co|app)\b(\/[^\s,)]*)?/gi) ?? []) {
    const bare = link.replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/[.!?;:]+$/, '').toLowerCase();
    if (bare.includes('@') || text.includes(`@${bare}`)) continue;
    if (!allowedLinks.some(ok => bare === ok || bare.startsWith(`${ok}/`))) problems.push(`link ${link}`);
  }
  for (const raw of withoutContacts.replace(/[\w.+-]+@[\w.-]+/g, ' ').match(/\d[\d,.]*/g) ?? []) {
    const number = normalizeNumber(raw);
    if (!personaNumbers.has(number)) problems.push(`number ${raw}`);
  }
  return problems;
}
