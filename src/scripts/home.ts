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
    band.style.setProperty('--band', `var(--sec)`);
    band.style.setProperty('--band-dark', `var(--sec-dark)`);
    band.style.setProperty('--sec', sectionByKey[key].color);
    band.style.setProperty('--sec-dark', sectionByKey[key].darkColor);
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
let chosen = -1;
let scrollTimer = 0;
function measureRail() {
  // CSS owns the shared viewport slot size; read it after each refresh.
  const slotHeight = getComputedStyle(document.documentElement).getPropertyValue('--slot-h').trim();
  if (!slotHeight) return;
  targets = anchors.map(anchor => Math.round(anchor.getBoundingClientRect().top + scrollY - LANDING_OFFSET));
  updateRail();
}
function updateRail() {
  if (!targets.length) return;
  const first = targets[0], last = targets[targets.length - 1];
  const progress = Math.max(0, Math.min(1, (scrollY - first) / Math.max(1, last - first)));
  if (railFill) railFill.style.transform = `scaleY(${progress})`;
  if (percent) percent.textContent = `${String(Math.round(progress * 100)).padStart(3, '0')}%`;
  let current = 0;
  targets.forEach((target, i) => { if (scrollY >= target - 2) current = i; });
  if (chosen >= 0 && Math.abs(scrollY - targets[chosen]) <= 2) current = chosen;
  dots.forEach((dot, i) => dot.classList.toggle('current', i === current));
  bands.forEach(band => band.classList.toggle('current', current >= Number(band.dataset.first) && current <= Number(band.dataset.last)));
  if (railLabel) railLabel.textContent = slotSections[current]?.getAttribute('data-section-label') || 'Contact';
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
addEventListener('scroll', updateRail, { passive: true });
addEventListener('resize', () => requestAnimationFrame(measureRail));
ScrollTrigger.addEventListener('refresh', measureRail);
addEventListener('load', measureRail);
document.fonts.ready.then(measureRail);
document.querySelectorAll('img').forEach(img => img.addEventListener('load', measureRail));
measureRail();

function drawFace() {
  const canvas = document.querySelector<HTMLCanvasElement>('#face-mesh');
  const img = document.querySelector<HTMLImageElement>('.portrait img');
  if (!canvas || !img || !img.complete || !img.naturalWidth) return;
  const size = Math.round(img.getBoundingClientRect().width);
  const ratio = Math.min(2, devicePixelRatio || 1);
  canvas.width = Math.round(size * ratio); canvas.height = Math.round(size * ratio);
  const ctx = canvas.getContext('2d', { willReadFrequently: true }); if (!ctx) return;
  ctx.scale(ratio, ratio);
  const crop = Math.min(img.naturalWidth, img.naturalHeight);
  const sx = (img.naturalWidth - crop) / 2, sy = (img.naturalHeight - crop) / 2;
  ctx.drawImage(img, sx, sy, crop, crop, 0, 0, size, size);
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--paper'); ctx.fillRect(0, 0, size, size);
  const step = 7;
  for (let y=0; y<size; y+=step) for (let x=0; x<size; x+=step) {
    const k = (Math.floor(y*ratio)*canvas.width + Math.floor(x*ratio))*4;
    const lum = (pixels.data[k]*.2126 + pixels.data[k+1]*.7152 + pixels.data[k+2]*.0722)/255;
    ctx.fillStyle = lum < .48 ? '#191917' : '#ff4f00';
    ctx.beginPath(); ctx.arc(x+step/2,y+step/2,Math.max(.35,(1-lum)*step*.46),0,Math.PI*2); ctx.fill();
  }
  ctx.strokeStyle = 'rgba(255,79,0,.24)'; ctx.lineWidth=.5;
  for(let n=0;n<size;n+=28){ctx.beginPath();ctx.moveTo(n,0);ctx.lineTo(n,size);ctx.moveTo(0,n);ctx.lineTo(size,n);ctx.stroke();}
}
const img = document.querySelector<HTMLImageElement>('.portrait img');
img?.addEventListener('load', drawFace); if (img?.complete) drawFace();
let resizeTimer: number; addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = window.setTimeout(drawFace, 150); });
document.getElementById('theme-toggle')?.addEventListener('click', () => requestAnimationFrame(drawFace));

