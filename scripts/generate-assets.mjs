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
  skin: [240, 200, 160],
  hair: [74, 55, 40],
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
  const p = pixels(64, 48);
  rect(p, 0, 0, 64, 48, C.outline);
  rect(p, 1, 1, 62, 30, C.wall);
  rect(p, 1, 24, 62, 7, C.wallShadow);
  rect(p, 1, 31, 62, 16, C.floor);
  for (let y = 32; y < 47; y += 3) {
    rect(p, 1, y, 62, 1, C.floorDark);
  }

  rect(p, 22, 6, 20, 16, C.frame);
  rect(p, 24, 8, 16, 12, C.glass);
  rect(p, 24, 8, 16, 5, C.glassLite);
  rect(p, 31, 8, 2, 12, C.frame);
  rect(p, 24, 13, 16, 1, C.frame);

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
  rect(p, 8, 32, 7, 2, C.gold);
  rect(p, 8, 34, 2, 3, C.pianoDark);
  rect(p, 13, 34, 2, 3, C.pianoDark);

  rect(p, 40, 24, 18, 10, C.desk);
  rect(p, 39, 23, 20, 3, C.deskTop);
  rect(p, 41, 26, 3, 2, C.mug);
  set(p, 42, 26, C.tea);
  rect(p, 49, 14, 9, 9, C.outline);
  rect(p, 50, 15, 7, 7, [96, 168, 196]);
  rect(p, 51, 16, 2, 2, [220, 240, 250]);
  rect(p, 52, 23, 3, 1, C.outline);
  rect(p, 45, 24, 8, 2, C.keys);
  for (const kx of [46, 48, 50, 52]) {
    set(p, kx, 24, C.blackKey);
  }
  rect(p, 40, 26, 2, 6, C.desk);
  rect(p, 40, 31, 8, 2, C.deskTop);
  rect(p, 40, 33, 2, 3, C.desk);
  rect(p, 46, 33, 2, 3, C.desk);

  rect(p, 22, 38, 22, 6, C.rug);
  rect(p, 23, 39, 20, 4, C.rugDark);
  rect(p, 24, 40, 18, 2, C.rug);

  rect(p, 0, 0, 64, 1, C.outline);
  rect(p, 0, 47, 64, 1, C.outline);
  rect(p, 0, 0, 1, 48, C.outline);
  rect(p, 63, 0, 1, 48, C.outline);
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

function drawChar({ bounce = 0, sit = false, walk = 0, blink = false, type = false, typeHand = 0 } = {}) {
  const p = pixels(16, 16);

  if (type) {
    rect(p, 4, 10, 7, 4, C.pants);
    rect(p, 9, 11, 4, 3, C.pants);
    set(p, 12, 13, C.shoes);
    rect(p, 4, 5, 7, 6, C.shirt);
    rect(p, 5, 1, 6, 5, C.skin);
    rect(p, 4, 2, 8, 4, C.skin);
    rect(p, 4, 0, 8, 3, C.hair);
    rect(p, 3, 1, 2, 3, C.hair);
    rect(p, 11, 1, 2, 3, C.hair);
    if (blink) {
      rect(p, 6, 4, 2, 1, C.eye);
      rect(p, 9, 4, 2, 1, C.eye);
    } else {
      set(p, 6, 4, C.eye);
      set(p, 10, 4, C.eye);
      set(p, 6, 5, C.blush);
      set(p, 10, 5, C.blush);
    }
    set(p, 8, 6, C.outline);
    const leftY = typeHand === 2 ? 8 : 9;
    const rightY = typeHand === 1 ? 8 : 9;
    rect(p, 3, 6, 2, 3, C.skin);
    set(p, 4, leftY, C.skin);
    set(p, 5, leftY, C.skin);
    rect(p, 10, 6, 2, 3, C.skin);
    rect(p, 11, rightY, 4, 2, C.skin);
    return p;
  }

  const gy = sit ? 3 : bounce;
  const leg = sit ? 0 : walk;

  if (!sit) {
    rect(p, 4, 12 + gy, 3, 3, C.pants);
    rect(p, 9, 12 + gy, 3, 3, C.pants);
    set(p, 4 + (leg > 0 ? 1 : 0), 14 + gy, C.shoes);
    set(p, 11 - (leg < 0 ? 1 : 0), 14 + gy, C.shoes);
  } else {
    rect(p, 3, 12, 10, 3, C.pants);
    rect(p, 2, 13, 3, 2, C.shoes);
    rect(p, 11, 13, 3, 2, C.shoes);
  }

  rect(p, 4, 7 + gy, 8, 6, C.shirt);
  rect(p, 3, 8 + gy, 2, 4, C.skin);
  rect(p, 11, 8 + gy, 2, 4, C.skin);

  rect(p, 5, 2 + gy, 6, 6, C.skin);
  rect(p, 4, 3 + gy, 8, 4, C.skin);
  rect(p, 4, 1 + gy, 8, 3, C.hair);
  rect(p, 3, 2 + gy, 2, 3, C.hair);
  rect(p, 11, 2 + gy, 2, 3, C.hair);

  if (blink) {
    rect(p, 6, 5 + gy, 2, 1, C.eye);
    rect(p, 9, 5 + gy, 2, 1, C.eye);
  } else {
    set(p, 6, 5 + gy, C.eye);
    set(p, 10, 5 + gy, C.eye);
    set(p, 6, 6 + gy, C.blush);
    set(p, 10, 6 + gy, C.blush);
  }
  set(p, 8, 7 + gy, C.outline);
  return p;
}

function drawSheet() {
  const sheet = pixels(192, 16);
  const frames = [
    drawChar({ bounce: 0 }),
    drawChar({ bounce: 1 }),
    drawChar({ bounce: 0 }),
    drawChar({ bounce: 0, blink: true }),
    drawChar({ sit: true }),
    drawChar({ sit: true, blink: true }),
    drawChar({ bounce: 0, walk: 1 }),
    drawChar({ bounce: 1, walk: -1 }),
    drawChar({ type: true, typeHand: 0 }),
    drawChar({ type: true, typeHand: 1 }),
    drawChar({ type: true, typeHand: 0, blink: true }),
    drawChar({ type: true, typeHand: 2 }),
  ];
  frames.forEach((f, i) => blit(sheet, f, i * 16, 0));
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
savePng("src/assets/room.png", room);
savePng("src/assets/self.png", self);
savePng("src/assets/cat.png", cat);

const iconSrc = pixels(32, 32, [0, 0, 0, 0]);
blit(iconSrc, nearestScale(room, 1), -16, -8);
const tiny = nearestScale(drawChar({ bounce: 0 }), 1);
blit(iconSrc, tiny, 8, 10);
const icon32 = nearestScale(iconSrc, 1);
const icon128 = nearestScale(iconSrc, 4);
const icon256 = nearestScale(iconSrc, 8);

savePng("src-tauri/icons/32x32.png", icon32);
savePng("src-tauri/icons/128x128.png", icon128);
savePng("src-tauri/icons/128x128@2x.png", icon256);
savePng("src-tauri/icons/icon.png", icon32);
writeFileSync(join(root, "src-tauri/icons/icon.ico"), makeIco(encodePng(icon32.w, icon32.h, icon32.rgba)));

console.log("Wrote room, self, cat, and tray icons.");
