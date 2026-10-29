import { targets } from './state';

// The rail is the page's scrollbar on every device (the native one is hidden in rail.css), see docs/SCROLLBAR.md.
// Press the bare track to jump there and keep dragging; grab the thumb to drag it from where you hold it. A press on
// a tick without moving stays a click and jumps to that page. Hovering the track names the page that spot leads to.
const rail = document.querySelector<HTMLElement>('.progress-rail');
const thumb = document.querySelector<HTMLElement>('.rail-thumb');
const hint = document.querySelector<HTMLElement>('.rail-hint');
const ticks = [...document.querySelectorAll<HTMLElement>('.rail-dot')];

// Ticks sit in equal cells (half a cell of inset at each end), so map the pointer onto tick space first:
// the first tick's center is progress 0 and the last tick's center is progress 1, exactly like the thumb's center.
function progressFor(clientY: number) {
  const n = targets.length;
  if (n < 2 || !rail) return 0;
  const box = rail.getBoundingClientRect();
  return Math.max(0, Math.min(1, ((clientY - box.top) / box.height * n - .5) / (n - 1)));
}
function scrollForPointer(clientY: number) {
  const n = targets.length;
  if (n < 2) return 0;
  const pos = progressFor(clientY) * (n - 1);
  const seg = Math.min(n - 2, Math.floor(pos));
  return targets[seg] + (pos - seg) * (targets[seg + 1] - targets[seg]);
}

let dragged = false;
const startDrag = (pointerId: number) => {
  dragged = true;
  rail!.setPointerCapture(pointerId);
  document.documentElement.classList.add('rail-dragging');
  hint?.classList.remove('shown');
};

rail?.addEventListener('pointerdown', event => {
  if (event.button !== 0) return;
  const target = event.target as HTMLElement;
  const startY = event.clientY;
  dragged = false;
  // Grabbing the thumb keeps the pointer where it took hold, like macOS; anywhere else centers the thumb on it.
  let offset = 0;
  if (target.closest('.rail-thumb') && thumb) {
    const t = thumb.getBoundingClientRect();
    offset = startY - (t.top + t.bottom) / 2;
  }
  const follow = (e: PointerEvent) => {
    if (!dragged && Math.abs(e.clientY - startY) < 4) return;
    if (!dragged) startDrag(e.pointerId);
    scrollTo({ top: scrollForPointer(e.clientY - offset), behavior: 'instant' });
  };
  const end = () => {
    rail.removeEventListener('pointermove', follow);
    document.documentElement.classList.remove('rail-dragging');
  };
  if (!target.closest('.rail-dot, .rail-thumb')) {
    event.preventDefault();
    startDrag(event.pointerId);
    scrollTo({ top: scrollForPointer(event.clientY), behavior: 'instant' });
  }
  rail.addEventListener('pointermove', follow);
  rail.addEventListener('pointerup', end, { once: true });
  rail.addEventListener('pointercancel', end, { once: true });
});

// A drag that started on a tick must not also fire that tick's jump.
rail?.addEventListener('click', event => {
  if (!dragged) return;
  event.stopPropagation();
  event.preventDefault();
  dragged = false;
}, true);

// The thumb lies over the ticks it covers; a press on it without dragging still clicks the tick underneath.
thumb?.addEventListener('click', event => {
  const tick = document.elementsFromPoint(event.clientX, event.clientY).find(e => e.matches('.rail-dot'));
  (tick as HTMLElement | undefined)?.click();
});

// Hover (mouse or pen): name the page under the pointer, beside its tick.
function showHint(i: number) {
  const tick = ticks[i];
  if (!hint || !tick) return;
  hint.textContent = tick.dataset.title ?? '';
  hint.style.top = tick.style.top;
  hint.classList.add('shown');
}
rail?.addEventListener('pointermove', event => {
  if (event.pointerType === 'touch' || document.documentElement.classList.contains('rail-dragging')) return;
  showHint(Math.round(progressFor(event.clientY) * (ticks.length - 1)));
});
rail?.addEventListener('pointerleave', () => hint?.classList.remove('shown'));
// Keyboard: a focused tick names its page too.
ticks.forEach((tick, i) => {
  tick.addEventListener('focus', () => { if (tick.matches(':focus-visible')) showHint(i); });
  tick.addEventListener('blur', () => hint?.classList.remove('shown'));
});
