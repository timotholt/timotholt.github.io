import { sectionByKey, type SectionKey } from '../data/sections';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function splitText(el: HTMLElement, byWord = false) {
  const nodes: Text[] = [];
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) { const node = walker.currentNode as Text; if (!node.parentElement?.closest('.scene-letter, .scene-word')) nodes.push(node); }
  const spans: HTMLSpanElement[] = [];
  nodes.forEach(node => {
    const fragment = document.createDocumentFragment();
    const bits = byWord ? node.textContent?.match(/\S+|\s+/g) || [] : [...(node.textContent || '')];
    bits.forEach(bit => {
      if (/^\s+$/.test(bit)) { fragment.append(document.createTextNode(bit)); return; }
      const span = document.createElement('span');
      span.className = byWord ? 'scene-word' : 'scene-letter';
      span.setAttribute('aria-hidden', 'true');
      span.textContent = bit;
      fragment.append(span);
      spans.push(span);
    });
    node.replaceWith(fragment);
  });
  return spans;
}

const mm = gsap.matchMedia();
// Slot starts are untransformed: the anchor is a sibling of each animated object.
export const LANDING_OFFSET = 0;
const slots = gsap.utils.toArray<HTMLElement>('.feature-slot');
const railFill = document.querySelector<HTMLElement>('.rail-fill');
const railDots = document.querySelector<HTMLElement>('.rail-dots');
const percent = document.querySelector<HTMLElement>('#scroll-percent');
const railLabel = document.querySelector<HTMLElement>('#rail-section');
const readout = document.querySelector<HTMLElement>('.rail-readout');
const anchors = slots.map(slot => {
  const anchor = document.createElement('span');
  anchor.className = 'milestone-anchor';
  anchor.setAttribute('aria-hidden', 'true');
  slot.prepend(anchor);
  return anchor;
});
const dots = slots.map((slot, i) => {
  const dot = document.createElement('button');
  dot.type = 'button'; dot.className = 'rail-dot';
  dot.style.top = `${i / Math.max(1, slots.length - 1) * 100}%`;
  dot.setAttribute('aria-label', slot.dataset.milestone || `Milestone ${i + 1}`);
  dot.dataset.title = slot.dataset.milestone || '';
  dot.dataset.index = String(i);
  const key = slot.closest('section')?.getAttribute('data-section-key') as SectionKey | null;
  if (key && sectionByKey[key]) dot.style.setProperty('--dot-fg', sectionByKey[key].fg);
  railDots?.append(dot);
  return dot;
});
// One solid band per page section behind its dots, so groups read at a glance.
const slotSections = slots.map(slot => slot.closest('section'));
const bands: HTMLElement[] = [];
slotSections.forEach((section, i) => {
  if (i > 0 && section === slotSections[i - 1]) return;
  let last = i;
  while (last + 1 < slots.length && slotSections[last + 1] === section) last++;
  const step = 100 / Math.max(1, slots.length - 1);
  const band = document.createElement('span');
  band.className = 'rail-band';
  const key = section?.getAttribute('data-section-key') as SectionKey | null;
  if (key && sectionByKey[key]) {
    band.style.setProperty('--band', sectionByKey[key].bg);
    band.style.setProperty('--band-fg', sectionByKey[key].fg);
    band.dataset.sectionKey = key;
  }
  band.setAttribute('aria-hidden', 'true');
  band.dataset.first = String(i); band.dataset.last = String(last);
  band.style.top = `calc(${(i - .5) * step}% + 2px)`;
  band.style.height = `calc(${(last - i + 1) * step}% - 4px)`;
  railDots?.prepend(band);
  bands.push(band);
});
let targets: number[] = [];
let railCurrent = 0;      // milestone under the reader, from the latest updateRail
let readerIndex = 0;      // last milestone settled by user scrolling (not by a resize)
let restoreIndex = -1;    // milestone to return to after a breakpoint rebuild
let chosen = -1;
let scrollTimer = 0;
function measureRail() {
  // CSS owns the shared viewport slot size; read it after each refresh.
  const slotHeight = getComputedStyle(document.documentElement).getPropertyValue('--slot-h').trim();
  if (!slotHeight) return;
  targets = anchors.map(anchor => Math.round(anchor.getBoundingClientRect().top + scrollY - LANDING_OFFSET));
  // After a layout rebuild (breakpoint change), return to the milestone the reader was on.
  if (restoreIndex >= 0 && targets[restoreIndex] !== undefined) { scrollTo({ top: targets[restoreIndex], behavior: 'instant' }); restoreIndex = -1; }
  updateRail();
}
const themeMeta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
function updateRail() {
  if (!targets.length) return;
  const first = targets[0], last = targets[targets.length - 1];
  // Map scroll onto the evenly spaced dots: progress moves one dot-step between consecutive targets.
  let seg = 0;
  while (seg < targets.length - 2 && scrollY >= targets[seg + 1]) seg++;
  const span = Math.max(1, targets[seg + 1] - targets[seg]);
  const progress = scrollY <= first ? 0 : scrollY >= last ? 1 : Math.min(1, (seg + (scrollY - targets[seg]) / span) / Math.max(1, targets.length - 1));
  if (railFill) railFill.style.transform = `scaleY(${progress})`;
  if (percent) percent.textContent = `${String(Math.round(progress * 100)).padStart(3, '0')}%`;
  let current = 0;
  targets.forEach((target, i) => { if (scrollY >= target - 2) current = i; });
  if (chosen >= 0 && Math.abs(scrollY - targets[chosen]) <= 2) current = chosen;
  railCurrent = current;
  dots.forEach((dot, i) => dot.classList.toggle('current', i === current));
  bands.forEach(band => band.classList.toggle('current', current >= Number(band.dataset.first) && current <= Number(band.dataset.last)));
  if (railLabel) railLabel.textContent = slotSections[current]?.getAttribute('data-section-label') || 'Contact';
  // Browser chrome (mobile address bar, app panes) follows the current section's color.
  const key = slotSections[current]?.getAttribute('data-section-key') as SectionKey | null;
  if (themeMeta && key && sectionByKey[key] && themeMeta.content !== sectionByKey[key].bg) {
    themeMeta.content = sectionByKey[key].bg;
    // Overscroll areas and tinted browser frames show the root background; keep it on the current section's color.
    document.documentElement.style.backgroundColor = sectionByKey[key].bg;
    document.body.style.backgroundColor = sectionByKey[key].bg;
  }
  const headerBottom = document.querySelector('.site-header')?.getBoundingClientRect().bottom ?? 0;
  if (readout) readout.style.top = `${Math.max(24, headerBottom + 18, Math.min(innerHeight - 35, progress * innerHeight))}px`;
}
dots.forEach((dot, i) => dot.addEventListener('click', () => {
  chosen = i;
  const target = targets[i];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  scrollTo({ top: target, behavior: reduced ? 'instant' : 'smooth' });
  clearTimeout(scrollTimer);
  if (!reduced) {
    const correct = () => {
      clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(() => { scrollTo({ top: targets[i], behavior: 'instant' }); updateRail(); }, 120);
    };
    addEventListener('scrollend', correct, { once: true });
    scrollTimer = window.setTimeout(correct, 1600);
  }
  updateRail();
}));
// Phones: the readout overlaps text, so it shows only while scrolling.
const rail = document.querySelector<HTMLElement>('.progress-rail');
let idleTimer = 0;
addEventListener('scroll', () => {
  updateRail();
  if (restoreIndex < 0) readerIndex = railCurrent;
  rail?.classList.add('is-scrolling');
  clearTimeout(idleTimer);
  idleTimer = window.setTimeout(() => rail?.classList.remove('is-scrolling'), 900);
}, { passive: true });
// Any resize changes slot heights (they are one viewport tall), so return to the milestone the reader was on.
addEventListener('resize', () => { if (restoreIndex < 0) restoreIndex = readerIndex; requestAnimationFrame(measureRail); });
ScrollTrigger.addEventListener('refresh', measureRail);
addEventListener('load', measureRail);
document.fonts.ready.then(measureRail);
document.querySelectorAll('img').forEach(img => img.addEventListener('load', measureRail));
measureRail();

