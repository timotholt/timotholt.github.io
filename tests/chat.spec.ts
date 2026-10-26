import { test, expect, type Page, type Route } from '@playwright/test';
import { limits, offlineNote, topics } from '../src/data/chat';

const CHAT = 'https://chat.test/chat';
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
const sse = (events: [string, unknown][]) => events.map(([event, data]) => `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`).join('');
const done = (topic: string, turnsLeft: number) => {
  const t = topics.find(x => x.key === topic)!;
  return { topic, followUps: t.followUps, link: t.link ?? null, turnsLeft };
};

/** Fakes the Worker; `reply` decides each response from the parsed request body. */
async function fakeWorker(page: Page, reply: (body: { messages: { role: string; content: string }[]; turnstileToken: string }) => { status?: number; body: string; type?: string }) {
  const bodies: unknown[] = [];
  await page.route(CHAT, async (route: Route) => {
    if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors });
    const body = route.request().postDataJSON();
    bodies.push(body);
    const r = reply(body);
    await route.fulfill({ status: r.status ?? 200, headers: { ...cors, 'Content-Type': r.type ?? 'text/event-stream' }, body: r.body });
  });
  return bodies;
}

async function openChat(page: Page) {
  await page.goto('/');
  await page.locator('.hero [data-open-chat]').click();
  await expect(page.locator('#ask-ai')).toBeVisible();
}

