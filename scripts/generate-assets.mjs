import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) {
      c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

function u32(n) {
  const b = Buffer.alloc(4);
  b.writeUInt32BE(n);
  return b;
}

function chunk(type, data) {
  const t = Buffer.from(type);
  return Buffer.concat([u32(data.length), t, data, u32(crc32(Buffer.concat([t, data])))]);
}

function encodePng(width, height, rgba) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    const row = y * (width * 4 + 1);
    raw[row] = 0;
    rgba.copy(raw, row + 1, y * width * 4, (y + 1) * width * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function pixels(w, h, fill = [0, 0, 0, 0]) {
  const rgba = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    rgba[i * 4] = fill[0];
    rgba[i * 4 + 1] = fill[1];
    rgba[i * 4 + 2] = fill[2];
    rgba[i * 4 + 3] = fill[3];
  }
  return { w, h, rgba };
}

function set(p, x, y, rgb) {
  if (x < 0 || y < 0 || x >= p.w || y >= p.h) return;
  const i = (y * p.w + x) * 4;
  p.rgba[i] = rgb[0];
  p.rgba[i + 1] = rgb[1];
  p.rgba[i + 2] = rgb[2];
  p.rgba[i + 3] = rgb[3] ?? 255;
}

function rect(p, x, y, w, h, rgb) {
  for (let yy = y; yy < y + h; yy++) {
    for (let xx = x; xx < x + w; xx++) set(p, xx, yy, rgb);
  }
}

function savePng(rel, img) {
  const path = join(root, rel);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, encodePng(img.w, img.h, img.rgba));
}

const C = {
  wall: [232, 213, 183],
  wallShadow: [212, 192, 161],
  outline: [61, 43, 31],
  floor: [196, 165, 116],
  floorDark: [166, 133, 84],
  rug: [196, 92, 92],
  rugDark: [154, 62, 62],
  frame: [107, 79, 58],
  glass: [142, 200, 232],
  glassLite: [184, 224, 240],
  desk: [139, 90, 60],
  deskTop: [168, 116, 78],
  pot: [196, 92, 74],
  leaf: [90, 154, 90],
  leafDark: [58, 112, 70],
  mug: [245, 238, 220],
  tea: [176, 92, 64],
  book: [245, 236, 214],
  bookDark: [122, 62, 58],
  bookLite: [255, 250, 240],
  skin: [240, 200, 160],
  hair: [74, 55, 40],
  hairDark: [58, 42, 30],
  shirt: [126, 184, 160],
  pants: [92, 74, 110],
  shoes: [61, 43, 31],
  blush: [232, 150, 140],
  eye: [40, 32, 28],
  fur: [224, 154, 74],
  furDark: [184, 108, 42],
  belly: [244, 224, 196],
  pink: [232, 160, 144],
  white: [250, 246, 236],
  piano: [24, 24, 28],
  pianoDark: [12, 12, 14],
  pianoLite: [52, 52, 58],
  keys: [245, 238, 220],
  blackKey: [72, 72, 78],
  gold: [212, 168, 64],
};