function heroScene() {
  const title = document.querySelector<HTMLElement>('#hero-title');
  if (!title) return;
  title.setAttribute('aria-label', 'Tim Otholt');
  const letters = [...splitText(title.querySelector<HTMLElement>('.name-tim')!), ...splitText(title.querySelector<HTMLElement>('.name-otholt')!)];
  gsap.from(letters, { x: i => (i%2 ? 1 : -1)*Math.min(innerWidth*.65,600), opacity:0, duration:.9, stagger:.045, ease:'power3.out', clearProps:'transform,opacity' });
}
function chipScene() {
  gsap.fromTo('.chip-section .bios-chip', { scale:.6, rotationY:-16, rotationZ:-7 }, { scale:2.5, rotationY:9, rotationZ:4, ease:'none', scrollTrigger:{trigger:'.chip-section',start:'top bottom',end:'bottom top',scrub:.6} });
  gsap.to('.chip-stage-label', {opacity:0, y:-55, ease:'none', scrollTrigger:{trigger:'.chip-section',start:'center center',end:'bottom top',scrub:true}});
}
function profileScene(mobile: boolean) {
  const heading = document.querySelector<HTMLElement>('#about h2'); if (!heading) return;
  heading.setAttribute('aria-label', "From firmware to what's next.");
  splitText(heading,true).forEach((word,i)=>gsap.from(word,{x: () => (i%2?1:-1)*innerWidth*(mobile?.4:.8),skewX:i%2?-25:25,opacity:0,ease:'none',scrollTrigger:{invalidateOnRefresh:true,trigger:word,start:'top 95%',end:'top 35%',scrub:.6}}));
  gsap.from('.about-grid > div', {x:()=>mobile?innerWidth*.4:innerWidth*.8,opacity:0,ease:'none',scrollTrigger:{invalidateOnRefresh:true,trigger:'.about-grid > div',start:'top 95%',end:'top 35%',scrub:.6}});
  document.querySelectorAll<HTMLElement>('.metric').forEach((metric,i)=>{
    gsap.from(metric,{x: () => (i%2?1:-1)*innerWidth*(mobile?.4:.8),scale:3,opacity:0,ease:'none',scrollTrigger:{invalidateOnRefresh:true,trigger:metric.closest('.feature-slot')||metric,start:'top 95%',end:'top 40%',scrub:.6}});
    const el=metric.querySelector<HTMLElement>('.metric-value');if(!el)return;
    const target=Number(el.dataset.count);const decimal=el.dataset.count?.includes('.')?1:0;const counter={value:0};
    gsap.to(counter,{value:target,ease:'none',scrollTrigger:{trigger:metric.closest('.feature-slot')||metric,start:'top 95%',end:'top 40%',scrub:.6},onUpdate:()=>{el.textContent=counter.value.toFixed(decimal).padStart(decimal?3:2,'0')}});
  });
}
function projectScene(mobile: boolean) {
  document.querySelectorAll<HTMLElement>('.project-card').forEach((card,i)=>{
    const sign=i%2?1:-1;
    // Time to the slot: on phones the section heading shares the first slot and pushes the card down.
    const slot=card.closest<HTMLElement>('.feature-slot')||card;
    gsap.from(card,{x:()=>sign*innerWidth*(mobile?.4:.4),rotationY:sign*(mobile?35:70),rotationZ:sign*6,z:-400,opacity:0,ease:'none',scrollTrigger:{invalidateOnRefresh:true,trigger:slot,start:'top bottom',end:'top 20%',scrub:.6}});
    // Explicit start values: a plain .to() would capture the entrance's opacity:0 start state and hide the card just past landing.
    gsap.fromTo(card,{y:0,z:0,opacity:1},{y:-55,z:-90,opacity:.72,ease:'none',immediateRender:false,scrollTrigger:{trigger:slot,start:'top top',end:'bottom top',scrub:.6}});
  });
}
function skillsScene(mobile: boolean) {
  const section = document.querySelector<HTMLElement>('#skills');
  if (!section) return;
  const drawing = section.querySelector<HTMLElement>('.package-drawing');
  const sweep = section.querySelector<HTMLElement>('.logic-sweep');
  if (drawing) gsap.fromTo(drawing, { yPercent: 18 }, { yPercent: -18, ease: 'none', scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: .6 } });
  if (sweep) gsap.fromTo(sweep, { x: 0, opacity: 1 }, { x: () => drawing?.clientWidth || 400, opacity: 1, ease: 'none', scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: .6 } });
  gsap.utils.toArray<HTMLElement>('.pinout-row').forEach((row, i) => {
    gsap.from(row, { x: () => (i % 2 ? 1 : -1) * innerWidth * (mobile ? .65 : .9), opacity: .1, skewX: i % 2 ? -15 : 15, ease: 'none', scrollTrigger:{invalidateOnRefresh:true, trigger: row.closest('.pin-slot'), start: 'top 95%', end: 'top top', scrub: .6 } });
    gsap.fromTo(row, { backgroundColor: 'transparent' }, { backgroundColor: 'var(--section-accent)', duration: .12, yoyo: true, repeat: 1, scrollTrigger: { trigger: row.closest('.pin-slot'), start: 'top 65%', end: 'top 20%', scrub: true } });
  });
}

