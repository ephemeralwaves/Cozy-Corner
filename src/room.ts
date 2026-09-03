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

// Dynasty palette constants
const DYN_LACQUER = "#8b1a1a";
const DYN_STRING = "#c8b870";
const DYN_WOOD = "#6b3a1f";
const DYN_INK = "#1a1a28";
const DYN_SCROLL_ROD = "#4a3018";
const DYN_SILK = "#c8304a";
const DYN_PAPER = "#f0e8cc";
const INNER_W = ROOM_W - 2;
const FLOOR_Y = 31;

function px(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(x * SCALE, y * SCALE, w * SCALE, h * SCALE);
}

function dot(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  px(ctx, x, y, 1, 1, color);
}

function drawDynastyRoom(ctx: CanvasRenderingContext2D, theme: Theme, glow: number) {
  const wall = theme.wall;
  const wallShadow = shade(theme.wall, 0.85);
  const floor = theme.floor;
  const floorDark = shade(theme.floor, 0.80);
  const wood = theme.furniture;
  const woodDark = shade(wood, 0.68);
  const woodLite = mix(wood, "#fff8e8", 0.25);
  const frame = mix(wood, OUTLINE, 0.4);

  // === BACKGROUND ===
  px(ctx, 0, 0, ROOM_W, ROOM_H, OUTLINE);
  px(ctx, 1, 1, ROOM_W - 2, 30, wall);
  px(ctx, 1, 24, ROOM_W - 2, 7, wallShadow);
  px(ctx, 1, FLOOR_Y, ROOM_W - 2, ROOM_H - FLOOR_Y - 1, floor);
  // Stone tile grid
  for (let y = FLOOR_Y; y < ROOM_H - 1; y += 4) {
    px(ctx, 1, y, ROOM_W - 2, 1, floorDark);
  }
  for (let x = 1; x < ROOM_W - 1; x += 8) {
    px(ctx, x, FLOOR_Y, 1, ROOM_H - FLOOR_Y - 1, floorDark);
  }

  // === LATTICE WINDOW (centre-left) ===
  // Outer frame
  px(ctx, 24, 4, 26, 18, frame);
  // Paper fill or desktop
  if (theme.windowPanes === "desktop") {
    ctx.clearRect(26 * SCALE, 6 * SCALE, 22 * SCALE, 14 * SCALE);
  } else {
    const paper = mix(theme.glass, "#fffaea", 0.55);
    const paperDark = shade(paper, 0.88);
    px(ctx, 26, 6, 22, 14, paper);
    // Lattice cross grid (3×2 panes)
    for (let lx = 26; lx <= 47; lx += 7) {
      px(ctx, lx, 6, 1, 14, frame);
    }
    for (let ly = 6; ly <= 19; ly += 5) {
      px(ctx, 26, ly, 22, 1, frame);
    }
    // Light gradient at top
    px(ctx, 26, 6, 22, 3, mix(paper, "#ffffff", 0.25));
    // Subtle paper texture dots
    for (let tx = 28; tx < 48; tx += 4) {
      for (let ty = 8; ty < 19; ty += 3) {
        dot(ctx, tx, ty, paperDark);
      }
    }
  }

  // === GUZHENG (left) — long zither on two legs ===
  const gz = wood;
  const gzDark = woodDark;
  const gzLite = woodLite;
  // Body — trapezoidal: wide at left (near viewer), narrow at right
  px(ctx, 2, 24, 20, 5, gzDark);       // shadow underside
  px(ctx, 2, 21, 20, 4, gz);           // main body
  px(ctx, 2, 21, 1, 4, gzLite);        // left edge highlight
  px(ctx, 21, 22, 1, 3, gzDark);       // right edge shadow
  px(ctx, 3, 20, 18, 1, gzLite);       // top surface
  // Bridge / tuning pegs along top edge (small bumps)
  for (let bx = 4; bx <= 19; bx += 3) {
    dot(ctx, bx, 19, gzDark);
    dot(ctx, bx, 20, gzDark);
  }
  // Strings — thin lines across the top surface
  for (let sx = 3; sx <= 20; sx += 1) {
    const col = (sx % 2 === 0) ? DYN_STRING : mix(DYN_STRING, gz, 0.4);
    dot(ctx, sx, 20, col);
  }
  // Carved legs — reach down to FLOOR_Y (31)
  px(ctx, 4, 25, 2, 6, gzDark);
  px(ctx, 16, 25, 2, 6, gzDark);
  dot(ctx, 5, 30, gzLite);
  dot(ctx, 17, 30, gzLite);

  // === FLOOR CUSHION / READING SEAT (centre) ===
  const cushion = DYN_SILK;
  const cushDark = shade(DYN_SILK, 0.68);
  const cushLite = mix(DYN_SILK, "#ffe8e8", 0.38);
  px(ctx, 30, 28, 14, 4, cushDark);      // shadow base
  px(ctx, 30, 25, 14, 4, cushion);       // main cushion
  px(ctx, 31, 25, 12, 2, cushLite);      // top highlight
  // Embroidered border
  px(ctx, 30, 25, 1, 4, cushDark);
  px(ctx, 43, 25, 1, 4, cushDark);
  px(ctx, 31, 28, 12, 1, cushDark);
  // Tassel dots at corners
  dot(ctx, 31, 29, DYN_GOLD_ALIAS(theme));
  dot(ctx, 42, 29, DYN_GOLD_ALIAS(theme));

  // === LOW WRITING TABLE + SCROLL (right) ===
  // Table top
  px(ctx, 52, 22, 24, 3, woodLite);
  px(ctx, 52, 23, 24, 2, gz);
  px(ctx, 52, 22, 24, 1, woodLite);
  px(ctx, 52, 24, 24, 1, gzDark);
  // Legs
  px(ctx, 53, 25, 2, 8, gzDark);
  px(ctx, 71, 25, 2, 8, gzDark);
  dot(ctx, 54, 32, gzLite);
  dot(ctx, 72, 32, gzLite);
  // Paper sheet laid flat on the table surface
  const paper = DYN_PAPER;
  const paperDark = shade(DYN_PAPER, 0.88);
  px(ctx, 53, 21, 16, 2, paper);               // paper body
  px(ctx, 53, 21, 16, 1, mix(paper, "#fff", 0.25)); // paper top highlight
  px(ctx, 53, 22, 1, 1, paperDark);            // paper left edge shadow
  px(ctx, 68, 22, 1, 1, paperDark);            // paper right edge shadow
  // A few faint ink strokes on the paper (calligraphy in progress)
  dot(ctx, 57, 21, mix(DYN_INK, paper, 0.45));
  dot(ctx, 59, 21, mix(DYN_INK, paper, 0.55));
  dot(ctx, 61, 22, mix(DYN_INK, paper, 0.40));
  dot(ctx, 63, 21, mix(DYN_INK, paper, 0.50));
  dot(ctx, 65, 22, mix(DYN_INK, paper, 0.45));
  // Inkstone on table (right of paper)
  const inkStone = "#2a2a38";
  px(ctx, 70, 20, 4, 3, inkStone);
  px(ctx, 70, 20, 4, 1, "#4a4a5a");
  dot(ctx, 71, 20, "#6a6a7a");
  // Ink pool inside stone
  px(ctx, 71, 21, 2, 1, "#10100e");
  // Brush resting on brush rest (little ceramic stand)
  const brushRest = mix(DYN_SILK, "#c0c8d0", 0.6);
  px(ctx, 56, 22, 3, 1, brushRest);            // brush rest ceramic
  dot(ctx, 57, 21, brushRest);
  // Brush handle + tip
  px(ctx, 55, 22, 1, 1, DYN_WOOD);             // handle
  px(ctx, 56, 21, 1, 1, mix(DYN_WOOD, "#fff8e8", 0.3)); // ferrule
  dot(ctx, 57, 20, DYN_INK);                   // brush tip (ink-darkened)

  // === HANGING SCROLL (right wall) ===
  // Layout: top rod at y=1, paper y=3..14, bottom rod y=15
  // Rods are thick (2px tall) and extend 2px wider than paper each side
  const sX = 59;   // left edge of paper
  const sW = 14;   // paper width
  const rodCol = DYN_SCROLL_ROD;
  const rodLite = mix(DYN_SCROLL_ROD, "#c89050", 0.55);
  const rodDark = shade(DYN_SCROLL_ROD, 0.6);

  // Hanging cord loops above top rod
  dot(ctx, sX + 1, 0, rodCol);
  dot(ctx, sX + 12, 0, rodCol);
  dot(ctx, sX + 1, 1, rodCol);
  dot(ctx, sX + 12, 1, rodCol);

  // Top rod: 2px tall, extends 2px each side of paper
  px(ctx, sX - 2, 2, sW + 4, 2, rodCol);
  px(ctx, sX - 2, 2, sW + 4, 1, rodLite);         // highlight on top
  dot(ctx, sX - 2, 3, rodDark);                    // left end cap shadow
  dot(ctx, sX + sW + 1, 3, rodDark);               // right end cap shadow

  // Paper / silk body
  const paperBg = mix(theme.glass, "#fffaea", 0.7);
  const paperSide = shade(paperBg, 0.88);           // slight shadow at edges
  px(ctx, sX, 4, sW, 11, paperBg);
  px(ctx, sX, 4, 1, 11, paperSide);                // left edge shadow
  px(ctx, sX + sW - 1, 4, 1, 11, paperSide);       // right edge shadow

  // 办 (bàn) — user-mapped 9×9 grid, origin (S, G)
  const ink = DYN_INK;
  const S = sX + 2;  // left edge of 9-wide glyph, centred on 14px paper
  const G = 4;       // top edge
  const bàn: [number, number][] = [
    [4,2],
    [2,3],[3,3],[4,3],[5,3],[6,3],[7,3],
    [4,4],[7,4],
    [2,5],[4,5],[7,5],[8,5],
    [1,6],[4,6],[7,6],[9,6],
    [3,7],[7,7],
    [2,8],[6,8],[7,8],
  ];
  for (const [cx, cy] of bàn) dot(ctx, S + cx, G + cy, ink);

  // Red seal — small rectangle bottom-right of paper
  px(ctx, sX + sW - 4, 13, 3, 2, DYN_LACQUER);
  px(ctx, sX + sW - 3, 13, 1, 1, mix(DYN_LACQUER, "#ffffff", 0.35));

  // Bottom rod: 2px tall, same width as top
  px(ctx, sX - 2, 15, sW + 4, 2, rodCol);
  px(ctx, sX - 2, 15, sW + 4, 1, rodLite);
  dot(ctx, sX - 2, 16, rodDark);
  dot(ctx, sX + sW + 1, 16, rodDark);

  // === RUG — round embroidered mat ===
  const rugC = theme.rug;
  const rugD = shade(theme.rug, 0.72);
  const rugL = mix(theme.rug, "#ffe8d0", 0.3);
  // Oval shape
  px(ctx, 28, 39, 24, 4, rugD);
  px(ctx, 26, 40, 28, 3, rugC);
  px(ctx, 27, 39, 26, 4, rugC);
  px(ctx, 28, 40, 24, 2, rugL);
  // Inner ring
  px(ctx, 30, 40, 20, 2, rugD);
  px(ctx, 31, 40, 18, 2, mix(rugC, rugL, 0.5));
  // Centre motif
  dot(ctx, 39, 41, rugL);
  dot(ctx, 40, 41, DYN_GOLD_ALIAS(theme));
  dot(ctx, 41, 41, rugL);

  // === BORDERS ===
  px(ctx, 0, 0, ROOM_W, 1, OUTLINE);
  px(ctx, 0, ROOM_H - 1, ROOM_W, 1, OUTLINE);
  px(ctx, 0, 0, 1, ROOM_H, OUTLINE);
  px(ctx, ROOM_W - 1, 0, 1, ROOM_H, OUTLINE);

  // Glow through window
  if (glow > 0 && theme.windowPanes !== "desktop") {
    ctx.save();
    ctx.globalAlpha = glow * 0.12;
    ctx.fillStyle = "#fff8d0";
    ctx.fillRect(26 * SCALE, 6 * SCALE, 22 * SCALE, 14 * SCALE);
    ctx.restore();
  }
}