function drawRoom() {
  const p = pixels(80, 48);
  rect(p, 0, 0, 80, 48, C.outline);
  rect(p, 1, 1, 78, 30, C.wall);
  rect(p, 1, 24, 78, 7, C.wallShadow);
  rect(p, 1, 31, 78, 16, C.floor);
  for (let y = 32; y < 47; y += 3) {
    rect(p, 1, y, 78, 1, C.floorDark);
  }

  rect(p, 24, 4, 26, 18, C.frame);
  rect(p, 26, 6, 22, 14, C.glass);
  rect(p, 26, 6, 22, 6, C.glassLite);
  rect(p, 36, 6, 2, 14, C.frame);
  rect(p, 26, 12, 22, 1, C.frame);

  // Black grand piano (front view): open lid, keys, gold stand, bench
  rect(p, 4, 15, 16, 1, C.piano);
  rect(p, 7, 13, 12, 2, C.piano);
  rect(p, 11, 11, 9, 2, C.piano);
  rect(p, 14, 9, 7, 2, C.piano);
  rect(p, 19, 10, 1, 6, C.pianoLite);
  rect(p, 3, 16, 17, 11, C.piano);
  rect(p, 3, 15, 2, 13, C.pianoDark);
  rect(p, 18, 15, 2, 13, C.pianoDark);
  rect(p, 8, 18, 7, 2, C.gold);
  rect(p, 5, 21, 13, 3, C.keys);
  for (const kx of [6, 7, 9, 10, 11, 13, 14]) {
    set(p, kx, 21, C.blackKey);
    set(p, kx, 22, C.blackKey);
  }
  rect(p, 5, 24, 13, 1, C.pianoLite);
  rect(p, 3, 27, 17, 1, C.pianoDark);
  rect(p, 3, 28, 2, 6, C.pianoDark);
  rect(p, 18, 28, 2, 6, C.pianoDark);
  rect(p, 6, 25, 10, 2, C.gold);
  rect(p, 6, 27, 2, 4, C.pianoDark);
  rect(p, 14, 27, 2, 4, C.pianoDark);

  rect(p, 32, 21, 10, 8, C.desk);
  rect(p, 33, 22, 8, 6, C.deskTop);
  rect(p, 31, 28, 12, 4, C.desk);
  rect(p, 31, 26, 2, 7, C.frame);
  rect(p, 41, 26, 2, 7, C.frame);
  rect(p, 32, 32, 2, 4, C.frame);
  rect(p, 40, 32, 2, 4, C.frame);

  rect(p, 56, 24, 18, 10, C.desk);
  rect(p, 55, 23, 20, 3, C.deskTop);
  rect(p, 59, 2, 14, 11, C.frame);
  rect(p, 60, 3, 12, 9, [216, 184, 120]);
  rect(p, 61, 4, 4, 4, [243, 234, 210]);
  set(p, 62, 4, [196, 92, 92]);
  rect(p, 66, 4, 5, 3, [215, 228, 204]);
  set(p, 68, 4, [111, 146, 179]);
  rect(p, 62, 8, 6, 3, [243, 212, 206]);
  set(p, 64, 8, [196, 92, 106]);
  rect(p, 65, 14, 9, 9, C.outline);
  rect(p, 66, 15, 7, 7, [96, 168, 196]);
  rect(p, 67, 16, 2, 2, [220, 240, 250]);
  rect(p, 68, 23, 3, 1, C.outline);
  rect(p, 60, 24, 11, 3, [44, 44, 52]);
  rect(p, 61, 24, 9, 1, [228, 224, 214]);
  for (const kx of [62, 64, 66, 68]) {
    set(p, kx, 24, [44, 44, 52]);
  }
  rect(p, 61, 25, 2, 1, [228, 224, 214]);
  rect(p, 64, 25, 3, 1, [228, 224, 214]);
  rect(p, 68, 25, 2, 1, [228, 224, 214]);
  rect(p, 56, 26, 2, 6, C.desk);
  rect(p, 56, 31, 8, 2, C.deskTop);
  rect(p, 56, 33, 2, 3, C.desk);
  rect(p, 62, 33, 2, 3, C.desk);

  rect(p, 26, 38, 28, 6, C.rug);
  rect(p, 27, 39, 26, 4, C.rugDark);
  rect(p, 28, 40, 24, 2, C.rug);

  rect(p, 0, 0, 80, 1, C.outline);
  rect(p, 0, 47, 80, 1, C.outline);
  rect(p, 0, 0, 1, 48, C.outline);
  rect(p, 79, 0, 1, 48, C.outline);
  return p;
}

function blit(dst, src, ox, oy) {
  for (let y = 0; y < src.h; y++) {
    for (let x = 0; x < src.w; x++) {
      const i = (y * src.w + x) * 4;
      if (src.rgba[i + 3] === 0) continue;
      set(dst, ox + x, oy + y, [
        src.rgba[i],
        src.rgba[i + 1],
        src.rgba[i + 2],
        src.rgba[i + 3],
      ]);
    }
  }
}

const HAIR_STYLES = ["short", "long", "afro", "bun", "pony"];
const CHAR_W = 18;
const CHAR_H = 20;
const CHAR_PAD_X = 1;
const CHAR_PAD_Y = 4;

