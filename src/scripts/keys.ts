import { targets } from "./state";

// Keyboard paging. With hard snap a 40px arrow step got pulled back (stutter), so keys move whole pages.
// Presses buffer into a destination page and a critically damped spring glides there: one press takes ~0.45s,
// several presses travel farther at higher speed, new presses retarget mid-glide without a jolt, and the
// destination never leads the current position by more than MAX_LEAD pages (so a held key stops promptly).
const MAX_LEAD = 3;
const OMEGA = 10; // spring stiffness (rad/s); ~0.45s to settle one page
const glide = { dest: -1, pos: 0, vel: 0, raf: 0, last: 0 };
const nearestIndex = (y: number) =>
  targets.reduce(
    (k, t, i) => (Math.abs(t - y) < Math.abs(targets[k] - y) ? i : k),
    0,
  );
function stopGlide() {
  cancelAnimationFrame(glide.raf);
  glide.raf = 0;
  glide.dest = -1;
  glide.vel = 0;
  document.documentElement.classList.remove("key-gliding");
}
function stepGlide(now: number) {
  const dt = Math.min(0.05, (now - glide.last) / 1000);
  glide.last = now;
  const target = targets[glide.dest];
  glide.vel +=
    (OMEGA * OMEGA * (target - glide.pos) - 2 * OMEGA * glide.vel) * dt;
  glide.pos += glide.vel * dt;
  if (Math.abs(target - glide.pos) < 0.5 && Math.abs(glide.vel) < 20) {
    scrollTo({ top: target, behavior: "instant" });
    stopGlide();
    return;
  }
  scrollTo({ top: glide.pos, behavior: "instant" });
  glide.raf = requestAnimationFrame(stepGlide);
}
function glideTo(index: number) {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) {
    stopGlide();
    scrollTo({ top: targets[index], behavior: "instant" });
    return;
  }
  glide.dest = index;
  if (glide.raf) return; // already gliding: the spring simply retargets
  glide.pos = scrollY;
  glide.vel = 0;
  glide.last = performance.now();
  document.documentElement.classList.add("key-gliding");
  glide.raf = requestAnimationFrame(stepGlide);
}
function pageBy(dir: 1 | -1) {
  const pos = glide.raf ? glide.pos : scrollY;
  const ahead = (d: number) =>
    d > 0
      ? targets.findIndex((t) => t > pos + 2)
      : targets.reduce((k, t, i) => (t < pos - 2 ? i : k), -1);
  let dest: number;
  if (glide.raf && Math.sign(targets[glide.dest] - pos) === dir)
    dest = glide.dest + dir; // same direction: buffer one more page
  else dest = ahead(dir); // first press, or a reversal
  if (dest < 0 || dest >= targets.length) return;
  const here = nearestIndex(pos);
  dest = Math.max(here - MAX_LEAD, Math.min(here + MAX_LEAD, dest));
  glideTo(dest);
}
addEventListener("keydown", (event) => {
  if (
    event.defaultPrevented ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    !targets.length
  )
    return;
  if (
    (event.target as HTMLElement).closest(
      'input, textarea, select, [contenteditable], [role="dialog"]',
    )
  )
    return;
  if (
    event.key === "ArrowDown" ||
    event.key === "PageDown" ||
    (event.key === " " && !event.shiftKey)
  )
    pageBy(1);
  else if (
    event.key === "ArrowUp" ||
    event.key === "PageUp" ||
    (event.key === " " && event.shiftKey)
  )
    pageBy(-1);
  else if (event.key === "Home") glideTo(0);
  else if (event.key === "End") glideTo(targets.length - 1);
  else return;
  event.preventDefault();
});
// Any direct input (wheel, trackpad, touch, a click) takes over from a keyboard glide immediately.
for (const type of ["wheel", "touchstart", "pointerdown"] as const)
  addEventListener(
    type,
    () => {
      if (glide.raf) stopGlide();
    },
    { passive: true },
  );
