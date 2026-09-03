import { mix, shade, type Theme } from "./theme";
import { PixelSelf, SELF_FRAME_W, SELF_PAD_X, SELF_PAD_Y } from "./self";

function px(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  scale: number,
) {
  ctx.fillStyle = color;
  ctx.fillRect(x * scale, y * scale, w * scale, h * scale);
}

export function drawRobe(
  ctx: CanvasRenderingContext2D,
  buddy: PixelSelf,
  scale: number,
  theme: Theme,
) {
  if (!theme.robeOn) return;

  const { gy, pose } = buddy.robePose();
  const robe = theme.robe;
  const dark = shade(robe, 0.68);
  const lite = mix(robe, "#f4f7ff", 0.42);
  const sash = theme.sash;
  const sashDark = shade(theme.sash, 0.82);
  const trim = mix(robe, "#ffffff", 0.62);
  const stripe = shade(robe, 0.52);

  const dx = (Math.round(buddy.x) - SELF_PAD_X) * scale;
  const dy = (Math.round(buddy.y) - SELF_PAD_Y) * scale;
  const dw = SELF_FRAME_W * scale;

  ctx.save();
  if (buddy.facing < 0 && buddy.state !== "piano") {
    ctx.translate(dx + dw, dy);
    ctx.scale(-1, 1);
  } else {
    ctx.translate(dx, dy);
  }

  const p = (x: number, y: number, w: number, h: number, color: string) =>
    px(ctx, x, y, w, h, color, scale);

  if (pose === "piano") {
    p(5, 10, 8, 4, robe);
    p(4, 11, 10, 3, robe);
    p(3, 11, 3, 3, robe);
    p(12, 11, 3, 3, robe);
    p(6, 14, 6, 1, sash);
    p(6, 15, 6, 1, sashDark);
    p(7, 16, 1, 2, sash);
    p(10, 16, 1, 2, sash);
    p(5, 16, 8, 1, robe);
    p(5, 17, 8, 1, dark);
    p(3, 13, 1, 2, trim);
    p(14, 13, 1, 2, trim);
    p(6, 11, 1, 1, lite);
    p(11, 12, 1, 1, lite);
    ctx.restore();
    return;
  }

  if (pose === "type" || pose === "read" || pose === "brush") {
    p(5, 9, 7, 3, robe);
    p(4, 10, 2, 3, robe);
    p(11, 10, 3, 3, robe);
    p(6, 12, 5, 1, robe);
    p(6, 13, 5, 1, sash);
    p(6, 14, 5, 1, sashDark);
    p(5, 15, 7, 2, robe);
    p(4, 16, 9, 1, dark);
    p(4, 17, 9, 1, trim);
    p(4, 12, 2, 1, trim);
    p(12, 12, 1, 1, trim);
    p(5, 9, 1, 2, stripe);
    p(11, 9, 1, 2, stripe);
    p(6, 11, 1, 1, lite);
    if (pose === "type") {
      p(7, 15, 1, 2, sash);
      p(10, 15, 1, 2, sash);
    }
    if (pose === "brush") {
      p(7, 15, 1, 2, sash);
      p(10, 15, 1, 2, sash);
      const paper = "#f3ead2";
      const paperLite = "#fffaf0";
      const rod = "#5a3a20";
      const ink = "#1a161c";
      const shaft = "#b88440";
      const ferrule = "#d4b050";
      const bristle = "#241810";
      p(4, 11, 7, 1, rod);
      p(5, 12, 5, 5, paper);
      p(6, 12, 3, 4, paperLite);
      p(4, 17, 7, 1, rod);
      p(6, 13, 1, 1, ink);
      if (buddy.frame >= 1) p(7, 14, 1, 1, ink);
      if (buddy.frame >= 2) {
        p(7, 15, 1, 1, ink);
        p(8, 14, 1, 1, ink);
      }
      p(3, 12, 2, 3, theme.skin);
      const lift = buddy.frame === 0 ? 0 : buddy.frame === 2 ? 2 : 1;
      const hx = 13;
      const hy = 10 + lift;
      p(11, 10, 2, 3, theme.skin);
      p(hx, hy, 2, 1, theme.skin);
      p(hx + 1, hy - 1, 1, 1, shaft);
      p(hx, hy, 1, 1, ferrule);
      p(hx - 1, hy + 1, 1, 1, bristle);
      p(hx - 2, hy + 2, 1, 1, bristle);
      if (buddy.frame === 2) p(hx - 2, hy + 3, 1, 1, ink);
      ctx.restore();
      return;
    }
    if (pose === "read") {
      const book = "#f5ecd6";
      const spine = "#7a3e3a";
      const leaf = "#fffaf0";
      p(6, 12, 6, 4, book);
      p(9, 12, 1, 4, spine);
      p(6, 12, 3, 4, book);
      p(5, 12, 1, 1, theme.skin);
      const turn = buddy.frame % 4;
      if (turn === 0) {
        p(10, 12, 2, 4, leaf);
        p(12, 12, 1, 1, theme.skin);
      } else if (turn === 1) {
        p(10, 12, 1, 4, leaf);
        p(11, 12, 1, 4, book);
        p(11, 12, 2, 2, theme.skin);
      } else if (turn === 2) {
        p(10, 12, 2, 4, book);
        p(8, 12, 1, 4, leaf);
        p(10, 12, 2, 2, theme.skin);
      } else {
        p(10, 12, 2, 4, leaf);
        p(11, 12, 1, 1, theme.skin);
        p(12, 12, 1, 1, theme.skin);
      }
    }
    ctx.restore();
    return;
  }

  if (pose === "sit") {
    p(5, 13, 8, 2, robe);
    p(2, 14, 3, 2, robe);
    p(13, 14, 3, 2, robe);
    p(6, 15, 6, 1, sash);
    p(6, 16, 6, 1, sashDark);
    p(7, 17, 1, 2, sash);
    p(10, 17, 1, 2, sash);
    p(4, 17, 10, 2, robe);
    p(3, 18, 12, 1, dark);
    p(3, 19, 12, 1, trim);
    p(2, 15, 1, 2, trim);
    p(15, 15, 1, 2, trim);
    p(5, 13, 1, 2, stripe);
    p(12, 13, 1, 2, stripe);
    p(6, 14, 1, 1, lite);
    ctx.restore();
    return;
  }

  const t = gy;
  p(5, 11 + t, 8, 3, robe);
  p(4, 12 + t, 2, 2, robe);
  p(12, 12 + t, 2, 2, robe);
  p(2, 12 + t, 3, 3, robe);
  p(13, 12 + t, 3, 3, robe);
  p(6, 14 + t, 6, 1, robe);
  p(6, 15 + t, 6, 1, sash);
  p(6, 16 + t, 6, 1, sashDark);
  p(7, 17 + t, 1, 2, sash);
  p(10, 17 + t, 1, 2, sashDark);
  p(5, 17 + t, 8, 1, robe);
  if (18 + t < 20) p(3, 18 + t, 12, 1, dark);
  if (19 + t < 20) p(3, 19 + t, 12, 1, trim);
  p(2, 14 + t, 1, 2, trim);
  p(15, 14 + t, 1, 2, trim);
  p(5, 11 + t, 1, 2, stripe);
  p(12, 11 + t, 1, 2, stripe);
  p(6, 12 + t, 1, 1, lite);
  p(11, 13 + t, 1, 1, lite);
  ctx.restore();
}