function drawHair(p, { type = false, gy = 0, style = "short", ox = 0, oy = 0, back = false } = {}) {
  const hy = (type ? 0 : 1 + gy) + oy;
  const H = C.hair;
  const D = C.hairDark;

  if (style === "long") {
    rect(p, ox + 2, hy + 2, 2, 8, H);
    rect(p, ox + 12, hy + 2, 2, 8, H);
    rect(p, ox + 3, hy + 8, 1, 3, H);
    rect(p, ox + 12, hy + 8, 1, 3, H);
    set(p, ox + 2, hy + 9, D);
    set(p, ox + 13, hy + 9, D);
    rect(p, ox + 4, hy, 8, 3, H);
    rect(p, ox + 3, hy + 1, 2, 3, H);
    rect(p, ox + 11, hy + 1, 2, 3, H);
    if (back) {
      rect(p, ox + 4, hy + 2, 8, 4, H);
      rect(p, ox + 5, hy + 6, 6, 2, H);
    }
    return;
  }

  if (style === "afro") {
    const cx = 8.5;
    const cy = hy + 2.6;
    const rx = 7.3;
    const ry = 6.2;
    for (let y = hy - 3; y <= hy + 9; y++) {
      for (let x = 0; x < p.w; x++) {
        const dx = (x + 0.5 - cx) / rx;
        const dy = (y + 0.5 - cy) / ry;
        if (dx * dx + dy * dy > 1) continue;
        if (!back) {
          const fx = (x + 0.5 - cx) / 4.1;
          const fy = (y + 0.5 - (hy + 4.3)) / 3.4;
          if (y >= hy + 3 && fx * fx + fy * fy <= 1) continue;
          if (y > hy + 6 && Math.abs(x + 0.5 - cx) < 4.6) continue;
        }
        const shade = (x + y * 3) % 7 === 0 || (x * 2 + y) % 11 === 0;
        set(p, x, y, shade ? D : H);
      }
    }
    return;
  }

  if (style === "bun") {
    const top = hy - 1;
    rect(p, ox + 6, top, 4, 2, H);
    rect(p, ox + 7, top, 2, 3, H);
    set(p, ox + 7, top, D);
    set(p, ox + 8, top, D);
    rect(p, ox + 4, hy + 1, 8, 2, H);
    rect(p, ox + 5, hy + 2, 2, 1, H);
    rect(p, ox + 9, hy + 2, 2, 1, H);
    if (back) rect(p, ox + 4, hy + 2, 8, 4, H);
    return;
  }

  if (style === "pony") {
    rect(p, ox + 4, hy, 8, 2, H);
    rect(p, ox + 3, hy + 1, 2, 2, H);
    rect(p, ox + 11, hy + 1, 2, 2, H);
    if (back) {
      rect(p, ox + 4, hy + 2, 8, 4, H);
      rect(p, ox + 7, hy + 5, 2, 6, H);
      set(p, ox + 8, hy + 10, D);
    } else {
      rect(p, ox + 12, hy + 2, 3, 2, H);
      rect(p, ox + 13, hy + 4, 2, 5, H);
      set(p, ox + 14, hy + 3, D);
      set(p, ox + 14, hy + 8, D);
    }
    return;
  }

  rect(p, ox + 4, hy, 8, 3, H);
  rect(p, ox + 3, hy + 1, 2, 3, H);
  rect(p, ox + 11, hy + 1, 2, 3, H);
  if (back) {
    rect(p, ox + 4, hy + 2, 8, 4, H);
    rect(p, ox + 5, hy + 5, 6, 2, H);
  }
}

