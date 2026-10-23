import Anthropic from '@anthropic-ai/sdk';
import { declines, limits, topicFor, unknownPhrase, type Topic } from '../../src/data/chat';
import { checkAnswer } from './checks';
import { guard } from './guard';
import { corsHeaders, json, MAX_BODY_BYTES, originAllowed, parseChat, sseEvent, type ChatMessage } from './http';
import { logChat, type Outcome } from './log';
import { modelParams } from './prompt';

export interface Env {
  ANTHROPIC_API_KEY: string;
  TURNSTILE_SECRET: string;
  ENV?: string;
  RATE_LIMITER?: RateLimit;
  CHAT_LOG?: AnalyticsEngineDataset;
}

export type ModelEvent = { type: 'text'; text: string } | { type: 'stop'; reason: string | null };
export type Model = (params: Anthropic.MessageStreamParams, env: Env) => AsyncIterable<ModelEvent>;

export interface Deps {
  model: Model;
  /** Used for Turnstile verification; injectable for tests. */
  fetch: typeof fetch;
}

async function* anthropicModel(params: Anthropic.MessageStreamParams, env: Env): AsyncIterable<ModelEvent> {
  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY, maxRetries: 1, timeout: 20_000 });
  let reason: string | null = null;
  for await (const event of client.messages.stream(params)) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') yield { type: 'text', text: event.delta.text };
    if (event.type === 'message_delta') reason = event.delta.stop_reason;
  }
  yield { type: 'stop', reason };
}

const TURNSTILE_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

async function turnstileOk(deps: Deps, env: Env, token: string, ip: string | null): Promise<boolean> {
  const form = new FormData();
  form.append('secret', env.TURNSTILE_SECRET);
  form.append('response', token);
  if (ip) form.append('remoteip', ip);
  try {
    const res = await deps.fetch(TURNSTILE_URL, { method: 'POST', body: form });
    const result = await res.json() as { success?: boolean };
    return result.success === true;
  } catch {
    return false;
  }
}

/** Streams one reply as SSE: `delta`* then optional `replace`, then `done` (or `error`). */
function streamReply(run: (send: (event: string, data: unknown) => void) => Promise<void>, headers: Record<string, string>): Response {
  const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();
  const send = (event: string, data: unknown) => { void writer.write(encoder.encode(sseEvent(event, data))); };
  void run(send).finally(() => writer.close());
  return new Response(readable, {
    headers: { ...headers, 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

export function createHandler(overrides: Partial<Deps> = {}) {
  const deps: Deps = { model: anthropicModel, fetch: (...args) => fetch(...args), ...overrides };

  return {
    async fetch(request: Request, env: Env): Promise<Response> {
      const url = new URL(request.url);
      const origin = request.headers.get('Origin');
      if (url.pathname !== '/chat') return json(404, { error: 'Not found.' });
      if (!originAllowed(origin, env)) return json(403, { error: 'Origin not allowed.' });
      const cors = corsHeaders(origin);
      if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
      if (request.method !== 'POST') return json(405, { error: 'Use POST.' }, cors);

      const raw = await request.text();
      if (raw.length > MAX_BODY_BYTES) return json(413, { error: 'Conversation too long.' }, cors);
      let body: unknown;
      try { body = JSON.parse(raw); } catch { return json(400, { error: 'Bad request.' }, cors); }
      const chat = parseChat(body);
      if (typeof chat === 'string') return json(400, { error: chat }, cors);

      const ip = request.headers.get('CF-Connecting-IP');
      if (env.RATE_LIMITER) {
        const { success } = await env.RATE_LIMITER.limit({ key: ip ?? 'unknown' });
        if (!success) return json(429, { error: 'Too many questions at once. Wait a minute and try again.' }, cors);
      }
      if (!(await turnstileOk(deps, env, chat.turnstileToken, ip))) {
        return json(403, { error: 'Bot check failed. Reload the page and try again.' }, cors);
      }

      const question = chat.messages.at(-1)!.content;
      const turn = chat.messages.filter(m => m.role === 'user').length;
      const topic = topicFor(question);
      const done = (outcome: Outcome) => {
        logChat(env.CHAT_LOG, { topic: topic.key, outcome, turn, question });
        return { topic: topic.key, followUps: topic.followUps, link: topic.link ?? null, turnsLeft: limits.maxTurns - turn };
      };

      const blocked = guard(question);
      if (blocked) {
        return streamReply(async send => {
          send('delta', { text: declines[blocked] });
          send('done', done(blocked === 'injection' ? 'blocked' : 'declined'));
        }, cors);
      }

      return streamReply(send => answer(deps, env, chat.messages, topic, send, done), cors);
    },
  };
}

async function answer(
  deps: Deps, env: Env, messages: ChatMessage[], topic: Topic,
  send: (event: string, data: unknown) => void, done: (outcome: Outcome) => unknown,
): Promise<void> {
  let text = '';
  let stop: string | null = null;
  try {
    for await (const event of deps.model(modelParams(messages.slice(-(limits.maxTurns * 2 - 1))), env)) {
      if (event.type === 'text') { text += event.text; send('delta', { text: event.text }); }
      else stop = event.reason;
    }
  } catch {
    send('error', { message: 'The AI is unavailable right now.', fallback: true, ...(done('fallback') as object) });
    return;
  }
  const problems = stop === 'refusal' || !text.trim() ? ['refusal'] : checkAnswer(text);
  if (problems.length) {
    send('replace', { text: topic.answer });
    send('done', done('replaced'));
    return;
  }
  send('done', done(text.includes(unknownPhrase.slice(0, 30)) ? 'unknown' : 'answered'));
}

export default createHandler();
