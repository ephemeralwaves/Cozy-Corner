import { ROOM_INNER_H, ROOM_W, ROOF_PAD, SCALE } from "./render";
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
  ctx.fillRect(x * SCALE, (y + ROOF_PAD) * SCALE, w * SCALE, h * SCALE);
}

function pxAbs(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(x * SCALE, y * SCALE, w * SCALE, h * SCALE);
}

function dot(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  px(ctx, x, y, 1, 1, color);
}

function dotAbs(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  pxAbs(ctx, x, y, 1, 1, color);
}

function drawChineseRoof(ctx: CanvasRenderingContext2D, _theme: Theme) {
  // Terracotta peaked roof with curved eaves — sits flush on the room box
  const ink = "#2c2438";
  const dark = "#b85028";
  const mid = "#d87038";
  const lite = "#e8a858";
  const hi = "#fff8f0";
  const cx = Math.floor(ROOM_W / 2);
  const baseY = ROOF_PAD - 1; // rests on box top (y = ROOF_PAD in room space)

  // Decorative finial
  pxAbs(ctx, cx, 0, 1, 1, ink);
  pxAbs(ctx, cx, 1, 1, 2, ink);
  dotAbs(ctx, cx, 1, hi);

  // Continuous peaked body — each row widens with flying-eave flare at the bottom
  // so left/right ends connect all the way to the upswept tips (no gaps)
  for (let y = 2; y <= baseY; y++) {
    const t = (y - 2) / Math.max(1, baseY - 2);
    let half = Math.floor(2 + t * (cx - 2));
    // Extra outward flare in the lower third for curved eaves
    if (y >= baseY - 5) {
      half += (y - (baseY - 5)) * 2;
    }
    half = Math.min(cx, half);
    const left = cx - half;
    const right = cx + half;
    const w = right - left + 1;

    let fill = lite;
    if (y >= baseY - 2) fill = dark;
    else if (y >= baseY - 6) fill = mid;
    else fill = lite;

    pxAbs(ctx, left, y, w, 1, fill);
    dotAbs(ctx, left, y, ink);
    dotAbs(ctx, right, y, ink);

    if (y >= 3 && y <= baseY - 8 && y % 2 === 0) {
      for (let x = left + 3; x < right - 2; x += 5) {
        dotAbs(ctx, x, y, hi);
      }
    }
  }

  // Ridge lines from peak down the hips
  const ridgeLen = baseY - 3;
  for (let i = 0; i < ridgeLen; i++) {
    const y = 2 + i;
    const inset = Math.floor(i * ((cx - 4) / Math.max(1, ridgeLen - 1)));
    dotAbs(ctx, cx - inset, y, ink);
    dotAbs(ctx, cx + inset, y, ink);
  }

  // Upswept eave tips — connected into the flared lower rows
  const tipY = baseY - 3;
  pxAbs(ctx, 0, tipY, 2, 1, lite);
  pxAbs(ctx, 0, tipY + 1, 3, 1, mid);
  pxAbs(ctx, 0, tipY + 2, 4, 1, dark);
  pxAbs(ctx, 0, tipY + 3, 5, 1, dark);
  dotAbs(ctx, 0, tipY, ink);
  dotAbs(ctx, 0, tipY + 1, ink);
  dotAbs(ctx, 0, tipY + 2, ink);
  dotAbs(ctx, 0, tipY + 3, ink);

  pxAbs(ctx, ROOM_W - 2, tipY, 2, 1, lite);
  pxAbs(ctx, ROOM_W - 3, tipY + 1, 3, 1, mid);
  pxAbs(ctx, ROOM_W - 4, tipY + 2, 4, 1, dark);
  pxAbs(ctx, ROOM_W - 5, tipY + 3, 5, 1, dark);
  dotAbs(ctx, ROOM_W - 1, tipY, ink);
  dotAbs(ctx, ROOM_W - 1, tipY + 1, ink);
  dotAbs(ctx, ROOM_W - 1, tipY + 2, ink);
  dotAbs(ctx, ROOM_W - 1, tipY + 3, ink);

  // Flat underside spanning the full width — connects both eaves to the box
  pxAbs(ctx, 0, baseY, ROOM_W, 1, ink);
}