function drawChar({ bounce = 0, sit = false, walk = 0, blink = false, type = false, typeHand = 0, read = false, pageTurn = 0, piano = false, pianoHand = 0, brush = false, brushPhase = 0, brew = false, brewPhase = 0, hair = "short" } = {}) {
  const body = pixels(16, 16);

  if (read) {
    rect(body, 4, 10, 7, 4, C.pants);
    rect(body, 9, 11, 4, 3, C.pants);
    set(body, 12, 13, C.shoes);
    rect(body, 4, 5, 7, 6, C.shirt);
    rect(body, 5, 1, 6, 5, C.skin);
    rect(body, 4, 2, 8, 4, C.skin);
    if (blink) {
      rect(body, 6, 4, 2, 1, C.eye);
      rect(body, 9, 4, 2, 1, C.eye);
    } else {
      set(body, 6, 4, C.eye);
      set(body, 10, 4, C.eye);
      set(body, 6, 5, C.blush);
      set(body, 10, 5, C.blush);
    }
    set(body, 8, 6, C.outline);
    // Open book — all page motion stays inside this rectangle (x 5–10, y 8–11)
    rect(body, 5, 8, 6, 4, C.book);
    rect(body, 8, 8, 1, 4, C.bookDark);
    rect(body, 5, 8, 3, 4, C.book);
    set(body, 6, 9, C.bookDark);
    set(body, 6, 11, C.bookDark);

    rect(body, 3, 7, 2, 3, C.skin);
    set(body, 4, 8, C.skin);

    if (pageTurn === 0) {
      rect(body, 9, 8, 2, 4, C.bookLite);
      set(body, 10, 9, C.bookDark);
      set(body, 10, 11, C.bookDark);
      rect(body, 11, 7, 2, 3, C.skin);
      set(body, 11, 8, C.skin);
    } else if (pageTurn === 1) {
      // Right page folding in: only one column of paper left, hand on that edge
      rect(body, 9, 8, 1, 4, C.bookLite);
      rect(body, 10, 8, 1, 4, C.book);
      set(body, 9, 9, C.bookDark);
      rect(body, 10, 8, 2, 2, C.skin);
      set(body, 11, 9, C.skin);
    } else if (pageTurn === 2) {
      // Page on-edge at the gutter; right leaf is the under-page
      rect(body, 9, 8, 2, 4, C.book);
      rect(body, 7, 8, 1, 4, C.bookLite);
      set(body, 8, 8, C.bookLite);
      set(body, 8, 11, C.bookLite);
      rect(body, 9, 8, 2, 2, C.skin);
      set(body, 8, 9, C.skin);
    } else {
      // Settled open again, hand returning to the right cover
      rect(body, 9, 8, 2, 4, C.bookLite);
      set(body, 7, 9, C.bookDark);
      rect(body, 11, 7, 2, 3, C.skin);
      set(body, 10, 8, C.skin);
    }

    const p = pixels(CHAR_W, CHAR_H);
    blit(p, body, CHAR_PAD_X, CHAR_PAD_Y);
    drawHair(p, { type: true, style: hair, ox: CHAR_PAD_X, oy: CHAR_PAD_Y });
    return p;
  }

  if (type) {
    rect(body, 4, 10, 7, 4, C.pants);
    rect(body, 9, 11, 4, 3, C.pants);
    set(body, 12, 13, C.shoes);
    rect(body, 4, 5, 7, 6, C.shirt);
    rect(body, 5, 1, 6, 5, C.skin);
    rect(body, 4, 2, 8, 4, C.skin);
    if (blink) {
      rect(body, 6, 4, 2, 1, C.eye);
      rect(body, 9, 4, 2, 1, C.eye);
    } else {
      set(body, 6, 4, C.eye);
      set(body, 10, 4, C.eye);
      set(body, 6, 5, C.blush);
      set(body, 10, 5, C.blush);
    }
    set(body, 8, 6, C.outline);
    const leftY = typeHand === 2 ? 8 : 9;
    const rightY = typeHand === 1 ? 8 : 9;
    rect(body, 3, 6, 2, 3, C.skin);
    set(body, 4, leftY, C.skin);
    set(body, 5, leftY, C.skin);
    rect(body, 10, 6, 2, 3, C.skin);
    rect(body, 11, rightY, 4, 2, C.skin);
    const p = pixels(CHAR_W, CHAR_H);
    blit(p, body, CHAR_PAD_X, CHAR_PAD_Y);
    drawHair(p, { type: true, style: hair, ox: CHAR_PAD_X, oy: CHAR_PAD_Y });
    return p;
  }

  if (brush) {
    // Seated calligraphy: left hand holds an unrolled scroll, right hand brushes it
    rect(body, 4, 10, 7, 4, C.pants);
    rect(body, 9, 11, 4, 3, C.pants);
    set(body, 12, 13, C.shoes);
    rect(body, 4, 5, 7, 6, C.shirt);
    rect(body, 5, 1, 6, 5, C.skin);
    rect(body, 4, 2, 8, 4, C.skin);
    if (blink) {
      rect(body, 6, 4, 2, 1, C.eye);
      rect(body, 9, 4, 2, 1, C.eye);
    } else {
      set(body, 6, 4, C.eye);
      set(body, 10, 4, C.eye);
      set(body, 6, 5, C.blush);
      set(body, 10, 5, C.blush);
    }
    set(body, 8, 6, C.outline);

    const paper = [243, 234, 210];
    const paperLite = [255, 250, 236];
    const rod = [90, 58, 32];
    const ink = [26, 22, 28];
    const shaft = [210, 186, 120];
    const ferrule = [168, 120, 48];
    const bristle = [36, 24, 16];

    // Vertical scroll: rods + paper, held at the torso
    rect(body, 3, 7, 7, 1, rod);
    rect(body, 4, 8, 5, 5, paper);
    rect(body, 5, 8, 3, 4, paperLite);
    rect(body, 3, 13, 7, 1, rod);
    set(body, 3, 7, [140, 88, 40, 255]);
    set(body, 9, 7, [140, 88, 40, 255]);
    set(body, 3, 13, [140, 88, 40, 255]);
    set(body, 9, 13, [140, 88, 40, 255]);

    set(body, 5, 9, ink);
    if (brushPhase >= 1) set(body, 6, 10, ink);
    if (brushPhase >= 2) {
      set(body, 6, 11, ink);
      set(body, 7, 10, ink);
    }

    // Left hand wraps the left rod / paper edge
    rect(body, 2, 8, 2, 3, C.skin);
    set(body, 3, 10, C.skin);

    // Right forearm from the side; hand grips a long diagonal brush
    // 0 raised, 1 hover, 2 writing on paper, 3 lift
    const lift = brushPhase === 0 ? 0 : brushPhase === 2 ? 2 : 1;
    rect(body, 10, 6, 2, 3, C.skin);
    set(body, 11, 8, C.skin);
    const hx = 12;
    const hy = 6 + lift;
    set(body, hx, hy, C.skin);
    set(body, hx + 1, hy, C.skin);
    // Brush shaft from the fist down-left onto the scroll
    set(body, hx + 1, hy - 1, shaft);
    set(body, hx, hy, ferrule);
    set(body, hx - 1, hy + 1, bristle);
    set(body, hx - 2, hy + 2, bristle);
    if (brushPhase === 2) set(body, hx - 2, hy + 3, ink);

    const p = pixels(CHAR_W, CHAR_H);
    blit(p, body, CHAR_PAD_X, CHAR_PAD_Y);
    drawHair(p, { type: true, style: hair, ox: CHAR_PAD_X, oy: CHAR_PAD_Y });
    return p;
  }

  if (brew) {
    // Seated potion-making: cauldron in front, right hand stirs, bottles nearby
    rect(body, 4, 10, 7, 4, C.pants);
    rect(body, 9, 11, 4, 3, C.pants);
    set(body, 12, 13, C.shoes);
    rect(body, 4, 5, 7, 6, C.shirt);
    rect(body, 5, 1, 6, 5, C.skin);
    rect(body, 4, 2, 8, 4, C.skin);
    if (blink) {
      rect(body, 6, 4, 2, 1, C.eye);
      rect(body, 9, 4, 2, 1, C.eye);
    } else {
      set(body, 6, 4, C.eye);
      set(body, 10, 4, C.eye);
      set(body, 6, 5, C.blush);
      set(body, 10, 5, C.blush);
    }
    set(body, 8, 6, C.outline);

    const pot = [72, 68, 88];
    const potLite = [110, 104, 130];
    const potDark = [40, 38, 52];
    const brewColors = [
      [80, 200, 140],
      [120, 90, 220],
      [240, 120, 80],
      [90, 180, 230],
    ];
    const liquid = brewColors[brewPhase % brewColors.length];
    const liquidLite = liquid.map((c) => Math.min(255, c + 40));
    const spoon = [180, 140, 70];
    const spoonDark = [120, 88, 40];

    // Cauldron / brewing pot on the desk
    rect(body, 5, 10, 6, 4, pot);
    rect(body, 4, 11, 8, 3, pot);
    rect(body, 5, 10, 6, 1, potLite);
    rect(body, 4, 13, 8, 1, potDark);
    // Liquid surface
    rect(body, 5, 11, 6, 2, liquid);
    set(body, 6, 11, liquidLite);
    set(body, 8, 11, liquidLite);
    // Bubbles rise with phase
    if (brewPhase >= 1) set(body, 7, 10, liquidLite);
    if (brewPhase >= 2) {
      set(body, 6, 9, liquidLite);
      set(body, 9, 9, [255, 240, 180, 255]);
    }
    if (brewPhase >= 3) {
      set(body, 8, 8, [255, 250, 200, 255]);
      set(body, 5, 9, liquid);
    }

    // Left hand steadies the pot rim
    rect(body, 3, 9, 2, 3, C.skin);
    set(body, 4, 10, C.skin);

    // Right arm stirs — spoon dips into the brew
    // 0 raised, 1 hover, 2 deep stir, 3 lift with drip
    const lift = brewPhase === 0 ? 0 : brewPhase === 2 ? 2 : 1;
    rect(body, 10, 6, 2, 3, C.skin);
    set(body, 11, 8, C.skin);
    const hx = 11;
    const hy = 7 + lift;
    set(body, hx, hy, C.skin);
    set(body, hx + 1, hy, C.skin);
    // Spoon handle + bowl
    set(body, hx + 1, hy - 1, spoon);
    set(body, hx, hy, spoonDark);
    set(body, hx - 1, hy + 1, spoon);
    set(body, hx - 1, hy + 2, spoonDark);
    if (brewPhase === 2) set(body, hx - 1, hy + 3, liquid);
    if (brewPhase === 3) set(body, hx - 1, hy + 2, liquidLite);

    const p = pixels(CHAR_W, CHAR_H);
    blit(p, body, CHAR_PAD_X, CHAR_PAD_Y);
    drawHair(p, { type: true, style: hair, ox: CHAR_PAD_X, oy: CHAR_PAD_Y });
    return p;
  }

  if (piano) {
    rect(body, 4, 11, 8, 4, C.pants);
    rect(body, 5, 14, 2, 2, C.shoes);
    rect(body, 9, 14, 2, 2, C.shoes);
    rect(body, 4, 6, 8, 6, C.shirt);
    rect(body, 3, 7, 10, 4, C.shirt);
    rect(body, 6, 5, 4, 2, C.skin);
    rect(body, 5, 1, 6, 5, C.skin);
    rect(body, 4, 2, 8, 4, C.skin);
    const leftY = pianoHand === 1 ? 4 : 5;
    const rightY = pianoHand === 2 ? 4 : 5;
    rect(body, 2, 6, 3, 3, C.skin);
    set(body, 2, leftY, C.skin);
    set(body, 3, leftY - 1, C.skin);
    rect(body, 11, 6, 3, 3, C.skin);
    set(body, 13, rightY, C.skin);
    set(body, 12, rightY - 1, C.skin);
    const p = pixels(CHAR_W, CHAR_H);
    blit(p, body, CHAR_PAD_X, CHAR_PAD_Y);
    drawHair(p, { type: true, style: hair, ox: CHAR_PAD_X, oy: CHAR_PAD_Y, back: true });
    return p;
  }

  const gy = sit ? 3 : bounce;
  const leg = sit ? 0 : walk;

  if (!sit) {
    rect(body, 4, 12 + gy, 3, 3, C.pants);
    rect(body, 9, 12 + gy, 3, 3, C.pants);
    set(body, 4 + (leg > 0 ? 1 : 0), 14 + gy, C.shoes);
    set(body, 11 - (leg < 0 ? 1 : 0), 14 + gy, C.shoes);
  } else {
    rect(body, 3, 12, 10, 3, C.pants);
    rect(body, 2, 13, 3, 2, C.shoes);
    rect(body, 11, 13, 3, 2, C.shoes);
  }

  rect(body, 4, 7 + gy, 8, 6, C.shirt);
  rect(body, 3, 8 + gy, 2, 4, C.skin);
  rect(body, 11, 8 + gy, 2, 4, C.skin);

  rect(body, 5, 2 + gy, 6, 6, C.skin);
  rect(body, 4, 3 + gy, 8, 4, C.skin);

  if (blink) {
    rect(body, 6, 5 + gy, 2, 1, C.eye);
    rect(body, 9, 5 + gy, 2, 1, C.eye);
  } else {
    set(body, 6, 5 + gy, C.eye);
    set(body, 10, 5 + gy, C.eye);
    set(body, 6, 6 + gy, C.blush);
    set(body, 10, 6 + gy, C.blush);
  }
  set(body, 8, 7 + gy, C.outline);
  const p = pixels(CHAR_W, CHAR_H);
  blit(p, body, CHAR_PAD_X, CHAR_PAD_Y);
  drawHair(p, { gy, style: hair, ox: CHAR_PAD_X, oy: CHAR_PAD_Y });
  return p;
}