function credScene(mobile: boolean) {
  // Field-notes recipe per item, timed to the section slot so the list is settled when it lands.
  document.querySelectorAll<HTMLElement>('.cred-section').forEach(section => {
    section.querySelectorAll<HTMLElement>('.cred-item').forEach((item, i) => gsap.from(item, { x: () => (i % 2 ? 1 : -1) * innerWidth * (mobile ? .4 : .8), rotation: i % 2 ? 20 : -20, opacity: 0, force3D: true, ease: 'none', scrollTrigger:{invalidateOnRefresh:true, trigger: section, start: `top ${95 - i * 8}%`, end: `top ${30 - i * 6}%`, scrub: .6 } }));
  });
}

function experienceScene(mobile: boolean) {
  // Field-notes values, staggered per row and timed to the page slot so a page is settled when it lands.
  document.querySelectorAll<HTMLElement>('.job-page').forEach(page => {
    page.querySelectorAll<HTMLElement>('.job-row').forEach((row, i) => gsap.from(row, { x: () => (i % 2 ? 1 : -1) * innerWidth * (mobile ? .4 : .8), rotation: i % 2 ? 12 : -12, opacity: 0, force3D: true, ease: 'none', scrollTrigger:{invalidateOnRefresh:true, trigger: page, start: `top ${95 - i * 8}%`, end: `top ${30 - i * 6}%`, scrub: .6 } }));
  });
}



