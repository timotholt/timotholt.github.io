import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const clock = document.getElementById('local-clock');
function updateClock() {
  if (clock) clock.textContent = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date());
}
updateClock();
setInterval(updateClock, 30_000);

const wave = document.querySelector<SVGPathElement>('#wave-line');
const wavePanel = document.querySelector<HTMLElement>('.wave-panel');
let pointer = 0;
if (wave && wavePanel && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  wavePanel.addEventListener('pointermove', event => {
    if (event.pointerType === 'mouse') pointer = (event.clientY - wavePanel.getBoundingClientRect().top) / wavePanel.clientHeight - .5;
  }, { passive: true });
  wavePanel.addEventListener('pointerleave', () => { pointer = 0; });
  let last = 0;
  function animate(time: number) {
    if (wave && wavePanel && time - last > 33 && wavePanel.getBoundingClientRect().bottom > 0 && wavePanel.getBoundingClientRect().top < innerHeight) {
      last = time;
      const amplitude = 30 + pointer * 24;
      let d = '';
      for (let x = 0; x <= 600; x += 6) {
        const y = 175 + (Math.sin(x * .039 - time * .0018) + .28 * Math.sin(x * .105 + time * .0011)) * amplitude * (.26 + .74 * Math.sin(Math.PI * x / 600) ** 2);
        d += `${x ? 'L' : 'M'}${x} ${y.toFixed(1)}`;
      }
      wave.setAttribute('d', d);
    }
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
}

// The original text stays in the DOM for screen readers and for a no-JS page.
function splitText(el: HTMLElement, byWord = false) {
  const nodes: Text[] = [];
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
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
const allSections = gsap.utils.toArray<HTMLElement>('.trace-section');
const main = document.querySelector<HTMLElement>('main');
const trace = document.querySelector<SVGSVGElement>('#signal-trace');
const traceBase = document.querySelector<SVGPathElement>('#trace-base');
const traceActive = document.querySelector<SVGPathElement>('#trace-active');
let traceLength = 0;
function updateTrace() {
  if (!main || !trace || !traceBase || !traceActive) return;
  const box = main.getBoundingClientRect();
  const width = box.width;
  const height = main.scrollHeight;
  const x = width < 768 ? 14 : Math.max(20, (width - 1260) / 2 - 24);
  const ys = allSections.slice(1).map(section => section.getBoundingClientRect().top - box.top + 32);
  const origin = document.querySelector('#chip-trace-origin')?.getBoundingClientRect();
  const sx = origin ? origin.left - box.left : x;
  const sy = origin ? origin.top - box.top : 20;
  let d = `M ${sx} ${sy} V ${ys[0] || 100} H ${x}`;
  ys.forEach((y, i) => { d += ` V ${y} H ${x + (i % 2 ? 18 : 0)}`; });
  d += ` V ${height - 20}`;
  trace.setAttribute('viewBox', `0 0 ${width} ${height}`);
  trace.style.height = `${height}px`;
  traceBase.setAttribute('d', d);
  traceActive.setAttribute('d', d);
  traceLength = traceActive.getTotalLength();
  gsap.set(traceActive, { strokeDasharray: traceLength });
  allSections.forEach((section, i) => {
    const via = section.querySelector<HTMLElement>('.trace-via');
    if (via) via.style.left = `${x + (i % 2 ? 18 : 0) - (section.getBoundingClientRect().left - box.left)}px`;
  });
}

function makeWipes() {
  allSections.slice(1).forEach(section => {
    const bar = document.createElement('div');
    bar.className = 'scene-wipe';
    bar.setAttribute('aria-hidden', 'true');
    section.prepend(bar);
    gsap.fromTo(bar, { scaleX: 0, transformOrigin: 'left center' }, {
      scaleX: 1, ease: 'none', scrollTrigger: { trigger: section, start: 'top bottom', end: 'top 55%', scrub: true }
    });
    gsap.to(bar, { scaleX: 0, transformOrigin: 'right center', ease: 'none', scrollTrigger: { trigger: section, start: 'top 55%', end: 'top 25%', scrub: true } });
  });
}

function heroScene(mobile: boolean) {
  const hero = document.querySelector<HTMLElement>('.hero');
  const title = document.querySelector<HTMLElement>('#hero-title');
  const chip = document.querySelector<SVGElement>('.bios-chip');
  const iris = document.querySelector<HTMLElement>('.chip-dive-iris');
  if (!hero || !title || !chip || !iris) return;
  title.setAttribute('aria-label', 'Tim Otholt.');
  const letters = [...splitText(title.querySelector<HTMLElement>('.name-tim')!), ...splitText(title.querySelector<HTMLElement>('.name-otholt')!)];
  const seed = (n: number) => Math.sin(n * 44.17) * 0.5 + 0.5;
  const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: hero, start: 'top top', end: '+=150%', pin: true, scrub: 0.6, anticipatePin: 1 } });
  tl.to(letters, { x: i => (seed(i + 1) - .5) * (mobile ? 950 : 1800), y: i => (seed(i + 19) - .5) * 1000, z: i => -500 + seed(i + 43) * 1100, rotation: i => (seed(i + 61) - .5) * 210, rotationY: i => (seed(i + 89) - .5) * 170, opacity: 0, stagger: .012, force3D: true, duration: .64 }, 0);
  tl.to('.hero-copy > :not(h1)', { opacity: 0, y: -100, stagger: .015, duration: .28 }, 0);
  tl.to('.wave-panel > :not(.bios-chip)', { opacity: 0, duration: .22 }, .10);
  tl.to(chip, { scale: mobile ? 31 : 25, xPercent: -50, yPercent: -50, transformOrigin: '50% 50%', force3D: true, duration: .75 }, .10);
  tl.fromTo('.hero-race-traces path', { strokeDashoffset: 500, opacity: 0 }, { strokeDashoffset: 0, opacity: 1, stagger: .018, duration: .35 }, .26);
  tl.to('.chip-pulses path', { strokeDashoffset: -250, duration: .5 }, .12);
  tl.fromTo(iris, { scale: 0, opacity: 1 }, { scale: 1, opacity: 1, duration: .22, force3D: true }, .71);
  tl.to(chip, { opacity: 0, duration: .10 }, .86);
}