function drawSheet() {
  const poses = [
    { bounce: 0 },
    { bounce: 1 },
    { bounce: 0 },
    { bounce: 0, blink: true },
    { sit: true },
    { sit: true, blink: true },
    { bounce: 0, walk: 1 },
    { bounce: 1, walk: -1 },
    { type: true, typeHand: 0 },
    { type: true, typeHand: 1 },
    { type: true, typeHand: 0, blink: true },
    { type: true, typeHand: 2 },
    { read: true, pageTurn: 0 },
    { read: true, pageTurn: 1 },
    { read: true, pageTurn: 2 },
    { read: true, pageTurn: 3 },
    { piano: true, pianoHand: 0 },
    { piano: true, pianoHand: 1 },
    { piano: true, pianoHand: 0, blink: true },
    { piano: true, pianoHand: 2 },
    { brush: true, brushPhase: 0 },
    { brush: true, brushPhase: 1 },
    { brush: true, brushPhase: 2 },
    { brush: true, brushPhase: 3, blink: true },
    { brew: true, brewPhase: 0 },
    { brew: true, brewPhase: 1 },
    { brew: true, brewPhase: 2 },
    { brew: true, brewPhase: 3, blink: true },
  ];
  const sheet = pixels(CHAR_W * poses.length, CHAR_H * HAIR_STYLES.length);
  HAIR_STYLES.forEach((hair, row) => {
    poses.forEach((pose, i) => blit(sheet, drawChar({ ...pose, hair }), i * CHAR_W, row * CHAR_H));
  });
  return sheet;
}

