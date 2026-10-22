import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const clock = document.getElementById('local-clock');
function updateClock() {
  if (clock) clock.textContent = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date());
}
updateClock();
setInterval(updateClock, 30_000);

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
const sections = gsap.utils.toArray<HTMLElement>('.trace-section');
const railFill = document.querySelector<HTMLElement>('.rail-fill');
const railDots = document.querySelector<HTMLElement>('.rail-dots');
const percent = document.querySelector<HTMLElement>('#scroll-percent');
const railLabel = document.querySelector<HTMLElement>('#rail-section');
sections.forEach((_, i) => {
  const dot = document.createElement('span');
  dot.className = 'rail-dot'; dot.dataset.section = String(i);
  railDots?.append(dot);
});
function updateRail() {
  const range = Math.max(1, document.documentElement.scrollHeight - innerHeight);
  const progress = Math.min(1, Math.max(0, scrollY / range));
  if (railFill) railFill.style.transform = `scaleY(${progress})`;
  if (percent) percent.textContent = `${String(Math.round(progress * 100)).padStart(3, '0')}%`;
  let current = 0;
  sections.forEach((section, i) => {
    const p = Math.min(1, Math.max(0, (section.offsetTop - innerHeight * .5) / range));
    const dot = railDots?.children[i] as HTMLElement | undefined;
    if (dot) { dot.style.top = `${p * 100}%`; dot.classList.toggle('passed', progress >= p); }
    if (section.getBoundingClientRect().top < innerHeight * .52) current = i;
  });
  const label = sections[current]?.querySelector('.section-label')?.textContent?.trim() || '00.0 HOME';
  if (railLabel) railLabel.textContent = label.replace(' / ', ' ');
  const readout = document.querySelector<HTMLElement>('.rail-readout');
  // Keep the readout clear of the header (logo) while it is on screen.
  const headerBottom = document.querySelector('.site-header')?.getBoundingClientRect().bottom ?? 0;
  if (readout) readout.style.top = `${Math.max(24, headerBottom + 18, Math.min(innerHeight - 35, progress * innerHeight))}px`;
}
addEventListener('scroll', updateRail, { passive: true });
addEventListener('resize', updateRail);
ScrollTrigger.addEventListener('refresh', updateRail);
updateRail();

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
  gsap.to('.hero .portrait-caption', { y:-45, opacity:.55, ease:'none', scrollTrigger:{ trigger:'.hero', start:'top top', end:'bottom top', scrub:true } });
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
    gsap.from(metric,{x:(i%2?1:-1)*innerWidth*(mobile?.4:.8),scale:3,opacity:0,ease:'none',scrollTrigger:{trigger:metric,start:'top 95%',end:'top 40%',scrub:.6}});
    const el=metric.querySelector<HTMLElement>('.metric-value');if(!el)return;
    const target=Number(el.dataset.count);const decimal=el.dataset.count?.includes('.')?1:0;const counter={value:0};
    gsap.to(counter,{value:target,ease:'none',scrollTrigger:{trigger:metric,start:'top 95%',end:'top 40%',scrub:.6},onUpdate:()=>{el.textContent=counter.value.toFixed(decimal).padStart(decimal?3:2,'0')}});
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
  let label = mail.querySelector<HTMLElement>('.mail-label');
  if (!label) { label = document.createElement('span'); label.className = 'mail-label'; label.textContent = 'tim@timotholt.com'; mail.replaceChild(label, mail.firstChild!); }
  const letters = splitText(label);
  gsap.from(letters, { x: i => Math.sin((i + 1) * 13.2) * innerWidth * .8, y: i => Math.cos((i + 1) * 9.1) * innerHeight * .7, z: i => Math.sin(i * 7.1) * 700, rotationY: i => Math.sin(i * 4.7) * 130, opacity: 0, stagger: .018, force3D: true, ease: 'none', scrollTrigger: { trigger: section, start: 'top 75%', end: 'top 15%', scrub: .6 } });
}


mm.add('(prefers-reduced-motion: reduce)', () => { gsap.set('.portrait', {'--scan':'50%'}); updateRail(); });
mm.add({desktop:'(min-width: 768px) and (prefers-reduced-motion: no-preference)',mobile:'(max-width: 767px) and (prefers-reduced-motion: no-preference)'}, context => {
  const mobile=!!context.conditions?.mobile;
  heroScene(); chipScene(); profileScene(mobile); projectScene(mobile); skillsScene(mobile); postScene(); experienceScene(mobile); contactScene();
  gsap.to('body',{backgroundPositionY:'200px',ease:'none',scrollTrigger:{start:0,end:'max',scrub:true}});
  requestAnimationFrame(()=>ScrollTrigger.refresh());
});
addEventListener('load',()=>ScrollTrigger.refresh(),{once:true});
document.fonts.ready.then(()=>ScrollTrigger.refresh());
document.querySelectorAll<HTMLAnchorElement>('a[href^="#"], a[href^="/#"]').forEach(link => {
  link.addEventListener('click', event => { const id=link.hash.slice(1);const target=id&&document.getElementById(id);if(!target)return;event.preventDefault();history.pushState(null,'',`#${id}`);target.scrollIntoView({behavior:'instant',block:'start'}); });
});