function profileScene(mobile: boolean) {
  const section = document.querySelector<HTMLElement>('#about');
  const heading = section?.querySelector<HTMLElement>('h2');
  if (!section || !heading) return;
  heading.setAttribute('aria-label', "From firmware to what's next.");
  const words = splitText(heading, true);
  const tl = gsap.timeline({ scrollTrigger: { trigger: section, start: 'top top', end: '+=120%', pin: true, scrub: .6, anticipatePin: 1 } });
  words.forEach((word, i) => tl.from(word, { x: (i % 2 ? 1 : -1) * innerWidth * 1.2, skewX: i % 2 ? -35 : 35, opacity: 0, force3D: true, duration: .25, ease: 'power3.out' }, i * .13));
  tl.from('.about-grid > div', { y: mobile ? 180 : 260, opacity: 0, duration: .35 }, .38);
  section.querySelectorAll<HTMLElement>('.metric-value').forEach((value, i) => {
    const target = Number(value.dataset.count);
    const decimal = value.dataset.count?.includes('.') ? 1 : 0;
    const counter = { value: 0 };
    tl.from(value, { scale: 4, opacity: 0, transformOrigin: 'center bottom', force3D: true, duration: .2 }, .56 + i * .13);
    tl.to(counter, { value: target, duration: .2, onUpdate: () => { value.textContent = counter.value.toFixed(decimal).padStart(decimal ? 3 : 2, '0'); } }, .56 + i * .13);
  });
}

function projectScene(mobile: boolean) {
  const section = document.querySelector<HTMLElement>('#projects');
  const cards = gsap.utils.toArray<HTMLElement>('.project-card');
  const progress = section?.querySelector<HTMLElement>('.project-progress');
  if (!section || !cards.length || !progress) return;
  section.classList.add('scene-projects');
  const count = cards.length;
  const tl = gsap.timeline({ scrollTrigger: { trigger: section, start: 'top top', end: `+=${count * (mobile ? 90 : 80)}%`, pin: true, scrub: .6, anticipatePin: 1, onUpdate: self => {
    const activeIndex = Math.min(count - 1, Math.round(self.progress * (count - 1)));
    progress.textContent = `TO-${String(activeIndex + 1).padStart(3, '0')} / ${String(count).padStart(3, '0')}`;
    cards.forEach((card, i) => { card.style.pointerEvents = i === activeIndex ? 'auto' : 'none'; card.style.zIndex = String(count + (i === activeIndex ? count : i)); });
  } } });
  cards.forEach((card, i) => {
    const at = i;
    if (mobile) {
      tl.fromTo(card, { x: (i % 2 ? 1 : -1) * innerWidth * .9, y: 80, rotateY: i % 2 ? 70 : -70, rotationZ: i % 2 ? 15 : -15, scale: .83, opacity: 0 }, { x: 0, y: 0, rotateY: 0, rotationZ: 0, scale: 1, opacity: 1, duration: .65, force3D: true }, at);
      if (i < count - 1) tl.to(card, { scale: .88, y: -28, opacity: .42, duration: .55, force3D: true }, at + .74);
    } else {
      tl.fromTo(card, { x: innerWidth * .40, y: innerHeight * .7, rotationY: 72, rotationZ: 9, z: -550, opacity: .18 }, { x: 0, y: 0, rotationY: 0, rotationZ: 0, z: 0, opacity: 1, duration: .72, force3D: true }, at);
      if (i < count - 1) tl.to(card, { x: -innerWidth * .42, y: -innerHeight * .72, rotationY: -72, rotationZ: -9, z: -550, opacity: .14, duration: .72, force3D: true }, at + .76);
    }
  });
  tl.to({}, { duration: .5 });
}