function DYN_GOLD_ALIAS(theme: Theme): string {
  return mix(theme.furniture, "#f0c840", 0.6);
}

export function drawDeskStool(ctx: CanvasRenderingContext2D, theme: Theme) {
  const wood = theme.furniture;
  const woodDark = shade(wood, 0.68);
  const woodLite = mix(wood, "#fff8e8", 0.25);
  if (theme.roomStyle === "dynasty") {
    drawStool(ctx, 54, 27, wood, woodDark, woodLite);
    return;
  }
  const seat = mix(wood, "#5a3a28", 0.18);
  drawStool(ctx, 54, 27, seat, shade(seat, 0.72), mix(seat, "#fff8e8", 0.22));
}

function drawStool(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  seat: string,
  dark: string,
  lite: string,
) {
  px(ctx, x + 1, y, 6, 1, lite);
  px(ctx, x, y + 1, 8, 2, seat);
  px(ctx, x + 1, y + 2, 6, 1, dark);
  const legY = y + 3;
  const legH = 33 - legY;
  px(ctx, x + 1, legY, 1, legH, dark);
  px(ctx, x + 6, legY, 1, legH, dark);
  px(ctx, x + 2, legY, 1, legH - 1, seat);
  px(ctx, x + 5, legY, 1, legH - 1, seat);
  dot(ctx, x + 1, 32, lite);
  dot(ctx, x + 6, 32, lite);
}