function heroScene() {
  const title = document.querySelector<HTMLElement>('#hero-title');
  const portrait = document.querySelector<HTMLElement>('.portrait');
  if (!title || !portrait) return;
  title.setAttribute('aria-label', 'Tim Otholt.');
  const letters = [...splitText(title.querySelector<HTMLElement>('.name-tim')!), ...splitText(title.querySelector<HTMLElement>('.name-otholt')!)];
  gsap.from(letters, { x: i => (i%2 ? 1 : -1)*Math.min(innerWidth*.65,600), opacity:0, duration:.9, stagger:.045, ease:'power3.out', clearProps:'transform,opacity' });
  gsap.fromTo(portrait, { '--scan': '0%' }, { '--scan': '50%', ease:'none', scrollTrigger:{ trigger:'.hero', start:'top top', end:'40% top', scrub:.6 } });
}
function chipScene() {
  gsap.fromTo('.chip-section .bios-chip', { scale:.6, rotationY:-16, rotationZ:-7 }, { scale:2.5, rotationY:9, rotationZ:4, ease:'none', scrollTrigger:{trigger:'.chip-section',start:'top bottom',end:'bottom top',scrub:.6} });
  gsap.to('.chip-stage-label', {opacity:0, y:-55, ease:'none', scrollTrigger:{trigger:'.chip-section',start:'center center',end:'bottom top',scrub:true}});
}
function profileScene(mobile: boolean) {
  const heading = document.querySelector<HTMLElement>('#about h2'); if (!heading) return;
  heading.setAttribute('aria-label', "From firmware to what's next.");
  splitText(heading,true).forEach((word,i)=>gsap.from(word,{x:(i%2?1:-1)*innerWidth*(mobile?.4:.8),skewX:i%2?-25:25,opacity:0,ease:'none',scrollTrigger:{trigger:word,start:'top 95%',end:'top 35%',scrub:.6}}));
  gsap.from('.about-grid > div', {x:mobile?innerWidth*.4:innerWidth*.8,opacity:0,ease:'none',scrollTrigger:{trigger:'.about-grid > div',start:'top 95%',end:'top 35%',scrub:.6}});
  document.querySelectorAll<HTMLElement>('.metric').forEach((metric,i)=>{
    gsap.from(metric,{x:(i%2?1:-1)*innerWidth*(mobile?.4:.8),scale:3,opacity:0,ease:'none',scrollTrigger:{trigger:metric.closest('.feature-slot')||metric,start:'top 95%',end:'top 40%',scrub:.6}});
    const el=metric.querySelector<HTMLElement>('.metric-value');if(!el)return;
    const target=Number(el.dataset.count);const decimal=el.dataset.count?.includes('.')?1:0;const counter={value:0};
    gsap.to(counter,{value:target,ease:'none',scrollTrigger:{trigger:metric.closest('.feature-slot')||metric,start:'top 95%',end:'top 40%',scrub:.6},onUpdate:()=>{el.textContent=counter.value.toFixed(decimal).padStart(decimal?3:2,'0')}});
  });
}
function projectScene(mobile: boolean) {
  document.querySelectorAll<HTMLElement>('.project-card').forEach((card,i)=>{
    const sign=i%2?1:-1;
    gsap.from(card,{x:sign*innerWidth*(mobile?.4:.4),rotationY:sign*(mobile?35:70),rotationZ:sign*6,z:-400,opacity:0,ease:'none',scrollTrigger:{trigger:card,start:'top bottom',end:'center center',scrub:.6}});
    gsap.to(card,{y:-55,z:-90,opacity:.72,ease:'none',scrollTrigger:{trigger:card,start:'center center',end:'bottom top',scrub:.6}});
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
    gsap.from(row, { x: (i % 2 ? 1 : -1) * innerWidth * (mobile ? .65 : .9), opacity: .1, skewX: i % 2 ? -15 : 15, ease: 'none', scrollTrigger: { trigger: row.closest('.pin-slot'), start: 'top 95%', end: 'top top', scrub: .6 } });
    gsap.fromTo(row, { backgroundColor: 'transparent' }, { backgroundColor: 'var(--section-accent)', duration: .12, yoyo: true, repeat: 1, scrollTrigger: { trigger: row.closest('.pin-slot'), start: 'top 65%', end: 'top 20%', scrub: true } });
  });
}

function postScene() {
  document.querySelectorAll<HTMLElement>('.post-section').forEach(section => {
  const panel = section.querySelector<HTMLElement>('.post-panel');
  if (!panel) return;
  const lines = gsap.utils.toArray<HTMLElement>(section.querySelectorAll('.post-line'));
  const tl = gsap.timeline({ scrollTrigger: { trigger: section, start: 'top 75%', end: 'top 20%', scrub: .6 } });
  tl.from(panel, { scaleY: .004, opacity: .45, transformOrigin: 'center center', duration: .7, force3D: true });
  tl.to(panel, { opacity: .55, duration: .025, yoyo: true, repeat: 3 }, .44);
  ScrollTrigger.create({ trigger: section, start: 'top 30%', once: true, onEnter: () => {
    lines.forEach((line, i) => gsap.fromTo(line, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: .28, delay: i * .18, ease: 'steps(20)' }));
  } });
  });
}

function experienceScene(mobile: boolean) {
  const rows = gsap.utils.toArray<HTMLElement>('.revision-row');
  // Trigger on the slot so rows under a section heading still settle by the slot's landing.
  rows.forEach((row, i) => gsap.from(row, { x: (i % 2 ? 1 : -1) * innerWidth * (mobile ? .4 : .8), rotation: i % 2 ? 12 : -12, opacity: 0, force3D: true, ease: 'none', scrollTrigger: { trigger: row.closest('.feature-slot') || row, start: 'top 95%', end: 'top 35%', scrub: .6 } }));
}



mm.add('(prefers-reduced-motion: reduce)', () => { gsap.set('.portrait', {'--scan':'50%'}); updateRail(); });
mm.add({desktop:'(min-width: 768px) and (prefers-reduced-motion: no-preference)',mobile:'(max-width: 767px) and (prefers-reduced-motion: no-preference)'}, context => {
  const mobile=!!context.conditions?.mobile;
  heroScene(); chipScene(); profileScene(mobile); projectScene(mobile); skillsScene(mobile); postScene(); experienceScene(mobile);
  gsap.to('body',{backgroundPositionY:'200px',ease:'none',scrollTrigger:{start:0,end:'max',scrub:true}});
  requestAnimationFrame(()=>ScrollTrigger.refresh());
});
addEventListener('load',()=>ScrollTrigger.refresh(),{once:true});
document.fonts.ready.then(()=>ScrollTrigger.refresh());
document.querySelectorAll<HTMLAnchorElement>('a[href^="#"], a[href^="/#"]').forEach(link => {
  link.addEventListener('click', event => { const id=link.hash.slice(1);const target=id&&document.getElementById(id);if(!target)return;event.preventDefault();history.pushState(null,'',`#${id}`);target.scrollIntoView({behavior:'instant',block:'start'}); });
});