function drawCat({ bounce = 0, sit = false, walk = 0, blink = false, sleep = false, tail = 0 } = {}) {
  const p = pixels(16, 16);
  const gy = sleep ? 2 : sit ? 1 : bounce;

  if (sleep) {
    rect(p, 3, 9, 10, 5, C.fur);
    rect(p, 4, 10, 8, 4, C.belly);
    rect(p, 2, 10, 3, 3, C.furDark);
    rect(p, 11, 8, 4, 5, C.fur);
    rect(p, 12, 9, 3, 3, C.white);
    set(p, 13, 10, C.eye);
    set(p, 14, 10, C.eye);
    set(p, 12, 7, C.pink);
    set(p, 14, 7, C.pink);
    rect(p, 1, 8 + (tail > 0 ? 0 : 1), 3, 2, C.furDark);
    return p;
  }

  if (sit) {
    rect(p, 4, 8 + gy, 8, 6, C.fur);
    rect(p, 5, 10 + gy, 6, 3, C.belly);
    rect(p, 3, 11 + gy, 3, 3, C.furDark);
    rect(p, 10, 6 + gy, 5, 6, C.fur);
    rect(p, 11, 7 + gy, 3, 3, C.white);
    set(p, 11, 5 + gy, C.pink);
    set(p, 14, 5 + gy, C.pink);
    if (blink) {
      rect(p, 11, 8 + gy, 2, 1, C.eye);
      rect(p, 13, 8 + gy, 2, 1, C.eye);
    } else {
      set(p, 12, 8 + gy, C.eye);
      set(p, 14, 8 + gy, C.eye);
    }
    rect(p, 1, 9 + gy + (tail > 0 ? -1 : 0), 3, 2, C.furDark);
    set(p, 1, 8 + gy + (tail > 0 ? -1 : 1), C.fur);
    return p;
  }

  const leg = walk;
  rect(p, 4, 7 + gy, 8, 5, C.fur);
  rect(p, 5, 9 + gy, 6, 2, C.belly);
  rect(p, 10, 5 + gy, 5, 6, C.fur);
  rect(p, 11, 6 + gy, 3, 3, C.white);
  set(p, 11, 4 + gy, C.pink);
  set(p, 14, 4 + gy, C.pink);
  if (blink) {
    rect(p, 11, 7 + gy, 2, 1, C.eye);
    rect(p, 13, 7 + gy, 2, 1, C.eye);
  } else {
    set(p, 12, 7 + gy, C.eye);
    set(p, 14, 7 + gy, C.eye);
  }
  rect(p, 4 + (leg > 0 ? 1 : 0), 12 + gy, 2, 3, C.furDark);
  rect(p, 8 + (leg < 0 ? 1 : 0), 12 + gy, 2, 3, C.furDark);
  rect(p, 11, 12 + gy, 2, 3, C.furDark);
  rect(p, 1, 8 + gy + (tail > 0 ? -1 : 0), 3, 2, C.fur);
  set(p, 1, 7 + gy + (tail > 0 ? -1 : 1), C.furDark);
  return p;
}