export function drawThemedRoom(ctx: CanvasRenderingContext2D, theme: Theme, glow: number) {
  if (theme.roomStyle === "dynasty") {
    drawDynastyRoom(ctx, theme, glow);
    return;
  }
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

  // Writing table — open top + legs, same idea as the dynasty table
  const deskDark = shade(desk, 0.68);
  px(ctx, 52, 23, 24, 3, desk);
  px(ctx, 52, 23, 24, 1, deskTop);
  px(ctx, 52, 25, 24, 1, deskDark);
  px(ctx, 53, 26, 2, 7, deskDark);
  px(ctx, 73, 26, 2, 7, deskDark);
  px(ctx, 55, 26, 2, 6, desk);
  px(ctx, 71, 26, 2, 6, desk);
  dot(ctx, 54, 32, deskTop);
  dot(ctx, 74, 32, deskTop);
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

  // Monitor sitting on the tabletop
  px(ctx, 65, 13, 9, 9, OUTLINE);
  px(ctx, 66, 14, 7, 7, SCREEN);
  px(ctx, 67, 15, 2, 2, SCREEN_LITE);
  px(ctx, 68, 22, 3, 1, OUTLINE);
  px(ctx, 67, 23, 5, 1, deskDark);
  // Keyboard sitting on the tabletop (in front of the monitor)
  const kbBody = "#2c2c34";
  const kbKey = "#e4e0d6";
  px(ctx, 56, 21, 12, 2, kbBody);
  px(ctx, 57, 21, 10, 1, kbKey);
  for (const kx of [58, 60, 62, 64]) {
    dot(ctx, kx, 21, kbBody);
  }
  px(ctx, 57, 22, 2, 1, kbKey);
  px(ctx, 60, 22, 3, 1, kbKey);
  px(ctx, 64, 22, 3, 1, kbKey);

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
