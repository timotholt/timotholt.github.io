// Phone menu: the Menu button opens the section list; picking a section, Escape, or a click outside closes it.
const header = document.querySelector<HTMLElement>(".site-header");
const toggle = header?.querySelector<HTMLButtonElement>(".nav-toggle");

if (header && toggle) {
  const setOpen = (open: boolean) => {
    toggle.setAttribute("aria-expanded", String(open));
    header.classList.toggle("nav-open", open);
  };
  toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
  header.querySelectorAll("nav a").forEach((link) => link.addEventListener("click", () => setOpen(false)));
  addEventListener("keydown", (event) => {
    if (event.key === "Escape" && header.classList.contains("nav-open")) {
      setOpen(false);
      toggle.focus();
    }
  });
  addEventListener("click", (event) => {
    if (!header.contains(event.target as Node)) setOpen(false);
  });
}