function drawCatSheet() {
  const sheet = pixels(160, 16);
  const frames = [
    drawCat({ bounce: 0, tail: 0 }),
    drawCat({ bounce: 1, tail: 1 }),
    drawCat({ bounce: 0, tail: 0 }),
    drawCat({ bounce: 0, tail: 1, blink: true }),
    drawCat({ sit: true, tail: 0 }),
    drawCat({ sit: true, tail: 1, blink: true }),
    drawCat({ bounce: 0, walk: 1, tail: 1 }),
    drawCat({ bounce: 1, walk: -1, tail: 0 }),
    drawCat({ sleep: true, tail: 0 }),
    drawCat({ sleep: true, tail: 1 }),
  ];
  frames.forEach((f, i) => blit(sheet, f, i * 16, 0));
  return sheet;
}

function drawDog({ bounce = 0, sit = false, walk = 0, blink = false, sleep = false, tail = 0 } = {}) {
  const p = pixels(16, 16);
  const gy = sleep ? 2 : sit ? 1 : bounce;

  if (sleep) {
    // Curled loaf — head tucked, no dangling legs
    rect(p, 3, 10, 10, 4, C.fur);
    rect(p, 4, 11, 8, 2, C.fur);
    // Head resting on body
    rect(p, 10, 8, 4, 4, C.fur);
    // Tiny muzzle accent only
    set(p, 12, 10, C.belly);
    set(p, 13, 10, C.belly);
    set(p, 14, 9, C.eye); // nose
    set(p, 11, 9, C.eye);
    // Pointed ear
    set(p, 10, 7, C.fur);
    // Tail tip only, no limb protrusion
    set(p, 2, 11 + (tail > 0 ? -1 : 0), C.fur);
    set(p, 2, 12, C.fur);
    return p;
  }

  if (sit) {
    // Full fur sit — mostly body color, tiny light accents only
    // Solid rear haunches / back
    rect(p, 1, 7 + gy, 8, 6, C.fur);
    rect(p, 2, 8 + gy, 7, 4, C.fur);
    // Slight far-side depth on rear (still fur family)
    rect(p, 1, 11 + gy, 2, 2, C.furDark);
    // Thick upright torso / back continuing into chest
    rect(p, 5, 4 + gy, 5, 7, C.fur);
    rect(p, 4, 6 + gy, 2, 5, C.fur);
    // Tiny belly hint only
    set(p, 7, 9 + gy, C.belly);
    set(p, 8, 9 + gy, C.belly);
    // Head + pointed ear
    rect(p, 8, 2 + gy, 4, 4, C.fur);
    set(p, 8, 1 + gy, C.fur);
    set(p, 8, gy, C.fur);
    // Snout — mostly fur, light only on underside
    rect(p, 11, 3 + gy, 3, 2, C.fur);
    set(p, 11, 4 + gy, C.belly);
    set(p, 12, 4 + gy, C.belly);
    set(p, 13, 3 + gy, C.eye);
    if (blink) rect(p, 10, 3 + gy, 2, 1, C.eye);
    else set(p, 10, 3 + gy, C.eye);
    // Front paws under chest
    rect(p, 7, 11 + gy, 2, 3, C.fur);
    set(p, 8, 13 + gy, C.fur);
    rect(p, 5, 12 + gy, 2, 2, C.furDark);
    // Tail up behind
    set(p, 1, 6 + gy + (tail > 0 ? -1 : 0), C.fur);
    set(p, 1, 7 + gy, C.fur);
    return p;
  }

  const leg = walk;
  // Tail curves up at the rear
  set(p, 1, 5 + gy + (tail > 0 ? -1 : 0), C.fur);
  set(p, 1, 6 + gy, C.fur);
  set(p, 2, 6 + gy, C.fur);

  // Torso — x 2..9
  rect(p, 2, 6 + gy, 8, 4, C.fur);
  rect(p, 8, 7 + gy, 2, 3, C.belly);
  set(p, 8, 8 + gy, C.furDark);

  // Head
  rect(p, 8, 3 + gy, 4, 4, C.fur);
  set(p, 8, 2 + gy, C.fur);
  set(p, 8, 1 + gy, C.fur);

  // Long snout pointing right
  rect(p, 11, 4 + gy, 3, 3, C.fur);
  rect(p, 11, 5 + gy, 3, 2, C.belly);
  set(p, 13, 4 + gy, C.eye);
  if (blink) rect(p, 10, 4 + gy, 2, 1, C.eye);
  else set(p, 10, 4 + gy, C.eye);

  // Legs centered under torso (x 2..9), not past the chest into the snout
  // near = fur, far = furDark; small foot pad one px forward
  const backNearX = 3 + (leg > 0 ? 1 : 0);
  const frontNearX = 6 + (leg < 0 ? 1 : 0);
  const backFarX = 4;
  const frontFarX = 7;

  rect(p, backNearX, 10 + gy, 2, 3, C.fur);
  set(p, backNearX + 1, 13 + gy, C.fur);

  rect(p, backFarX, 10 + gy, 2, 3, C.furDark);
  set(p, backFarX + 1, 13 + gy, C.furDark);

  rect(p, frontNearX, 10 + gy, 2, 3, C.fur);
  set(p, frontNearX + 1, 13 + gy, C.fur);

  rect(p, frontFarX, 10 + gy, 2, 3, C.furDark);
  set(p, frontFarX + 1, 13 + gy, C.furDark);

  return p;
}

