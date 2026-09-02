import { ROOM_H, ROOM_W, SCALE } from "./render";
import { mix, shade, type Theme } from "./theme";

const PIANO = "#18181c";
const PIANO_DARK = "#0c0c0e";
const PIANO_LITE = "#34343a";
const GOLD = "#d4a840";
const KEYS = "#f5eedc";
const BLACK_KEY = "#48484e";
const OUTLINE = "#3d2b1f";
const SCREEN = "#60a8c4";
const SCREEN_LITE = "#dceaf8";

const INNER_W = ROOM_W - 2;
const FLOOR_Y = 31;

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
  const chair = mix(theme.furniture, "#5a3a28", 0.18);
  const chairDark = shade(chair, 0.72);
  const chairLite = mix(chair, "#fff8e8", 0.22);

  px(ctx, 0, 0, ROOM_W, ROOM_H, OUTLINE);
  px(ctx, 1, 1, INNER_W, 30, wall);
  px(ctx, 1, 24, INNER_W, 7, wallShadow);
  px(ctx, 1, FLOOR_Y, INNER_W, ROOM_H - FLOOR_Y - 1, floor);
  for (let y = FLOOR_Y + 1; y < ROOM_H - 1; y += 3) {
    px(ctx, 1, y, INNER_W, 1, floorDark);
  }

  px(ctx, 24, 4, 26, 18, frame);
  if (theme.windowPanes === "desktop") {
    ctx.clearRect(26 * SCALE, 6 * SCALE, 22 * SCALE, 14 * SCALE);
  } else {
    const glass = theme.glass;
    const glassLite = mix(theme.glass, "#ffffff", 0.38);
    px(ctx, 26, 6, 22, 14, glass);
    px(ctx, 26, 6, 22, 6, glassLite);
  }
  px(ctx, 36, 6, 2, 14, frame);
  px(ctx, 26, 12, 22, 1, frame);

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
  px(ctx, 6, 25, 10, 2, GOLD);
  px(ctx, 6, 27, 2, 4, PIANO_DARK);
  px(ctx, 14, 27, 2, 4, PIANO_DARK);

  px(ctx, 32, 21, 10, 8, chairDark);
  px(ctx, 33, 22, 8, 6, chair);
  px(ctx, 34, 23, 6, 4, chairLite);
  px(ctx, 31, 28, 12, 4, chair);
  px(ctx, 32, 29, 10, 2, chairLite);
  px(ctx, 31, 26, 2, 7, chairDark);
  px(ctx, 41, 26, 2, 7, chairDark);
  px(ctx, 32, 32, 2, 4, chairDark);
  px(ctx, 40, 32, 2, 4, chairDark);

  px(ctx, 56, 24, 18, 10, desk);
  px(ctx, 55, 23, 20, 3, deskTop);
  const cork = theme.board;
  const corkDark = shade(theme.board, 0.82);
  const wood = mix(theme.board, OUTLINE, 0.28);
  px(ctx, 59, 2, 14, 11, wood);
  px(ctx, 60, 3, 12, 9, cork);
  dot(ctx, 62, 5, corkDark);
  dot(ctx, 68, 8, corkDark);
  dot(ctx, 64, 10, corkDark);
  px(ctx, 61, 4, 4, 4, mix(theme.board, "#fff8e8", 0.7));
  dot(ctx, 62, 4, "#c45c5c");
  px(ctx, 66, 4, 5, 3, mix(theme.board, "#d7e4cc", 0.55));
  dot(ctx, 68, 4, "#6f92b3");
  px(ctx, 62, 8, 6, 3, mix(theme.board, "#f3d4ce", 0.55));
  dot(ctx, 64, 8, "#c45c6a");

  px(ctx, 65, 14, 9, 9, OUTLINE);
  px(ctx, 66, 15, 7, 7, SCREEN);
  px(ctx, 67, 16, 2, 2, SCREEN_LITE);
  px(ctx, 68, 23, 3, 1, OUTLINE);
  const kbBody = "#2c2c34";
  const kbKey = "#e4e0d6";
  px(ctx, 60, 24, 11, 3, kbBody);
  px(ctx, 61, 24, 9, 1, kbKey);
  for (const kx of [62, 64, 66, 68]) {
    dot(ctx, kx, 24, kbBody);
  }
  px(ctx, 61, 25, 2, 1, kbKey);
  px(ctx, 64, 25, 3, 1, kbKey);
  px(ctx, 68, 25, 2, 1, kbKey);
  px(ctx, 56, 26, 2, 6, desk);
  px(ctx, 56, 31, 8, 2, deskTop);
  px(ctx, 56, 33, 2, 3, desk);
  px(ctx, 62, 33, 2, 3, desk);

  px(ctx, 26, 38, 28, 6, theme.rug);
  px(ctx, 27, 39, 26, 4, shade(theme.rug, 0.78));
  px(ctx, 28, 40, 24, 2, theme.rug);

  px(ctx, 0, 0, ROOM_W, 1, OUTLINE);
  px(ctx, 0, ROOM_H - 1, ROOM_W, 1, OUTLINE);
  px(ctx, 0, 0, 1, ROOM_H, OUTLINE);
  px(ctx, ROOM_W - 1, 0, 1, ROOM_H, OUTLINE);

  if (glow > 0 && theme.windowPanes !== "desktop") {
    ctx.save();
    ctx.globalAlpha = glow * 0.18;
    ctx.fillStyle = "#fff4c8";
    ctx.fillRect(26 * SCALE, 6 * SCALE, 22 * SCALE, 14 * SCALE);
    ctx.restore();
  }
}
