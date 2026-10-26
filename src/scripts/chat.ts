// "Ask my AI" panel: streams answers from the chat Worker, and falls back to
// saved answers whenever the Worker is missing, down or refuses.
import { limits, offlineNote, starters, topicFor, topics, type Topic } from '../data/chat';

declare global {
  interface Window {
    turnstile?: {
      render(el: HTMLElement, opts: Record<string, unknown>): string;
      reset(id: string): void;
      execute(id: string): void;
    };
  }
}

type Message = { role: 'user' | 'assistant'; content: string };

/** Models sometimes add markdown despite the prompt; the panel shows plain text, so drop the markup. */
const plain = (text: string) => text
  .replace(/\*\*(.+?)\*\*/g, '$1')
  .replace(/^#{1,6}\s+/gm, '')
  .replace(/^\s*[-*•]\s+/gm, '');
interface Done { topic: string; followUps: string[]; link: Topic['link'] | null; turnsLeft: number }

const dialog = document.querySelector<HTMLDialogElement>('#ask-ai');
if (dialog) setup(dialog);

function setup(dialog: HTMLDialogElement) {
  const chatUrl = dialog.dataset.chatUrl ?? '';
  const siteKey = dialog.dataset.siteKey ?? '';
  const log = dialog.querySelector<HTMLElement>('.chat-log')!;
  const chips = dialog.querySelector<HTMLElement>('.chat-chips')!;
  const toggle = dialog.querySelector<HTMLButtonElement>('.chat-chips-toggle')!;
  const form = dialog.querySelector<HTMLFormElement>('.chat-form')!;
  const input = dialog.querySelector<HTMLTextAreaElement>('#chat-input')!;
  const sendButton = dialog.querySelector<HTMLButtonElement>('.chat-send')!;
  const count = dialog.querySelector<HTMLElement>('.chat-count')!;
  const left = dialog.querySelector<HTMLElement>('.chat-left')!;
  const history: Message[] = [];
  let busy = false;

  document.querySelectorAll<HTMLElement>('[data-open-chat]').forEach(button => button.addEventListener('click', () => {
    if (!dialog.open) dialog.showModal();
    input.focus();
    if (chatUrl && siteKey) loadTurnstile();
  }));
  dialog.querySelector('.chat-close')!.addEventListener('click', () => dialog.close());
  // A click on the backdrop (outside the panel box) closes it.
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });

  toggle.addEventListener('click', () => {
    const hidden = chips.toggleAttribute('hidden');
    toggle.textContent = hidden ? 'Show suggestions' : 'Hide suggestions';
    toggle.setAttribute('aria-expanded', String(!hidden));
  });
  chips.addEventListener('click', event => {
    const chip = (event.target as HTMLElement).closest<HTMLButtonElement>('.chat-chip');
    if (chip) void ask(chip.textContent ?? '');
  });
  input.addEventListener('input', () => { count.textContent = `${input.value.length}/${limits.maxChars}`; });
  input.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); form.requestSubmit(); }
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const question = input.value.trim();
    if (!question) return;
    input.value = '';
    count.textContent = `0/${limits.maxChars}`;
    void ask(question);
  });

  function setChips(questions: readonly string[]) {
    chips.replaceChildren(...questions.map(question => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chat-chip';
      chip.textContent = question;
      return chip;
    }));
  }

  function bubble(role: 'user' | 'ai', text = ''): HTMLParagraphElement {
    const p = document.createElement('p');
    p.className = `chat-msg chat-msg-${role}`;
    p.textContent = text; // never HTML: model text cannot inject markup
    log.append(p);
    log.scrollTop = log.scrollHeight;
    return p;
  }

  function note(text: string) {
    const p = document.createElement('p');
    p.className = 'chat-note';
    p.textContent = text;
    log.append(p);
  }

  function addLink(link: Topic['link'] | null | undefined) {
    if (!link) return;
    const a = document.createElement('a');
    a.className = 'chat-link';
    a.href = link.href;
    a.textContent = `${link.text} ↗`;
    if (/^https?:/.test(link.href)) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
    log.append(a);
  }

  function turnsLeft(): number {
    return limits.maxTurns - history.filter(m => m.role === 'user').length;
  }

  function setBusy(value: boolean) {
    busy = value;
    sendButton.disabled = value || turnsLeft() <= 0;
    dialog.toggleAttribute('data-busy', value);
  }

  function finish(question: string, answer: string, topic: Topic | Done) {
    history.push({ role: 'user', content: question }, { role: 'assistant', content: answer });
    addLink(topic.link);
    const remaining = turnsLeft();
    left.textContent = remaining > 0 ? `${remaining} question${remaining === 1 ? '' : 's'} left` : 'Question limit reached — email Tim for more';
    if (remaining <= 0) { input.disabled = true; setChips([]); }
    else setChips(topic.followUps.length ? topic.followUps : starters);
    log.scrollTop = log.scrollHeight;
  }

  function offline(question: string, reply: HTMLParagraphElement, topic: Topic = topicFor(question)) {
    note(offlineNote);
    log.append(reply); // keep the note above the answer
    reply.textContent = topic.answer;
    finish(question, topic.answer, topic);
  }

  async function ask(question: string) {
    question = question.trim().slice(0, limits.maxChars);
    if (busy || !question || turnsLeft() <= 0) return;
    setBusy(true);
    const asked = bubble('user', question);
    const reply = bubble('ai');
    reply.classList.add('is-pending');
    try {
      if (!chatUrl) return offline(question, reply);
      const result = await stream(question, reply);
      if (result === 'error') asked.remove();
      if (result === 'fallback') offline(question, reply, reply.dataset.topic ? topics.find(t => t.key === reply.dataset.topic) : undefined);
    } finally {
      reply.classList.remove('is-pending');
      setBusy(false);
    }
  }

  async function stream(question: string, reply: HTMLParagraphElement): Promise<'ok' | 'fallback' | 'error'> {
    let res: Response;
    try {
      const turnstileToken = siteKey ? await getTurnstileToken() : 'none';
      res = await fetch(chatUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ turnstileToken, messages: [...history, { role: 'user', content: question }] }),
        signal: AbortSignal.timeout(25_000),
      });
    } catch {
      return 'fallback';
    }
    if (!res.ok || !res.body) {
      if (res.status >= 500 || !res.body) return 'fallback';
      const message = await res.json().then((data: { error?: string }) => data.error).catch(() => undefined);
      reply.remove();
      note(message ?? 'Something went wrong. Try again.');
      return 'error';
    }

    let text = '';
    let done: Done | null = null;
    let failed = false;
    const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
    let buffer = '';
    try {
      for (;;) {
        const { value, done: ended } = await reader.read();
        if (ended) break;
        buffer += value;
        let cut: number;
        while ((cut = buffer.indexOf('\n\n')) >= 0) {
          const block = buffer.slice(0, cut);
          buffer = buffer.slice(cut + 2);
          const event = /^event: (.+)$/m.exec(block)?.[1];
          const data = JSON.parse(/^data: (.+)$/m.exec(block)?.[1] ?? '{}');
          if (event === 'delta') { text += data.text; reply.textContent = plain(text); reply.classList.remove('is-pending'); log.scrollTop = log.scrollHeight; }
          if (event === 'replace') { text = data.text; reply.textContent = text; }
          if (event === 'done') done = data;
          if (event === 'error') { failed = true; reply.dataset.topic = data.topic; }
        }
      }
    } catch {
      failed = true;
    }
    if (failed || !done || !text) {
      reply.textContent = '';
      return 'fallback';
    }
    text = plain(text);
    reply.textContent = text;
    finish(question, text, done);
    return 'ok';
  }

  // Turnstile: loaded on first open, invisible, one fresh token per message.
  let widgetId: string | null = null;
  let pending: ((token: string) => void) | null = null;
  let turnstileReady: Promise<void> | null = null;

  function loadTurnstile(): Promise<void> {
    turnstileReady ??= new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.onload = () => {
        widgetId = window.turnstile!.render(dialog.querySelector<HTMLElement>('.chat-turnstile')!, {
          sitekey: siteKey,
          execution: 'execute',
          appearance: 'interaction-only',
          callback: (token: string) => { pending?.(token); pending = null; },
        });
        resolve();
      };
      script.onerror = () => reject(new Error('Turnstile failed to load'));
      document.head.append(script);
    });
    return turnstileReady;
  }

  async function getTurnstileToken(): Promise<string> {
    await loadTurnstile();
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Bot check timed out')), 15_000);
      pending = token => { clearTimeout(timer); resolve(token); };
      window.turnstile!.reset(widgetId!);
      window.turnstile!.execute(widgetId!);
    });
  }

}
