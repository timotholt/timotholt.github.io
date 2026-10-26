import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { updateRail } from "./rail";
import { readerIndex, setRestoreIndex } from "./state";
import { glideToY } from "./keys";

function splitText(el: HTMLElement, byWord = false) {
  const nodes: Text[] = [];
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    if (!node.parentElement?.closest(".scene-letter, .scene-word"))
      nodes.push(node);
  }
  const spans: HTMLSpanElement[] = [];
  nodes.forEach((node) => {
    const fragment = document.createDocumentFragment();
    const bits = byWord
      ? node.textContent?.match(/\S+|\s+/g) || []
      : [...(node.textContent || "")];
    bits.forEach((bit) => {
      if (/^\s+$/.test(bit)) {
        fragment.append(document.createTextNode(bit));
        return;
      }
      const span = document.createElement("span");
      span.className = byWord ? "scene-word" : "scene-letter";
      span.setAttribute("aria-hidden", "true");
      span.textContent = bit;
      fragment.append(span);
      spans.push(span);
    });
    node.replaceWith(fragment);
  });
  return spans;
}

const mm = gsap.matchMedia();

function heroScene() {
  const title = document.querySelector<HTMLElement>("#hero-title");
  if (!title) return;
  title.setAttribute("aria-label", "Tim Otholt");
  const letters = [
    ...splitText(title.querySelector<HTMLElement>(".name-tim")!),
    ...splitText(title.querySelector<HTMLElement>(".name-otholt")!),
  ];
  gsap.from(letters, {
    x: (i) => (i % 2 ? 1 : -1) * Math.min(innerWidth * 0.65, 600),
    opacity: 0,
    duration: 0.9,
    stagger: 0.045,
    ease: "power3.out",
    clearProps: "transform,opacity",
  });
}
function profileScene(mobile: boolean) {
  const heading = document.querySelector<HTMLElement>("#about h2");
  if (!heading) return;
  heading.setAttribute("aria-label", "From firmware to what's next.");
  // Timed to the slot, not the words: the intro is centered, so it must be settled when the slot lands.
  const intro = heading.closest(".feature-slot") || heading;
  splitText(heading, true).forEach((word, i) =>
    gsap.from(word, {
      x: () => (i % 2 ? 1 : -1) * innerWidth * (mobile ? 0.4 : 0.8),
      skewX: i % 2 ? -25 : 25,
      opacity: 0,
      ease: "none",
      scrollTrigger: {
        invalidateOnRefresh: true,
        trigger: intro,
        start: "top 95%",
        end: "top 25%",
        scrub: 0.6,
      },
    }),
  );
  gsap.from(".hl-copy", {
    x: () => (mobile ? innerWidth * 0.4 : innerWidth * 0.8),
    opacity: 0,
    ease: "none",
    scrollTrigger: {
      invalidateOnRefresh: true,
      trigger: intro,
      start: "top 90%",
      end: "top 20%",
      scrub: 0.6,
    },
  });
  // Proof cards fly in from alternating sides and settle as their slot lands; numbers count up on the way.
  document.querySelectorAll<HTMLElement>(".proof-card").forEach((card, i) => {
    const slot = card.closest(".feature-slot") || card;
    gsap.from(card, {
      x: () => (i % 2 ? 1 : -1) * innerWidth * (mobile ? 0.4 : 0.6),
      opacity: 0,
      ease: "none",
      scrollTrigger: {
        invalidateOnRefresh: true,
        trigger: slot,
        start: `top ${95 - i * 5}%`,
        end: `top ${35 - i * 5}%`,
        scrub: 0.6,
      },
    });
    const el = card.querySelector<HTMLElement>(".proof-value[data-count]");
    if (!el) return;
    const target = Number(el.dataset.count);
    const decimal = el.dataset.count?.includes(".") ? 1 : 0;
    const counter = { value: 0 };
    gsap.to(counter, {
      value: target,
      ease: "none",
      scrollTrigger: {
        trigger: slot,
        start: "top 95%",
        end: "top 35%",
        scrub: 0.6,
      },
      onUpdate: () => {
        el.textContent = counter.value.toLocaleString("en-US", {
          minimumFractionDigits: decimal,
          maximumFractionDigits: decimal,
        });
      },
    });
  });
}
function projectScene(mobile: boolean) {
  document.querySelectorAll<HTMLElement>(".project-card").forEach((card, i) => {
    const sign = i % 2 ? 1 : -1;
    // Time to the slot: on phones the section heading shares the first slot and pushes the card down.
    const slot = card.closest<HTMLElement>(".feature-slot") || card;
    gsap.from(card, {
      x: () => sign * innerWidth * (mobile ? 0.4 : 0.4),
      rotationY: sign * (mobile ? 35 : 70),
      rotationZ: sign * 6,
      z: -400,
      opacity: 0,
      ease: "none",
      scrollTrigger: {
        invalidateOnRefresh: true,
        trigger: slot,
        start: "top bottom",
        end: "top 20%",
        scrub: 0.6,
      },
    });
    // Explicit start values: a plain .to() would capture the entrance's opacity:0 start state and hide the card just past landing.
    gsap.fromTo(
      card,
      { y: 0, z: 0, opacity: 1 },
      {
        y: -55,
        z: -90,
        opacity: 0.72,
        ease: "none",
        immediateRender: false,
        scrollTrigger: {
          trigger: slot,
          start: "top top",
          end: "bottom top",
          scrub: 0.6,
        },
      },
    );
  });
}
function skillsScene(mobile: boolean) {
  // Same entrance as the proof cards, timed to each skills page.
  document.querySelectorAll<HTMLElement>(".skill-slot").forEach((slot) => {
    slot
      .querySelectorAll<HTMLElement>(".skill-card")
      .forEach((card, i) =>
        gsap.from(card, {
          x: () => (i % 2 ? 1 : -1) * innerWidth * (mobile ? 0.4 : 0.6),
          opacity: 0,
          ease: "none",
          scrollTrigger: {
            invalidateOnRefresh: true,
            trigger: slot,
            start: `top ${95 - i * 8}%`,
            end: `top ${35 - i * 6}%`,
            scrub: 0.6,
          },
        }),
      );
  });
}

