import { targets } from './state';

// Laptop/desktop with a fine pointer: the rail is the page's scrollbar (the native one is hidden in rail.css).
// Press the bare track to jump there; drag anywhere (including from a dot) to scrub. A press on a dot without
// moving stays a click and jumps to that milestone.
const rail = document.querySelector<HTMLElement>('.progress-rail');
const railIsScrollbar = matchMedia('(min-width: 900px) and (pointer: fine)');

// Dots sit in equal cells (half a cell of inset at each end), so map the pointer onto dot space first:
// the first dot's center is progress 0 and the last dot's center is progress 1, exactly like the fill.
function scrollForPointer(clientY: number) {
  const n = targets.length;
  if (n < 2 || !rail) return 0;
  const box = rail.getBoundingClientRect();
  const progress = Math.max(0, Math.min(1, ((clientY - box.top) / box.height * n - .5) / (n - 1)));
  const pos = progress * (n - 1);
  const seg = Math.min(n - 2, Math.floor(pos));
  return targets[seg] + (pos - seg) * (targets[seg + 1] - targets[seg]);
}

let dragged = false;
const startDrag = (pointerId: number) => {
  dragged = true;
  rail!.setPointerCapture(pointerId);
  document.documentElement.classList.add('rail-dragging');
};

rail?.addEventListener('pointerdown', event => {
  if (!railIsScrollbar.matches || event.button !== 0) return;
  const startY = event.clientY;
  dragged = false;
  const follow = (e: PointerEvent) => {
    if (!dragged && Math.abs(e.clientY - startY) < 4) return;
    if (!dragged) startDrag(e.pointerId);
    scrollTo({ top: scrollForPointer(e.clientY), behavior: 'instant' });
  };
  const end = () => {
    rail.removeEventListener('pointermove', follow);
    document.documentElement.classList.remove('rail-dragging');
  };
  if (!(event.target as HTMLElement).closest('.rail-dot')) {
    event.preventDefault();
    startDrag(event.pointerId);
    scrollTo({ top: scrollForPointer(event.clientY), behavior: 'instant' });
  }
  rail.addEventListener('pointermove', follow);
  rail.addEventListener('pointerup', end, { once: true });
  rail.addEventListener('pointercancel', end, { once: true });
});

// A drag that started on a dot must not also fire that dot's jump.
rail?.addEventListener('click', event => {
  if (!dragged) return;
  event.stopPropagation();
  event.preventDefault();
  dragged = false;
}, true);