test('hero button opens the labelled chat panel; Escape closes it', async ({ page }) => {
  await openChat(page);
  const panel = page.locator('#ask-ai');
  // The panel must always disclose that answers are AI-generated and may be imperfect.
  await expect(panel).toContainText(/AI-generated.*may be imperfect/);
  await expect(panel).toContainText('logged anonymously');
  await expect(panel.locator('.chat-chip')).toHaveCount(4);
  await expect(page.locator('#chat-input')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(panel).toBeHidden();
  await expect(page.locator('.hero [data-open-chat]')).toBeFocused();
});

test('streams an answer, then shows follow-up chips, a case-study link and the turn count', async ({ page }) => {
  const bodies = await fakeWorker(page, () => ({ body: sse([['delta', { text: 'Tim built ' }], ['delta', { text: 'solid-tree.' }], ['done', done('solid-tree', limits.maxTurns - 1)]]) }));
  await openChat(page);
  await page.locator('.chat-chip', { hasText: 'Show me a project' }).click();
  await expect(page.locator('.chat-msg-ai').last()).toHaveText('Tim built solid-tree.');
  await expect(page.locator('.chat-chip')).toHaveText(topics.find(t => t.key === 'solid-tree')!.followUps);
  await expect(page.locator('.chat-link')).toHaveAttribute('href', 'https://timotholt.com/solid-tree/');
  await expect(page.locator('.chat-left')).toHaveText(`${limits.maxTurns - 1} questions left`);
  expect(bodies[0]).toMatchObject({ messages: [{ role: 'user', content: 'Show me a project' }] });

  await page.locator('#chat-input').fill('And the bookstore?');
  await page.keyboard.press('Enter');
  await expect(page.locator('.chat-msg-ai')).toHaveCount(3);
  expect((bodies[1] as { messages: unknown[] }).messages).toEqual([
    { role: 'user', content: 'Show me a project' },
    { role: 'assistant', content: 'Tim built solid-tree.' },
    { role: 'user', content: 'And the bookstore?' },
  ]);
});

test('a replace event swaps the streamed text for the checked answer', async ({ page }) => {
  await fakeWorker(page, () => ({ body: sse([['delta', { text: 'I am a 10x rockstar.' }], ['replace', { text: 'Saved answer.' }], ['done', done('ai', 9)]]) }));
  await openChat(page);
  await page.locator('.chat-chip').first().click();
  await expect(page.locator('.chat-msg-ai').last()).toHaveText('Saved answer.');
});

test('when the Worker is down, the panel answers from saved answers', async ({ page }) => {
  await page.route(CHAT, route => route.abort('connectionrefused'));
  await openChat(page);
  await page.locator('.chat-chip', { hasText: 'How do I reach Tim?' }).click();
  await expect(page.locator('.chat-note')).toHaveText(offlineNote);
  await expect(page.locator('.chat-msg-ai').last()).toHaveText(topics.find(t => t.key === 'contact')!.answer);
  await expect(page.locator('.chat-msg-ai').last()).toContainText('timotholt@gmail.com');
});

test('a model error event also falls back to the saved answer for its topic', async ({ page }) => {
  await fakeWorker(page, () => ({ body: sse([['error', { message: 'down', fallback: true, ...done('bookstore', 9) }]]) }));
  await openChat(page);
  await page.locator('#chat-input').fill('Tell me about the bookstore');
  await page.locator('.chat-send').click();
  await expect(page.locator('.chat-msg-ai').last()).toHaveText(topics.find(t => t.key === 'bookstore')!.answer);
});

test('a refused request shows the reason and does not use up a question', async ({ page }) => {
  await fakeWorker(page, () => ({ status: 429, type: 'application/json', body: JSON.stringify({ error: 'Too many questions at once. Wait a minute and try again.' }) }));
  await openChat(page);
  await page.locator('.chat-chip').first().click();
  await expect(page.locator('.chat-note')).toHaveText('Too many questions at once. Wait a minute and try again.');
  await expect(page.locator('.chat-msg-user')).toHaveCount(0);
  await expect(page.locator('.chat-left')).toHaveText(`${limits.maxTurns} questions left`);
});

test('model text is shown as text, never as HTML', async ({ page }) => {
  await fakeWorker(page, () => ({ body: sse([['delta', { text: '<img src=x onerror="window.hacked=1">' }], ['done', done('ai', 9)]]) }));
  await openChat(page);
  await page.locator('.chat-chip').first().click();
  await expect(page.locator('.chat-msg-ai').last()).toHaveText('<img src=x onerror="window.hacked=1">');
  expect(await page.evaluate(() => (window as { hacked?: number }).hacked)).toBeUndefined();
  // The header avatar is ours; nothing in the conversation may become an element.
  await expect(page.locator('#ask-ai .chat-log img')).toHaveCount(0);
});

// Chips used to sit in one sideways-scrolling row, which clipped them mid-word; Tim called that sloppy, so they wrap.
test('phone: panel fills the screen, every chip is fully visible, and chips can be hidden', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await openChat(page);
  const box = (await page.locator('#ask-ai').boundingBox())!;
  expect(box.x).toBe(0);
  expect(box.width).toBe(375);
  expect(Math.round(box.height)).toBe(812);
  const clipped = await page.locator('.chat-chip').evaluateAll(chips => chips.filter(c => { const r = c.getBoundingClientRect(); return r.left < 0 || r.right > 375 || c.scrollWidth > c.clientWidth + 1; }).length);
  expect(clipped).toBe(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
  await expect(page.locator('#chat-input')).toBeInViewport();
  await page.locator('.chat-chips-toggle').click();
  await expect(page.locator('.chat-chips')).toBeHidden();
  await expect(page.locator('.chat-chips-toggle')).toHaveAttribute('aria-expanded', 'false');
  await page.locator('.chat-chips-toggle').click();
  await expect(page.locator('.chat-chip').first()).toBeVisible();
});

test('laptop: panel docks bottom-right inside the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openChat(page);
  const box = (await page.locator('#ask-ai').boundingBox())!;
  // Clear of the progress rail on the right edge.
  const rail = (await page.locator('.progress-rail').boundingBox())!;
  expect(box.x + box.width).toBeLessThan(rail.x - 20);
  expect(box.y + box.height).toBeLessThanOrEqual(900 - 20);
  expect(box.width).toBeLessThanOrEqual(440);
});

test('markdown from the model is shown as plain text', async ({ page }) => {
  await fakeWorker(page, () => ({ body: sse([['delta', { text: '**solid-tree** is a library.\n- one\n- two' }], ['done', done('solid-tree', 9)]]) }));
  await openChat(page);
  await page.locator('.chat-chip').first().click();
  await expect(page.locator('.chat-msg-ai').last()).toHaveText('solid-tree is a library.\none\ntwo');
});
