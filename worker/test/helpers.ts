import type Anthropic from '@anthropic-ai/sdk';
import { createHandler, type Env, type ModelEvent } from '../src/index';

export const ORIGIN = 'https://timotholt.com';

export interface Harness {
  handler: ReturnType<typeof createHandler>;
  modelCalls: Anthropic.MessageStreamParams[];
  turnstileCalls: number;
  logged: AnalyticsEngineDataPoint[];
  env: Env;
}

/** Worker with a scripted model, a scripted Turnstile verdict and an in-memory log. */
export function harness(opts: { reply?: string | Error; stop?: string; turnstile?: boolean; rateOk?: boolean; env?: Partial<Env> } = {}): Harness {
  const h = { modelCalls: [], turnstileCalls: 0, logged: [] } as unknown as Harness;
  h.handler = createHandler({
    async *model(params) {
      h.modelCalls.push(params);
      if (opts.reply instanceof Error) throw opts.reply;
      const text = opts.reply ?? 'Tim built solid-tree.';
      for (const chunk of text.match(/.{1,12}/gs) ?? []) yield { type: 'text', text: chunk } satisfies ModelEvent;
      yield { type: 'stop', reason: opts.stop ?? 'end_turn' };
    },
    fetch: async () => {
      h.turnstileCalls++;
      return Response.json({ success: opts.turnstile ?? true });
    },
  });
  h.env = {
    ANTHROPIC_API_KEY: 'test',
    TURNSTILE_SECRET: 'test',
    ENV: 'production',
    RATE_LIMITER: { limit: async () => ({ success: opts.rateOk ?? true }) } as unknown as RateLimit,
    CHAT_LOG: { writeDataPoint: (p?: AnalyticsEngineDataPoint) => { if (p) h.logged.push(p); } },
    ...opts.env,
  };
  return h;
}

export function chatRequest(body: unknown, origin: string | null = ORIGIN, method = 'POST'): Request {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', 'CF-Connecting-IP': '203.0.113.7' };
  if (origin) headers.Origin = origin;
  return new Request('https://chat.example.workers.dev/chat', { method, headers, body: method === 'POST' ? JSON.stringify(body) : undefined });
}

export const ask = (...questions: string[]) => ({
  turnstileToken: 'tok',
  messages: questions.flatMap((q, i) => i < questions.length - 1 ? [{ role: 'user', content: q }, { role: 'assistant', content: 'Sure.' }] : [{ role: 'user', content: q }]),
});

export interface Reply { status: number; text: string; replaced: string | null; done: Record<string, unknown> | null; error: Record<string, unknown> | null }

/** Reads an SSE reply into the text a visitor would end up seeing. */
export async function readReply(res: Response): Promise<Reply> {
  const reply: Reply = { status: res.status, text: '', replaced: null, done: null, error: null };
  if (!res.headers.get('Content-Type')?.startsWith('text/event-stream')) return reply;
  for (const block of (await res.text()).split('\n\n').filter(Boolean)) {
    const event = block.match(/^event: (.+)$/m)![1];
    const data = JSON.parse(block.match(/^data: (.+)$/m)![1]);
    if (event === 'delta') reply.text += data.text;
    if (event === 'replace') reply.text = reply.replaced = data.text;
    if (event === 'done') reply.done = data;
    if (event === 'error') reply.error = data;
  }
  return reply;
}

export async function send(h: Harness, body: unknown, origin?: string | null): Promise<Reply> {
  return readReply(await h.handler.fetch(chatRequest(body, origin), h.env));
}
