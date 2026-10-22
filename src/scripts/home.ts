const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const clock = document.getElementById('local-clock');
function updateClock() {
  if (clock) clock.textContent = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date());
}
updateClock();
setInterval(updateClock, 30_000);

const main = document.querySelector('main');
const trace = document.getElementById('signal-trace') as SVGSVGElement | null;
const base = document.getElementById('trace-base') as SVGPathElement | null;
const active = document.getElementById('trace-active') as SVGPathElement | null;
const sections = [...document.querySelectorAll<HTMLElement>('.trace-section')];
let traceLength = 0;
let scrollQueued = false;
let resizeTimer = 0;
function geometry() {
  if (!main || !trace || !base || !active) return;
  const mainBox = main.getBoundingClientRect();
  const width = mainBox.width;
  const height = main.scrollHeight;
  const left = width < 700 ? 14 : Math.max(20, (width - 1260) / 2 - 24);
  const offsets = sections.slice(1).map(section => section.getBoundingClientRect().top - mainBox.top + 34);
  const origin = document.getElementById('chip-trace-origin')?.getBoundingClientRect();
  const startX = origin ? origin.left + origin.width / 2 - mainBox.left : left;
  const startY = origin ? origin.top + origin.height / 2 - mainBox.top : 16;
  let d = `M ${startX} ${startY} H ${left}`;
  for (let i = 0; i < offsets.length; i++) {
    const y = Math.max(20, offsets[i]);
    const x = left + (width < 700 ? 0 : (i + 1) % 2 ? 18 : 0);
    d += ` V ${Math.max(16, y - 22)} H ${x} V ${y}`;
  }
  d += ` V ${height - 20}`;
  trace.setAttribute('viewBox', `0 0 ${width} ${height}`);
  trace.style.height = `${height}px`;
  base.setAttribute('d', d);
  active.setAttribute('d', d);
  traceLength = active.getTotalLength();
  active.style.strokeDasharray = `${traceLength}`;
  for (const section of sections) {
    const via = section.querySelector<HTMLElement>('.trace-via');
    if (via) via.style.left = `${left + (width < 700 ? 0 : sections.indexOf(section) % 2 ? 18 : 0) - (section.getBoundingClientRect().left - mainBox.left)}px`;
  }
  progress();
}
function progress() {
  scrollQueued = false;
  if (!main || !active || !traceLength) return;
  if (reduceMotion.matches) { active.style.strokeDashoffset = '0'; return; }
  const top = main.getBoundingClientRect().top;
  const reached = Math.max(0, Math.min(main.scrollHeight, -top + innerHeight * .72));
  active.style.strokeDashoffset = `${traceLength * (1 - reached / main.scrollHeight)}`;
}
function onScroll() {
  if (scrollQueued) return;
  scrollQueued = true;
  requestAnimationFrame(progress);
}
if (main && trace) {
  geometry();
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = window.setTimeout(geometry, 140); }, { passive: true });
  reduceMotion.addEventListener('change', progress);
}

const postPanel = document.querySelector<HTMLElement>('.post-panel');
if (postPanel && !reduceMotion.matches && 'IntersectionObserver' in window) {
  postPanel.classList.add('post-ready');
  const postObserver = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) {
      entry.target.classList.add('post-booting');
      postObserver.unobserve(entry.target);
    }
  }, { threshold: .15 });
  postObserver.observe(postPanel);
  reduceMotion.addEventListener('change', () => { if (reduceMotion.matches) postPanel.classList.remove('post-ready'); });
}

if ('IntersectionObserver' in window) {
  const viaObserver = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add('is-active'); viaObserver.unobserve(entry.target); }
  }, { rootMargin: '0px 0px -20% 0px' });
  sections.forEach(section => viaObserver.observe(section));
  const nativeReveal = CSS.supports('animation-timeline: view()');
  if (!nativeReveal && !reduceMotion.matches) {
    const revealObserver = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add('revealed'); revealObserver.unobserve(entry.target); }
    }, { threshold: .08 });
    document.querySelectorAll<HTMLElement>('[data-reveal]').forEach(el => { el.classList.add('js-reveal'); revealObserver.observe(el); });
  }
  const countObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const el = entry.target as HTMLElement;
      countObserver.unobserve(el);
      if (reduceMotion.matches) continue;
      const target = Number(el.dataset.count);
      const decimal = el.dataset.count?.includes('.') ? 1 : 0;
      const start = performance.now();
      function frame(now: number) {
        const t = Math.min(1, (now - start) / 900);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = (target * eased).toFixed(decimal).padStart(decimal ? 3 : 2, '0');
        if (t < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }
  }, { threshold: .5 });
  document.querySelectorAll<HTMLElement>('[data-count]').forEach(el => countObserver.observe(el));
}

const wave = document.getElementById('wave-line') as SVGPathElement | null;
const wavePanel = document.querySelector<HTMLElement>('.wave-panel');
let pointer = 0;
let waveVisible = true;
if (wave && wavePanel && !reduceMotion.matches) {
  wavePanel.addEventListener('pointermove', event => { if (event.pointerType === 'mouse') pointer = (event.clientY - wavePanel.getBoundingClientRect().top) / wavePanel.clientHeight - .5; }, { passive: true });
  wavePanel.addEventListener('pointerleave', () => { pointer = 0; });
  if ('IntersectionObserver' in window) new IntersectionObserver(([entry]) => { waveVisible = entry.isIntersecting; }, { rootMargin: '100px' }).observe(wavePanel);
  let last = 0;
  function animate(time: number) {
    if (waveVisible && time - last > 32) {
      last = time;
      const scrollPhase = scrollY * .003;
      const amplitude = 30 + pointer * 24 + Math.sin(scrollPhase) * 8;
      let d = '';
      for (let x = 0; x <= 600; x += 5) {
        const envelope = .26 + .74 * Math.sin(Math.PI * x / 600) ** 2;
        const y = 175 + (Math.sin(x * .039 - time * .0018 + scrollPhase) + .28 * Math.sin(x * .105 + time * .0011)) * amplitude * envelope;
        d += `${x ? 'L' : 'M'}${x} ${y.toFixed(1)}`;
      }
      wave?.setAttribute('d', d);
    }
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
}
