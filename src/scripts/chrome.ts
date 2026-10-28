import { sectionByKey, type SectionKey } from "../data/sections";

const themeMeta = document.querySelector<HTMLMetaElement>(
  'meta[name="theme-color"]',
);

export function updateChrome(section: Element | null) {
  // Browser chrome (mobile address bar, app panes) follows the current section's color.
  const key = section?.getAttribute("data-section-key") as SectionKey | null;
  if (
    themeMeta &&
    key &&
    sectionByKey[key] &&
    themeMeta.content !== sectionByKey[key].bg
  ) {
    themeMeta.content = sectionByKey[key].bg;
    // The pinned menu takes on the section it sits over, so it stays readable on every color.
    const header = document.querySelector<HTMLElement>(".site-header");
    header?.style.setProperty("--nav-bg", sectionByKey[key].bg);
    header?.style.setProperty("--nav-fg", sectionByKey[key].fg);
    header?.style.setProperty("--nav-accent", sectionByKey[key].accent);
    // Overscroll areas and tinted browser frames show the root background; keep it on the current section's color.
    document.documentElement.style.backgroundColor = sectionByKey[key].bg;
    document.body.style.backgroundColor = sectionByKey[key].bg;
  }
}
