import { limits } from '../../src/data/chat';

export const allowedOrigins = ['https://timotholt.com', 'https://www.timotholt.com', 'https://timotholt.github.io'];
const devOrigin = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

export function originAllowed(origin: string | null, env: { ENV?: string }): origin is string {
  if (!origin) return false;
  return allowedOrigins.includes(origin) || (env.ENV === 'dev' && devOrigin.test(origin));
}

export function corsHeaders(origin: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

export function json(status: number, body: unknown, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...headers } });
}

// 30 questions of 500 chars plus 29 answers of up to 2,000 chars, with JSON overhead.
export const MAX_BODY_BYTES = 96_000;
const MAX_ASSISTANT_CHARS = 2_000;

export interface ChatMessage { role: 'user' | 'assistant'; content: string }
export interface ChatRequest { messages: ChatMessage[]; turnstileToken: string }

/** Validates the request body; returns a friendly error message or the parsed request. */
export function parseChat(body: unknown): ChatRequest | string {
  if (!body || typeof body !== 'object') return 'Bad request.';
  const { messages, turnstileToken } = body as Record<string, unknown>;
  if (typeof turnstileToken !== 'string' || !turnstileToken) return 'Missing bot check. Reload the page and try again.';
  if (!Array.isArray(messages) || messages.length === 0) return 'Ask a question first.';
  const clean: ChatMessage[] = [];
  for (const [i, m] of messages.entries()) {
    const role = i % 2 === 0 ? 'user' : 'assistant';
    if (!m || typeof m !== 'object' || m.role !== role || typeof m.content !== 'string') return 'Bad conversation format.';
    const content = m.content.trim();
    if (!content) return 'Messages cannot be empty.';
    if (role === 'user' && content.length > limits.maxChars) return `Keep questions under ${limits.maxChars} characters.`;
    if (role === 'assistant' && content.length > MAX_ASSISTANT_CHARS) return 'Bad conversation format.';
    clean.push({ role, content });
  }
  if (clean.at(-1)!.role !== 'user') return 'Bad conversation format.';
  const turns = clean.filter(m => m.role === 'user').length;
  if (turns > limits.maxTurns) return `That's the ${limits.maxTurns}-question limit for one chat. Email Tim for more.`;
  return { messages: clean, turnstileToken };
}

export function sseEvent(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}