function drawEnchantedRoof(ctx: CanvasRenderingContext2D, theme: Theme) {
  const ink = OUTLINE;
  const wood = mix(theme.furniture, "#8a6038", 0.25);
  const woodDark = shade(wood, 0.7);
  const woodMid = shade(wood, 0.85);
  const woodLite = mix(wood, "#e8d0a0", 0.28);
  const ivy = mix(theme.wall, "#4a7850", 0.55);
  const ivyLite = mix(ivy, "#a0d070", 0.4);
  const ivyDark = shade(ivy, 0.72);
  const brick = "#a45c48";
  const brickDark = "#7a3c34";
  const brickLite = "#c87860";
  const cx = Math.floor(ROOM_W / 2);
  const peakY = 3;
  const baseY = ROOF_PAD - 1;

  // Wooden triangle — each row is a shingle band
  for (let y = peakY; y <= baseY; y++) {
    const t = (y - peakY) / Math.max(1, baseY - peakY);
    const half = Math.floor(1 + t * (cx - 1));
    const left = cx - half;
    const right = cx + half;
    const w = right - left + 1;
    let fill = wood;
    if (y >= baseY - 1) fill = woodDark;
    else if ((y - peakY) % 3 === 2) fill = woodMid;
    else if ((y - peakY) % 3 === 0) fill = woodLite;
    pxAbs(ctx, left, y, w, 1, fill);
    dotAbs(ctx, left, y, ink);
    dotAbs(ctx, right, y, ink);
  }

  // Ridge beam
  pxAbs(ctx, cx - 1, peakY, 3, 1, ink);
  pxAbs(ctx, cx, peakY - 1, 1, 1, woodLite);

  // Underside fascia on the room box
  pxAbs(ctx, 0, baseY, ROOM_W, 1, ink);

  // Little chimney on the right slope
  const chX = 54;
  const chTop = 1;
  const chW = 5;
  const chMeet = 8;
  pxAbs(ctx, chX, chTop + 1, chW, chMeet - chTop, brick);
  pxAbs(ctx, chX, chTop + 1, 1, chMeet - chTop, brickDark);
  pxAbs(ctx, chX + chW - 1, chTop + 1, 1, chMeet - chTop, brickDark);
  // Brick rows
  for (let y = chTop + 2; y < chMeet; y += 2) {
    pxAbs(ctx, chX + 1, y, chW - 2, 1, brickDark);
  }
  // Cap
  pxAbs(ctx, chX - 1, chTop, chW + 2, 1, brickDark);
  pxAbs(ctx, chX, chTop, chW, 1, brickLite);
  pxAbs(ctx, chX + 1, chTop - 1, chW - 2, 1, brickDark);
  // Tiny smoke
  dotAbs(ctx, chX + 2, 0, mix(theme.glass, "#d0d8e0", 0.5));
  dotAbs(ctx, chX + 4, 0, mix(theme.glass, "#d0d8e0", 0.35));

  // Overgrown vines — climb the left slope, spill onto the peak and right
  const leftStem: [number, number][] = [
    [4, baseY - 1],
    [6, baseY - 2],
    [8, baseY - 3],
    [10, baseY - 4],
    [12, baseY - 5],
    [15, baseY - 6],
    [18, baseY - 7],
    [22, baseY - 8],
    [26, baseY - 9],
    [30, baseY - 10],
    [34, peakY + 4],
    [37, peakY + 2],
  ];
  for (const [x, y] of leftStem) dotAbs(ctx, x, y, ivyDark);
  for (const [x, y] of [
    [5, baseY - 1],
    [7, baseY - 3],
    [9, baseY - 2],
    [11, baseY - 5],
    [13, baseY - 4],
    [16, baseY - 7],
    [19, baseY - 6],
    [21, baseY - 8],
    [24, baseY - 7],
    [27, baseY - 9],
    [31, baseY - 9],
    [33, peakY + 3],
    [36, peakY + 1],
    [38, peakY + 2],
    [39, peakY + 1],
  ] as const) {
    dotAbs(ctx, x, y, (x + y) % 2 === 0 ? ivy : ivyLite);
  }
  // Tendrils over the right eaves and chimney base
  for (const [x, y] of [
    [48, baseY - 4],
    [50, baseY - 3],
    [52, baseY - 2],
    [53, chMeet],
    [58, chMeet + 1],
    [60, baseY - 5],
    [63, baseY - 4],
    [66, baseY - 3],
    [70, baseY - 2],
    [73, baseY - 1],
  ] as const) {
    dotAbs(ctx, x, y, ivy);
    dotAbs(ctx, x + 1, y - 1, ivyLite);
  }
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

  // Roof perched above the room box
  drawChineseRoof(ctx, theme);

  // === ROOM BOX ===
  px(ctx, 0, 0, ROOM_W, ROOM_INNER_H, OUTLINE);
  px(ctx, 1, 1, ROOM_W - 2, 30, wall);
  px(ctx, 1, 24, ROOM_W - 2, 7, wallShadow);
  px(ctx, 1, FLOOR_Y, ROOM_W - 2, ROOM_INNER_H - FLOOR_Y - 1, floor);
  // Stone tile grid
  for (let y = FLOOR_Y; y < ROOM_INNER_H - 1; y += 4) {
    px(ctx, 1, y, ROOM_W - 2, 1, floorDark);
  }
  for (let x = 1; x < ROOM_W - 1; x += 8) {
    px(ctx, x, FLOOR_Y, 1, ROOM_INNER_H - FLOOR_Y - 1, floorDark);
  }

  // === LATTICE WINDOW (centre-left) ===
  // Outer frame
  px(ctx, 24, 4, 26, 18, frame);
  // Paper fill or desktop
  if (theme.windowPanes === "desktop") {
    ctx.clearRect(26 * SCALE, (6 + ROOF_PAD) * SCALE, 22 * SCALE, 14 * SCALE);
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

  // Top rod
  px(ctx, sX - 2, 2, sW + 4, 2, rodCol);
  px(ctx, sX - 2, 2, sW + 4, 1, rodLite);
  dot(ctx, sX - 2, 3, rodDark);
  dot(ctx, sX + sW + 1, 3, rodDark);

  // Paper / silk body
  const paperBg = mix(theme.glass, "#fffaea", 0.7);
  const paperSide = shade(paperBg, 0.88);
  px(ctx, sX, 4, sW, 11, paperBg);
  px(ctx, sX, 4, 1, 11, paperSide);
  px(ctx, sX + sW - 1, 4, 1, 11, paperSide);

  // 办 (bàn) — user-mapped 9×9 grid
  const ink = DYN_INK;
  const S = sX + 2;
  const G = 4;
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

  // Red seal
  px(ctx, sX + sW - 4, 13, 3, 2, DYN_LACQUER);
  px(ctx, sX + sW - 3, 13, 1, 1, mix(DYN_LACQUER, "#ffffff", 0.35));

  // Bottom rod
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

  // === BORDERS (full room box) ===
  px(ctx, 0, 0, ROOM_W, 1, OUTLINE);
  px(ctx, 0, ROOM_INNER_H - 1, ROOM_W, 1, OUTLINE);
  px(ctx, 0, 0, 1, ROOM_INNER_H, OUTLINE);
  px(ctx, ROOM_W - 1, 0, 1, ROOM_INNER_H, OUTLINE);

  // Glow through window
  if (glow > 0 && theme.windowPanes !== "desktop") {
    ctx.save();
    ctx.globalAlpha = glow * 0.12;
    ctx.fillStyle = "#fff8d0";
    ctx.fillRect(26 * SCALE, (6 + ROOF_PAD) * SCALE, 22 * SCALE, 14 * SCALE);
    ctx.restore();
  }
}

function DYN_GOLD_ALIAS(theme: Theme): string {
  return mix(theme.furniture, "#f0c840", 0.6);
}

function drawStandingHarp(ctx: CanvasRenderingContext2D) {
  // Flaticon-style silhouette, sized to leave headroom for floating ♪ notes.
  const ink = OUTLINE;
  const gold = "#f0c430";
  const goldLite = "#ffe878";
  const goldMid = "#e0a820";
  const goldDark = "#c88818";
  const orange = "#e87820";
  const orangeDark = "#c85810";
  const orangeLite = "#f09840";

  // Orange base
  px(ctx, 3, 32, 14, 2, ink);
  px(ctx, 4, 32, 12, 1, orangeLite);
  px(ctx, 4, 33, 12, 1, orangeDark);

  // Left pillar — flared crown, orange collars, flared foot
  px(ctx, 3, 10, 4, 1, ink);
  px(ctx, 4, 10, 2, 1, goldLite);
  px(ctx, 3, 11, 4, 2, ink);
  px(ctx, 4, 11, 2, 1, goldLite);
  px(ctx, 4, 12, 2, 1, gold);
  px(ctx, 3, 13, 4, 1, ink);
  px(ctx, 4, 13, 2, 1, orangeLite);
  px(ctx, 3, 14, 4, 12, ink);
  px(ctx, 4, 14, 2, 12, gold);
  px(ctx, 4, 14, 1, 12, goldLite);
  px(ctx, 5, 14, 1, 12, goldDark);
  px(ctx, 3, 19, 1, 2, goldMid);
  px(ctx, 4, 24, 2, 1, orange);
  px(ctx, 3, 25, 4, 7, ink);
  px(ctx, 4, 25, 2, 7, gold);
  px(ctx, 4, 25, 1, 7, goldLite);
  px(ctx, 5, 25, 1, 7, goldDark);
  px(ctx, 2, 29, 6, 3, ink);
  px(ctx, 3, 29, 4, 1, goldMid);
  px(ctx, 3, 30, 4, 1, gold);
  px(ctx, 3, 31, 4, 1, goldDark);

  // S-curve neck: out from pillar, dip, crest, down into soundboard
  const neck: [number, number, number, string][] = [
    [7, 11, 2, goldLite],
    [7, 12, 2, gold],
    [9, 12, 2, gold],
    [9, 13, 2, goldMid],
    [10, 11, 2, goldLite],
    [10, 12, 3, gold],
    [11, 10, 2, goldLite],
    [12, 11, 2, gold],
    [12, 12, 2, goldMid],
    [13, 12, 2, gold],
    [13, 13, 3, goldMid],
    [14, 14, 2, gold],
    [14, 15, 2, goldDark],
  ];
  for (const [x, y, w, fill] of neck) {
    px(ctx, x - 1, y, w + 2, 1, ink);
    px(ctx, x, y, w, 1, fill);
  }
  px(ctx, 10, 13, 2, 1, goldDark);

  // Slanted soundboard — thick bar widening toward the base
  const board: [number, number, number][] = [
    [15, 13, 3],
    [16, 13, 3],
    [17, 12, 4],
    [18, 12, 4],
    [19, 12, 4],
    [20, 11, 5],
    [21, 11, 5],
    [22, 11, 5],
    [23, 10, 6],
    [24, 10, 6],
    [25, 10, 6],
    [26, 10, 6],
    [27, 9, 7],
    [28, 9, 7],
    [29, 9, 7],
    [30, 9, 7],
    [31, 9, 7],
  ];
  for (const [y, left, w] of board) {
    px(ctx, left - 1, y, w + 2, 1, ink);
    px(ctx, left, y, w, 1, gold);
    dot(ctx, left, y, goldLite);
    dot(ctx, left + w - 1, y, goldDark);
  }
  px(ctx, 14, 15, 2, 1, gold);
  px(ctx, 13, 16, 1, 1, goldLite);
}

function drawEnchantedRoom(ctx: CanvasRenderingContext2D, theme: Theme, glow: number) {
  const wall = theme.wall;
  const wallShadow = shade(theme.wall, 0.86);
  const wallMoss = mix(theme.wall, "#6a9070", 0.35);
  const floor = theme.floor;
  const floorDark = shade(theme.floor, 0.78);
  const wood = theme.furniture;
  const woodDark = shade(wood, 0.68);
  const woodLite = mix(wood, "#fff8e8", 0.28);
  const frame = mix(wood, OUTLINE, 0.35);

  drawEnchantedRoof(ctx, theme);

  // Room shell
  px(ctx, 0, 0, ROOM_W, ROOM_INNER_H, OUTLINE);
  px(ctx, 1, 1, INNER_W, 30, wall);
  px(ctx, 1, 24, INNER_W, 7, wallShadow);
  px(ctx, 1, FLOOR_Y, INNER_W, ROOM_INNER_H - FLOOR_Y - 1, floor);
  for (let y = FLOOR_Y + 1; y < ROOM_INNER_H - 1; y += 4) {
    px(ctx, 1, y, INNER_W, 1, floorDark);
  }
  // Soft moss patches along the baseboard
  for (const mx of [2, 10, 48, 70]) {
    px(ctx, mx, 29, 3, 2, wallMoss);
    dot(ctx, mx + 1, 28, mix(wallMoss, "#90c090", 0.4));
  }

  // Arched moonlit window
  px(ctx, 26, 5, 22, 17, frame);
  // Arch crown
  px(ctx, 30, 3, 14, 2, frame);
  px(ctx, 33, 2, 8, 1, frame);
  if (theme.windowPanes === "desktop") {
    ctx.clearRect(28 * SCALE, (6 + ROOF_PAD) * SCALE, 18 * SCALE, 14 * SCALE);
  } else {
    const glass = theme.glass;
    const glassLite = mix(theme.glass, "#ffffff", 0.35);
    const glassDeep = mix(theme.glass, "#304868", 0.25);
    px(ctx, 28, 6, 18, 14, glass);
    px(ctx, 28, 6, 18, 5, glassLite);
    px(ctx, 28, 16, 18, 4, glassDeep);
    // Soft moon
    px(ctx, 38, 8, 4, 4, mix(glassLite, "#fff8e0", 0.55));
    px(ctx, 39, 9, 2, 2, "#fffaf0");
    // Tiny stars
    for (const [sx, sy] of [
      [30, 8],
      [33, 11],
      [42, 10],
      [44, 14],
      [31, 15],
    ] as const) {
      dot(ctx, sx, sy, mix(glassLite, "#ffffff", 0.7));
    }
  }
  // Arch mullions
  px(ctx, 36, 6, 2, 14, frame);
  px(ctx, 28, 12, 18, 1, frame);

  // Climbing vines — continuous stems with leaf clusters hugging the frame
  const ivy = mix(wallMoss, "#4a7850", 0.4);
  const ivyLite = mix(ivy, "#a0d080", 0.45);
  const ivyDark = shade(ivy, 0.72);
  const stem = mix(ivy, "#3a5028", 0.55);

  // Left vine: rises along the outer frame, then curls onto the arch
  const leftStem: [number, number][] = [
    [24, 20],
    [24, 19],
    [24, 18],
    [25, 17],
    [24, 16],
    [24, 15],
    [25, 14],
    [24, 13],
    [25, 12],
    [25, 11],
    [24, 10],
    [25, 9],
    [26, 8],
    [27, 7],
    [28, 6],
    [29, 5],
    [31, 4],
    [33, 3],
  ];
  for (const [x, y] of leftStem) dot(ctx, x, y, stem);

  // Left leaf pairs along the stem
  for (const [x, y, side] of [
    [23, 19, -1],
    [23, 16, -1],
    [23, 13, -1],
    [26, 14, 1],
    [23, 11, -1],
    [26, 10, 1],
    [26, 7, 1],
    [30, 4, 1],
  ] as const) {
    dot(ctx, x, y, ivy);
    dot(ctx, x + side, y - 1, ivyLite);
    dot(ctx, x, y - 1, ivyDark);
  }

  // Right vine: mirrors up the frame and meets near the arch peak
  const rightStem: [number, number][] = [
    [49, 20],
    [49, 19],
    [49, 18],
    [48, 17],
    [49, 16],
    [49, 15],
    [48, 14],
    [49, 13],
    [48, 12],
    [48, 11],
    [49, 10],
    [48, 9],
    [47, 8],
    [46, 7],
    [45, 6],
    [44, 5],
    [42, 4],
    [40, 3],
  ];
  for (const [x, y] of rightStem) dot(ctx, x, y, stem);

  // Right leaf pairs
  for (const [x, y, side] of [
    [50, 19, 1],
    [50, 16, 1],
    [50, 13, 1],
    [47, 14, -1],
    [50, 11, 1],
    [47, 10, -1],
    [47, 7, -1],
    [43, 4, -1],
  ] as const) {
    dot(ctx, x, y, ivy);
    dot(ctx, x + side, y - 1, ivyLite);
    dot(ctx, x, y - 1, ivyDark);
  }

  // Soft tendril tips meeting at the crown
  dot(ctx, 35, 3, ivyLite);
  dot(ctx, 36, 2, ivy);
  dot(ctx, 37, 3, ivyLite);

  // Large standing harp (left)
  drawStandingHarp(ctx);

  // Old oak chair shaped like a living tree (centre)
  const oak = mix(wood, "#8a6038", 0.35);
  const oakDark = shade(oak, 0.68);
  const oakLite = mix(oak, "#e8d0a0", 0.3);
  const bark = mix(oak, OUTLINE, 0.35);
  const leaf = mix(theme.wall, "#4a7850", 0.55);
  const leafLite = mix(leaf, "#a0d070", 0.45);
  const leafDark = shade(leaf, 0.75);

  // Root legs / base
  px(ctx, 31, 32, 2, 2, oakDark);
  px(ctx, 41, 32, 2, 2, oakDark);
  px(ctx, 30, 33, 3, 1, bark);
  px(ctx, 41, 33, 3, 1, bark);
  dot(ctx, 29, 33, oakDark);
  dot(ctx, 44, 33, oakDark);

  // Trunk-like back posts (kept low so they clear the window)
  px(ctx, 31, 22, 3, 8, oak);
  px(ctx, 31, 22, 1, 8, oakLite);
  px(ctx, 33, 22, 1, 8, oakDark);
  px(ctx, 40, 22, 3, 8, oak);
  px(ctx, 40, 22, 1, 8, oakLite);
  px(ctx, 42, 22, 1, 8, oakDark);
  // Bark knots
  dot(ctx, 32, 24, bark);
  dot(ctx, 41, 26, bark);
  dot(ctx, 32, 28, oakDark);

  // Branching crown / backrest — short forked limbs under the window
  px(ctx, 32, 20, 10, 2, oak);
  px(ctx, 32, 20, 10, 1, oakLite);
  px(ctx, 30, 20, 3, 2, oakDark);
  px(ctx, 41, 20, 3, 2, oakDark);
  // Upward twigs
  px(ctx, 33, 18, 2, 2, oak);
  px(ctx, 38, 17, 2, 3, oak);
  px(ctx, 36, 19, 2, 1, oakLite);
  dot(ctx, 34, 17, oakDark);
  dot(ctx, 39, 16, oakDark);

  // Leaf clusters on the crown
  for (const [lx, ly] of [
    [32, 18],
    [33, 17],
    [34, 18],
    [35, 17],
    [37, 16],
    [38, 17],
    [39, 16],
    [40, 18],
    [41, 17],
    [42, 19],
    [31, 19],
    [43, 19],
  ] as const) {
    dot(ctx, lx, ly, (lx + ly) % 2 === 0 ? leaf : leafLite);
  }
  dot(ctx, 36, 17, leafDark);
  dot(ctx, 39, 18, leafDark);

  // Branch arms
  px(ctx, 28, 26, 4, 2, oak);
  px(ctx, 28, 26, 4, 1, oakLite);
  px(ctx, 42, 26, 4, 2, oak);
  px(ctx, 42, 26, 4, 1, oakLite);
  // Twig tips curling up
  px(ctx, 27, 24, 2, 3, oakDark);
  px(ctx, 45, 24, 2, 3, oakDark);
  dot(ctx, 27, 23, leaf);
  dot(ctx, 46, 23, leafLite);

  // Seat — thick slab / stump cross-section
  px(ctx, 30, 28, 14, 4, oakDark);
  px(ctx, 31, 28, 12, 3, oak);
  px(ctx, 32, 28, 10, 2, oakLite);
  // Growth rings
  px(ctx, 33, 29, 8, 1, bark);
  px(ctx, 35, 29, 4, 1, mix(oakLite, "#fff8e0", 0.2));
  dot(ctx, 37, 29, oakDark);

  // Writing table (right) — potion bottles, cauldron, mortar
  px(ctx, 52, 23, 24, 3, wood);
  px(ctx, 52, 23, 24, 1, woodLite);
  px(ctx, 52, 25, 24, 1, woodDark);
  px(ctx, 53, 26, 2, 7, woodDark);
  px(ctx, 73, 26, 2, 7, woodDark);
  px(ctx, 55, 26, 2, 6, wood);
  px(ctx, 71, 26, 2, 6, wood);
  dot(ctx, 54, 32, woodLite);
  dot(ctx, 74, 32, woodLite);

  const glass = mix(theme.glass, "#d0e8f0", 0.5);
  const bottleCork = "#8a5a30";
  // Tall emerald potion
  px(ctx, 54, 17, 3, 6, glass);
  px(ctx, 54, 19, 3, 3, "#3cb878");
  px(ctx, 55, 19, 1, 2, mix("#3cb878", "#ffffff", 0.35));
  px(ctx, 55, 16, 1, 1, bottleCork);
  // Round purple flask
  px(ctx, 58, 19, 4, 4, glass);
  px(ctx, 59, 20, 2, 2, "#7850c8");
  px(ctx, 59, 18, 2, 1, glass);
  px(ctx, 59, 17, 2, 1, bottleCork);
  // Tiny red vial
  px(ctx, 63, 20, 2, 3, glass);
  px(ctx, 63, 21, 2, 2, "#d04860");
  px(ctx, 63, 19, 2, 1, bottleCork);
  // Brewing cauldron (centre)
  const pot = "#3a3848";
  const potLite = "#5a5870";
  px(ctx, 66, 19, 6, 4, pot);
  px(ctx, 65, 20, 8, 3, pot);
  px(ctx, 66, 19, 6, 1, potLite);
  px(ctx, 67, 20, 4, 2, "#50a878");
  dot(ctx, 68, 20, mix("#50a878", "#ffffff", 0.4));
  dot(ctx, 69, 19, mix("#50a878", "#fff8c0", 0.5));
  // Wooden spoon resting on the rim
  px(ctx, 70, 18, 1, 3, "#b89050");
  dot(ctx, 70, 17, "#d4b070");
  // Mortar & pestle
  px(ctx, 73, 21, 3, 2, mix(wood, "#a09080", 0.4));
  px(ctx, 74, 20, 1, 2, woodDark);
  // Small blue bottle tucked right
  px(ctx, 72, 18, 2, 3, glass);
  px(ctx, 72, 19, 2, 2, "#4890c8");
  px(ctx, 72, 17, 2, 1, bottleCork);

  // Witch's ladder on a 9×9 grid (todo hotspot)
  const chartFrame = mix(wood, "#a88850", 0.3);
  const chartFrameLite = mix(chartFrame, "#e8d090", 0.35);
  const sky = "#142048";
  const rope = "#8a5a30";
  const bead = "#e87820";

  px(ctx, 59, 2, 14, 11, chartFrame);
  px(ctx, 59, 2, 14, 1, chartFrameLite);
  px(ctx, 60, 3, 12, 9, sky);

  // 1-indexed 9×9 → sky at (61,3)..(69,11)
  // Straight rope strands sit on columns 2, 5, 8; everything else is a bead.
  const cells: [number, number][] = [
    [2, 1],
    [5, 1],
    [8, 1],
    [2, 2],
    [5, 2],
    [8, 2],
    [2, 3],
    [5, 3],
    [8, 3],
    [2, 4],
    [4, 4],
    [6, 4],
    [8, 4],
    [2, 5],
    [4, 5],
    [6, 5],
    [8, 5],
    [1, 6],
    [3, 6],
    [5, 6],
    [8, 6],
    [1, 7],
    [3, 7],
    [7, 7],
    [9, 7],
    [2, 8],
    [7, 8],
    [9, 8],
    [8, 9],
  ];
  for (const [gx, gy] of cells) {
    const isRope = gx === 2 || gx === 5 || gx === 8;
    dot(ctx, 60 + gx, 2 + gy, isRope ? rope : bead);
  }

  // Soft oval rug with a faint moon motif
  const rugC = theme.rug;
  const rugD = shade(theme.rug, 0.72);
  const rugL = mix(theme.rug, "#d8f0e8", 0.35);
  px(ctx, 28, 39, 24, 4, rugD);
  px(ctx, 26, 40, 28, 3, rugC);
  px(ctx, 27, 39, 26, 4, rugC);
  px(ctx, 28, 40, 24, 2, rugL);
  px(ctx, 32, 40, 16, 2, rugD);
  px(ctx, 34, 40, 12, 2, mix(rugC, rugL, 0.5));
  dot(ctx, 39, 41, rugL);
  dot(ctx, 40, 41, goldAccent(theme));
  dot(ctx, 41, 41, rugL);

  // Borders
  px(ctx, 0, 0, ROOM_W, 1, OUTLINE);
  px(ctx, 0, ROOM_INNER_H - 1, ROOM_W, 1, OUTLINE);
  px(ctx, 0, 0, 1, ROOM_INNER_H, OUTLINE);
  px(ctx, ROOM_W - 1, 0, 1, ROOM_INNER_H, OUTLINE);

  if (glow > 0 && theme.windowPanes !== "desktop") {
    ctx.save();
    ctx.globalAlpha = glow * 0.14;
    ctx.fillStyle = "#d8e8ff";
    ctx.fillRect(28 * SCALE, (6 + ROOF_PAD) * SCALE, 18 * SCALE, 14 * SCALE);
    ctx.restore();
  }
}

function goldAccent(theme: Theme): string {
  return mix(theme.furniture, "#f0c840", 0.55);
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
  if (theme.roomStyle === "enchanted") {
    drawEnchantedRoom(ctx, theme, glow);
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

  px(ctx, 0, 0, ROOM_W, ROOM_INNER_H, OUTLINE);
  px(ctx, 1, 1, INNER_W, 30, wall);
  px(ctx, 1, 24, INNER_W, 7, wallShadow);
  px(ctx, 1, FLOOR_Y, INNER_W, ROOM_INNER_H - FLOOR_Y - 1, floor);
  for (let y = FLOOR_Y + 1; y < ROOM_INNER_H - 1; y += 3) {
    px(ctx, 1, y, INNER_W, 1, floorDark);
  }

  px(ctx, 24, 4, 26, 18, frame);
  if (theme.windowPanes === "desktop") {
    ctx.clearRect(26 * SCALE, (6 + ROOF_PAD) * SCALE, 22 * SCALE, 14 * SCALE);
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
  px(ctx, 0, ROOM_INNER_H - 1, ROOM_W, 1, OUTLINE);
  px(ctx, 0, 0, 1, ROOM_INNER_H, OUTLINE);
  px(ctx, ROOM_W - 1, 0, 1, ROOM_INNER_H, OUTLINE);

  if (glow > 0 && theme.windowPanes !== "desktop") {
    ctx.save();
    ctx.globalAlpha = glow * 0.18;
    ctx.fillStyle = "#fff4c8";
    ctx.fillRect(26 * SCALE, (6 + ROOF_PAD) * SCALE, 22 * SCALE, 14 * SCALE);
    ctx.restore();
  }
}