mm.add('(prefers-reduced-motion: reduce)', () => { updateRail(); });
mm.add({desktop:'(min-width: 768px) and (prefers-reduced-motion: no-preference)',mobile:'(max-width: 767px) and (prefers-reduced-motion: no-preference)'}, context => {
  const mobile=!!context.conditions?.mobile;
  heroScene(); chipScene(); profileScene(mobile); projectScene(mobile); skillsScene(mobile); credScene(mobile); experienceScene(mobile);
  gsap.to('body',{backgroundPositionY:'200px',ease:'none',scrollTrigger:{start:0,end:'max',scrub:true}});
  requestAnimationFrame(()=>ScrollTrigger.refresh());
  // Leaving this breakpoint rebuilds every scene; remember where the reader was.
  return () => { restoreIndex = readerIndex; };
});
addEventListener('load',()=>ScrollTrigger.refresh(),{once:true});
document.fonts.ready.then(()=>ScrollTrigger.refresh());
document.querySelectorAll<HTMLAnchorElement>('a[href^="#"], a[href^="/#"]').forEach(link => {
  link.addEventListener('click', event => { const id=link.hash.slice(1);const target=id&&document.getElementById(id);if(!target)return;event.preventDefault();history.pushState(null,'',`#${id}`);target.scrollIntoView({behavior:'instant',block:'start'}); });
});