function drawDogSheet() {
  const sheet = pixels(160, 16);
  const frames = [
    drawDog({ bounce: 0, tail: 0 }),
    drawDog({ bounce: 1, tail: 1 }),
    drawDog({ bounce: 0, tail: 0 }),
    drawDog({ bounce: 0, tail: 1, blink: true }),
    drawDog({ sit: true, tail: 0 }),
    drawDog({ sit: true, tail: 1, blink: true }),
    drawDog({ bounce: 0, walk: 1, tail: 1 }),
    drawDog({ bounce: 1, walk: -1, tail: 0 }),
    drawDog({ sleep: true, tail: 0 }),
    drawDog({ sleep: true, tail: 1 }),
  ];
  frames.forEach((f, i) => blit(sheet, f, i * 16, 0));
  return sheet;
}

function nearestScale(src, scale) {
  const dst = pixels(src.w * scale, src.h * scale);
  for (let y = 0; y < dst.h; y++) {
    for (let x = 0; x < dst.w; x++) {
      const sx = Math.floor(x / scale);
      const sy = Math.floor(y / scale);
      const i = (sy * src.w + sx) * 4;
      set(dst, x, y, [src.rgba[i], src.rgba[i + 1], src.rgba[i + 2], src.rgba[i + 3]]);
    }
  }
  return dst;
}

function makeIco(png32) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);
  const entry = Buffer.alloc(16);
  entry[0] = 32;
  entry[1] = 32;
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(png32.length, 8);
  entry.writeUInt32LE(22, 12);
  return Buffer.concat([header, entry, png32]);
}

const room = drawRoom();
const self = drawSheet();
const cat = drawCatSheet();
const dog = drawDogSheet();
savePng("src/assets/room.png", room);
savePng("src/assets/self.png", self);
savePng("src/assets/cat.png", cat);
savePng("src/assets/dog.png", dog);

const iconSrc = pixels(32, 32, [0, 0, 0, 0]);
blit(iconSrc, nearestScale(room, 1), -24, -8);
const tiny = nearestScale(drawChar({ bounce: 0 }), 1);
blit(iconSrc, tiny, 7, 8);
const icon32 = nearestScale(iconSrc, 1);
const icon128 = nearestScale(iconSrc, 4);
const icon256 = nearestScale(iconSrc, 8);

savePng("src-tauri/icons/32x32.png", icon32);
savePng("src-tauri/icons/128x128.png", icon128);
savePng("src-tauri/icons/128x128@2x.png", icon256);
savePng("src-tauri/icons/icon.png", icon32);
writeFileSync(join(root, "src-tauri/icons/icon.ico"), makeIco(encodePng(icon32.w, icon32.h, icon32.rgba)));

console.log("Wrote room, self, cat, dog, and tray icons.");
