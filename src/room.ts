import { ROOM_H, ROOM_W, SCALE } from "./render";
import { mix, shade, type Theme } from "./theme";

const PIANO = "#18181c";
const PIANO_DARK = "#0c0c0e";
const PIANO_LITE = "#34343a";
const GOLD = "#d4a840";
const KEYS = "#f5eedc";
const BLACK_KEY = "#48484e";
const OUTLINE = "#3d2b1f";
const MUG = "#f5eedc";
const TEA = "#b05c40";
const GLASS = "#8ec8e8";
const GLASS_LITE = "#b8e0f0";
const SCREEN = "#60a8c4";
const SCREEN_LITE = "#dceaf8";
const RUG = "#c45c5c";
const RUG_DARK = "#9a3e3e";

function px(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(x * SCALE, y * SCALE, w * SCALE, h * SCALE);
}

function dot(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  px(ctx, x, y, 1, 1, color);
}

export function drawThemedRoom(ctx: CanvasRenderingContext2D, theme: Theme, glow: number) {
  const wall = theme.wall;
  const wallShadow = shade(theme.wall, 0.88);
  const floor = theme.floor;
  const floorDark = shade(theme.floor, 0.78);
  const desk = theme.furniture;
  const deskTop = mix(theme.furniture, "#fff8e8", 0.28);
  const frame = mix(theme.furniture, OUTLINE, 0.35);

  px(ctx, 0, 0, ROOM_W, ROOM_H, OUTLINE);
  px(ctx, 1, 1, 62, 30, wall);
  px(ctx, 1, 24, 62, 7, wallShadow);
  px(ctx, 1, 31, 62, 16, floor);
  for (let y = 32; y < 47; y += 3) {
    px(ctx, 1, y, 62, 1, floorDark);
  }

  px(ctx, 22, 6, 20, 16, frame);
  px(ctx, 24, 8, 16, 12, GLASS);
  px(ctx, 24, 8, 16, 5, GLASS_LITE);
  px(ctx, 31, 8, 2, 12, frame);
  px(ctx, 24, 13, 16, 1, frame);

  px(ctx, 4, 15, 16, 1, PIANO);
  px(ctx, 7, 13, 12, 2, PIANO);
  px(ctx, 11, 11, 9, 2, PIANO);
  px(ctx, 14, 9, 7, 2, PIANO);
  px(ctx, 19, 10, 1, 6, PIANO_LITE);
  px(ctx, 3, 16, 17, 11, PIANO);
  px(ctx, 3, 15, 2, 13, PIANO_DARK);
  px(ctx, 18, 15, 2, 13, PIANO_DARK);
  px(ctx, 8, 18, 7, 2, GOLD);
  px(ctx, 5, 21, 13, 3, KEYS);
  for (const kx of [6, 7, 9, 10, 11, 13, 14]) {
    dot(ctx, kx, 21, BLACK_KEY);
    dot(ctx, kx, 22, BLACK_KEY);
  }
  px(ctx, 5, 24, 13, 1, PIANO_LITE);
  px(ctx, 3, 27, 17, 1, PIANO_DARK);
  px(ctx, 3, 28, 2, 6, PIANO_DARK);
  px(ctx, 18, 28, 2, 6, PIANO_DARK);
  px(ctx, 8, 32, 7, 2, GOLD);
  px(ctx, 8, 34, 2, 3, PIANO_DARK);
  px(ctx, 13, 34, 2, 3, PIANO_DARK);

  px(ctx, 40, 24, 18, 10, desk);
  px(ctx, 39, 23, 20, 3, deskTop);
  px(ctx, 41, 26, 3, 2, MUG);
  dot(ctx, 42, 26, TEA);
  px(ctx, 49, 14, 9, 9, OUTLINE);
  px(ctx, 50, 15, 7, 7, SCREEN);
  px(ctx, 51, 16, 2, 2, SCREEN_LITE);
  px(ctx, 52, 23, 3, 1, OUTLINE);
  px(ctx, 45, 24, 8, 2, KEYS);
  for (const kx of [46, 48, 50, 52]) {
    dot(ctx, kx, 24, BLACK_KEY);
  }
  px(ctx, 40, 26, 2, 6, desk);
  px(ctx, 40, 31, 8, 2, deskTop);
  px(ctx, 40, 33, 2, 3, desk);
  px(ctx, 46, 33, 2, 3, desk);

  px(ctx, 22, 38, 22, 6, RUG);
  px(ctx, 23, 39, 20, 4, RUG_DARK);
  px(ctx, 24, 40, 18, 2, RUG);

  px(ctx, 0, 0, ROOM_W, 1, OUTLINE);
  px(ctx, 0, 47, ROOM_W, 1, OUTLINE);
  px(ctx, 0, 0, 1, ROOM_H, OUTLINE);
  px(ctx, 63, 0, 1, ROOM_H, OUTLINE);

  if (glow > 0) {
    ctx.save();
    ctx.globalAlpha = glow * 0.18;
    ctx.fillStyle = "#fff4c8";
    ctx.fillRect(24 * SCALE, 8 * SCALE, 16 * SCALE, 12 * SCALE);
    ctx.restore();
  }
}