function skillsScene(mobile: boolean) {
  const section = document.querySelector<HTMLElement>('#skills');
  if (!section) return;
  const rows = gsap.utils.toArray<HTMLElement>('.pinout-row');
  const sweep = section.querySelector<HTMLElement>('.logic-sweep');
  const tl = gsap.timeline({ scrollTrigger: { trigger: section, start: 'top top', end: '+=130%', pin: true, scrub: .6, anticipatePin: 1 } });
  if (sweep) tl.fromTo(sweep, { xPercent: -110, opacity: 0 }, { xPercent: 110, opacity: 1, duration: 1, ease: 'none' }, 0);
  rows.forEach((row, i) => {
    tl.from(row, { x: (i % 2 ? 1 : -1) * innerWidth * (mobile ? .65 : .9), opacity: .1, skewX: i % 2 ? -15 : 15, duration: .3, force3D: true }, .12 + i * .18);
    tl.fromTo(row, { backgroundColor: 'transparent' }, { backgroundColor: 'var(--accent)', duration: .05, yoyo: true, repeat: 1 }, .25 + i * .18);
  });
}

function postScene() {
  const section = document.querySelector<HTMLElement>('#education');
  const panel = section?.querySelector<HTMLElement>('.post-panel');
  if (!section || !panel) return;
  const lines = gsap.utils.toArray<HTMLElement>('.post-line');
  const tl = gsap.timeline({ scrollTrigger: { trigger: section, start: 'top 75%', end: 'top 20%', scrub: .6 } });
  tl.from(panel, { scaleY: .004, opacity: .45, transformOrigin: 'center center', duration: .7, force3D: true });
  tl.to(panel, { opacity: .55, duration: .025, yoyo: true, repeat: 3 }, .44);
  ScrollTrigger.create({ trigger: section, start: 'top 30%', once: true, onEnter: () => {
    lines.forEach((line, i) => gsap.fromTo(line, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: .28, delay: i * .18, ease: 'steps(20)' }));
  } });
}

function experienceScene(mobile: boolean) {
  const rows = gsap.utils.toArray<HTMLElement>('.revision-row');
  rows.forEach((row, i) => gsap.from(row, { x: (i % 2 ? 1 : -1) * innerWidth * (mobile ? .4 : .8), rotation: i % 2 ? 12 : -12, opacity: 0, force3D: true, ease: 'none', scrollTrigger: { trigger: row, start: 'top 95%', end: 'top 35%', scrub: .6 } }));
}

function contactScene() {
  const section = document.querySelector<HTMLElement>('#contact');
  const mail = section?.querySelector<HTMLElement>('.contact-mail');
  if (!section || !mail) return;
  // Preserve the arrow and link semantics; split only the text node.
  const label = document.createElement('span');
  label.className = 'mail-label';
  label.textContent = 'tim@timotholt.com';
  mail.replaceChild(label, mail.firstChild!);
  const letters = splitText(label);
  gsap.from(letters, { x: i => Math.sin((i + 1) * 13.2) * innerWidth * .8, y: i => Math.cos((i + 1) * 9.1) * innerHeight * .7, z: i => Math.sin(i * 7.1) * 700, rotationY: i => Math.sin(i * 4.7) * 130, opacity: 0, stagger: .018, force3D: true, ease: 'none', scrollTrigger: { trigger: section, start: 'top 75%', end: 'top 15%', scrub: .6 } });
}

mm.add('(prefers-reduced-motion: reduce)', () => {
  updateTrace();
  gsap.set(traceActive, { strokeDashoffset: 0 });
});
mm.add({ desktop: '(min-width: 768px) and (prefers-reduced-motion: no-preference)', mobile: '(max-width: 767px) and (prefers-reduced-motion: no-preference)' }, context => {
  const mobile = !!context.conditions?.mobile;
  document.documentElement.classList.add('cinematic');
  heroScene(mobile);
  profileScene(mobile);
  projectScene(mobile);
  skillsScene(mobile);
  postScene();
  experienceScene(mobile);
  contactScene();
  makeWipes();
  updateTrace();
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: self => {
    if (traceActive && traceLength) gsap.set(traceActive, { strokeDashoffset: traceLength * (1 - self.progress) });
  } });
  requestAnimationFrame(() => ScrollTrigger.refresh());
  return () => { document.documentElement.classList.remove('cinematic'); document.querySelectorAll('.scene-wipe').forEach(el => el.remove()); };
});

ScrollTrigger.addEventListener('refresh', updateTrace);
addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
document.fonts.ready.then(() => ScrollTrigger.refresh());

// Native anchor navigation remains native scrolling; pins only change document spacing.
document.querySelectorAll<HTMLAnchorElement>('a[href^="#"], a[href^="/#"]').forEach(link => {
  link.addEventListener('click', event => {
    const id = link.hash.slice(1);
    const target = id && document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    history.pushState(null, '', `#${id}`);
    target.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
});
