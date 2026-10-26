import { sectionByKey, type SectionKey } from "../data/sections";

// Background grid glow: squares under the pointer light up in the current section's accent, then fade.
// Mouse/trackpad only, and off for reduced motion. The grid lines themselves are CSS (base.css, layout.css).
const canvas = document.querySelector<HTMLCanvasElement>(".grid-glow");
const fine = matchMedia("(hover: hover) and (pointer: fine)");
const still = matchMedia("(prefers-reduced-motion: reduce)");

if (canvas) {
  const ctx = canvas.getContext("2d")!;
  const TILE = 40; // matches background-size in base.css and layout.css
  const MAX_ALPHA = 0.22;
  const FADE = 0.012; // per frame; a lit square fades out in about 1.3s
  const NEIGHBORS = [
    [0, 0, 1],
    [-1, 0, 0.45], [1, 0, 0.45], [0, -1, 0.45], [0, 1, 0.45],
    [-1, -1, 0.2], [1, -1, 0.2], [-1, 1, 0.2], [1, 1, 0.2],
  ] as const;
  const tiles = new Map<string, { a: number; color: string }>();
  const paperAccent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
  let frame = 0;

  const resize = () => {
    const dpr = devicePixelRatio || 1;
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const colorAt = (x: number, y: number) => {
    const key = document.elementFromPoint(x, y)?.closest("[data-section-key]")?.getAttribute("data-section-key") as SectionKey | null;
    return key && sectionByKey[key] ? sectionByKey[key].accent : paperAccent;
  };

  const draw = () => {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (const [key, tile] of tiles) {
      const [c, r] = key.split(",").map(Number);
      ctx.globalAlpha = tile.a * MAX_ALPHA;
      ctx.fillStyle = tile.color;
      ctx.fillRect(c * TILE + 1, r * TILE + 1, TILE - 1, TILE - 1);
      tile.a -= FADE;
      if (tile.a <= 0) tiles.delete(key);
    }
    frame = tiles.size ? requestAnimationFrame(draw) : 0;
  };

  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== "mouse" || !fine.matches || still.matches) return;
    const col = Math.floor(e.clientX / TILE);
    const row = Math.floor(e.clientY / TILE);
    const color = colorAt(e.clientX, e.clientY);
    for (const [dc, dr, strength] of NEIGHBORS) {
      const key = `${col + dc},${row + dr}`;
      const tile = tiles.get(key);
      if (tile) {
        tile.a = Math.max(tile.a, strength);
        tile.color = color;
      } else tiles.set(key, { a: strength, color });
    }
    if (!frame) frame = requestAnimationFrame(draw);
  };

  resize();
  addEventListener("resize", resize, { passive: true });
  addEventListener("pointermove", onMove, { passive: true });
}
