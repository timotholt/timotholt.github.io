import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  targets,
  railCurrent,
  readerIndex,
  restoreIndex,
  setTargets,
  setRailCurrent,
  setReaderIndex,
  setRestoreIndex,
} from "./state";
import { updateChrome } from "./chrome";

gsap.registerPlugin(ScrollTrigger);

// Slot starts are untransformed: the anchor is a sibling of each animated object.
export const LANDING_OFFSET = 0;
const slots = gsap.utils.toArray<HTMLElement>(".feature-slot");
// One short name per screen, shared by the dot tooltip and the readout so they never disagree.
const railLabels = slots.map(
  (slot) =>
    slot.dataset.railLabel ||
    slot.closest("section")?.getAttribute("data-section-label") ||
    "",
);
const thumb = document.querySelector<HTMLElement>(".rail-thumb");
const railDots = document.querySelector<HTMLElement>(".rail-dots");
const percent = document.querySelector<HTMLElement>("#scroll-percent");
const railLabel = document.querySelector<HTMLElement>("#rail-section");
const readout = document.querySelector<HTMLElement>(".rail-readout");
const rail = document.querySelector<HTMLElement>(".progress-rail");
const anchors = slots.map((slot) => {
  const anchor = document.createElement("span");
  anchor.className = "milestone-anchor";
  anchor.setAttribute("aria-hidden", "true");
  slot.prepend(anchor);
  return anchor;
});
const slotSections = slots.map((slot) => slot.closest("section"));
// One tick per page (a button: click or Enter jumps there); the first page of each section gets a longer tick.
const dots = slots.map((slot, i) => {
  const dot = document.createElement("button");
  dot.type = "button";
  dot.className = "rail-dot";
  if (i === 0 || slotSections[i] !== slotSections[i - 1]) dot.classList.add("major");
  // Ticks are centered in equal cells (half a step of inset at each end), the thumb's centers from top to bottom.
  dot.style.top = `${((i + 0.5) / slots.length) * 100}%`;
  dot.setAttribute(
    "aria-label",
    slot.dataset.milestone || `Milestone ${i + 1}`,
  );
  dot.dataset.title = railLabels[i];
  dot.dataset.index = String(i);
  railDots?.append(dot);
  return dot;
});
let chosen = -1;
let scrollTimer = 0;
function measureRail() {
  // CSS owns the shared viewport slot size; read it after each refresh.
  const slotHeight = getComputedStyle(document.documentElement)
    .getPropertyValue("--slot-h")
    .trim();
  if (!slotHeight) return;
  setTargets(
    anchors.map((anchor) =>
      Math.round(anchor.getBoundingClientRect().top + scrollY - LANDING_OFFSET),
    ),
  );
  // After a layout rebuild (breakpoint change), return to the milestone the reader was on.
  if (restoreIndex >= 0 && targets[restoreIndex] !== undefined) {
    scrollTo({ top: targets[restoreIndex], behavior: "instant" });
    setRestoreIndex(-1);
  }
  updateRail();
}
export function updateRail() {
  if (!targets.length) return;
  const first = targets[0],
    last = targets[targets.length - 1];
  // Map scroll onto the evenly spaced dots: progress moves one dot-step between consecutive targets.
  let seg = 0;
  while (seg < targets.length - 2 && scrollY >= targets[seg + 1]) seg++;
  const span = Math.max(1, targets[seg + 1] - targets[seg]);
  const progress =
    scrollY <= first
      ? 0
      : scrollY >= last
        ? 1
        : Math.min(
            1,
            (seg + (scrollY - targets[seg]) / span) /
              Math.max(1, targets.length - 1),
          );
  // The thumb's center sits on the tick cell centers: first tick at 0%, last tick at 100%. Every page is one screen
  // tall, so one cell is the share of the page on screen, like a native thumb.
  const tip = (0.5 + progress * (slots.length - 1)) / slots.length;
  const railH = rail?.clientHeight || innerHeight;
  if (thumb) {
    thumb.style.height = `${railH / slots.length}px`;
    thumb.style.top = `${tip * railH - railH / slots.length / 2}px`;
  }
  if (percent) percent.textContent = `${Math.round(progress * 100)}%`;
  let current = 0;
  targets.forEach((target, i) => {
    if (scrollY >= target - 2) current = i;
  });
  if (chosen >= 0 && Math.abs(scrollY - targets[chosen]) <= 2) current = chosen;
  setRailCurrent(current);
  dots.forEach((dot, i) => dot.classList.toggle("current", i === current));
  if (railLabel)
    railLabel.textContent = railLabels[current];
  updateChrome(slotSections[current]);
  updateUrl(slotSections[current]);
  // The readout rides beside the thumb, held just inside the rail's ends so it is never clipped.
  if (readout) {
    const half = readout.offsetHeight / 2;
    readout.style.top = `${Math.max(half, Math.min(railH - half, tip * railH))}px`;
  }
}
dots.forEach((dot, i) =>
  dot.addEventListener("click", () => {
    chosen = i;
    const target = targets[i];
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    scrollTo({ top: target, behavior: reduced ? "instant" : "smooth" });
    clearTimeout(scrollTimer);
    if (!reduced) {
      const correct = () => {
        clearTimeout(scrollTimer);
        scrollTimer = window.setTimeout(() => {
          scrollTo({ top: targets[i], behavior: "instant" });
          updateRail();
        }, 120);
      };
      addEventListener("scrollend", correct, { once: true });
      scrollTimer = window.setTimeout(correct, 1600);
    }
    updateRail();
  }),
);
// The address bar follows the section being read (#projects, #skills, ...; none on the hero). replaceState adds no
// history entries and never scrolls. It waits for the first real scroll so a deep link (e.g. /#awards) is not
// overwritten before the browser has jumped to it.
let urlLive = false;
let lastHash = location.hash;
function updateUrl(section: Element | null | undefined) {
  if (!urlLive) return;
  // The hero has an id only so the Home menu link can glide to it; the bare address still stands for it.
  const hash = section?.id && !section.matches(".hero") ? `#${section.id}` : "";
  if (hash === lastHash) return;
  lastHash = hash;
  history.replaceState(history.state, "", hash || location.pathname + location.search);
}
// The readout pops up while the page moves and fades once it stops (rail.css).
let idleTimer = 0;
addEventListener(
  "scroll",
  () => {
    urlLive = true;
    updateRail();
    if (restoreIndex < 0) setReaderIndex(railCurrent);
    rail?.classList.add("is-scrolling");
    clearTimeout(idleTimer);
    idleTimer = window.setTimeout(
      () => rail?.classList.remove("is-scrolling"),
      900,
    );
  },
  { passive: true },
);
// Any resize changes slot heights (they are one viewport tall), so return to the milestone the reader was on.
addEventListener("resize", () => {
  if (restoreIndex < 0) setRestoreIndex(readerIndex);
  requestAnimationFrame(measureRail);
});
ScrollTrigger.addEventListener("refresh", measureRail);
addEventListener("load", measureRail);
document.fonts.ready.then(measureRail);
document
  .querySelectorAll("img")
  .forEach((img) => img.addEventListener("load", measureRail));
measureRail();