function credScene(mobile: boolean) {
  // Field-notes recipe per item, timed to the section slot so the list is settled when it lands.
  document.querySelectorAll<HTMLElement>(".cred-section").forEach((section) => {
    section
      .querySelectorAll<HTMLElement>(".cred-item")
      .forEach((item, i) =>
        gsap.from(item, {
          x: () => (i % 2 ? 1 : -1) * innerWidth * (mobile ? 0.4 : 0.8),
          rotation: i % 2 ? 20 : -20,
          opacity: 0,
          force3D: true,
          ease: "none",
          scrollTrigger: {
            invalidateOnRefresh: true,
            trigger: section,
            start: `top ${95 - i * 8}%`,
            end: `top ${30 - i * 6}%`,
            scrub: 0.6,
          },
        }),
      );
  });
}

function experienceScene(mobile: boolean) {
  // Field-notes values, staggered per row and timed to the page slot so a page is settled when it lands.
  document.querySelectorAll<HTMLElement>(".job-page").forEach((page) => {
    page
      .querySelectorAll<HTMLElement>(".job-row")
      .forEach((row, i) =>
        gsap.from(row, {
          x: () => (i % 2 ? 1 : -1) * innerWidth * (mobile ? 0.4 : 0.8),
          rotation: i % 2 ? 12 : -12,
          opacity: 0,
          force3D: true,
          ease: "none",
          scrollTrigger: {
            invalidateOnRefresh: true,
            trigger: page,
            start: `top ${95 - i * 8}%`,
            end: `top ${30 - i * 6}%`,
            scrub: 0.6,
          },
        }),
      );
  });
}

mm.add("(prefers-reduced-motion: reduce)", () => {
  updateRail();
});
mm.add(
  {
    desktop: "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
    mobile: "(max-width: 767px) and (prefers-reduced-motion: no-preference)",
  },
  (context) => {
    const mobile = !!context.conditions?.mobile;
    heroScene();
    profileScene(mobile);
    projectScene(mobile);
    skillsScene(mobile);
    credScene(mobile);
    experienceScene(mobile);
    gsap.to("body", {
      backgroundPositionY: "200px",
      ease: "none",
      scrollTrigger: { start: 0, end: "max", scrub: true },
    });
    requestAnimationFrame(() => ScrollTrigger.refresh());
    // Leaving this breakpoint rebuilds every scene; remember where the reader was.
    return () => {
      setRestoreIndex(readerIndex);
    };
  },
);
addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
document.fonts.ready.then(() => ScrollTrigger.refresh());
document
  .querySelectorAll<HTMLAnchorElement>('a[href^="#"], a[href^="/#"]')
  .forEach((link) => {
    link.addEventListener("click", (event) => {
      const id = link.hash.slice(1);
      const target = id && document.getElementById(id);
      if (!target) return;
      event.preventDefault();
      history.pushState(null, "", `#${id}`);
      // Glide there with the same spring as the arrow keys (instant under reduced motion).
      glideToY(target.getBoundingClientRect().top + scrollY);
    });
  });
