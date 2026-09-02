import { parseHex, shade, SRC, type Theme } from "./theme";

type Triple = readonly [number, number, number];

function rgb(hex: string): [number, number, number] {
  const { r, g, b } = parseHex(hex);
  return [r, g, b];
}

function recolor(source: HTMLImageElement, swaps: { from: Triple; to: Triple }[]): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = source.naturalWidth || source.width;
  canvas.height = source.naturalHeight || source.height;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(source, 0, 0);
  const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const map = new Map<string, Triple>();
  for (const swap of swaps) {
    map.set(swap.from.join(","), swap.to);
  }
  const px = image.data;
  for (let i = 0; i < px.length; i += 4) {
    if (px[i + 3] === 0) continue;
    const next = map.get(`${px[i]},${px[i + 1]},${px[i + 2]}`);
    if (!next) continue;
    px[i] = next[0];
    px[i + 1] = next[1];
    px[i + 2] = next[2];
  }
  ctx.putImageData(image, 0, 0);
  return canvas;
}

export function recolorSelf(source: HTMLImageElement, theme: Theme): HTMLCanvasElement {
  return recolor(source, [
    { from: SRC.hair, to: rgb(theme.hair) },
    { from: SRC.skin, to: rgb(theme.skin) },
    { from: SRC.shirt, to: rgb(theme.shirt) },
    { from: SRC.pants, to: rgb(theme.pants) },
  ]);
}

export function recolorCat(source: HTMLImageElement, theme: Theme): HTMLCanvasElement {
  const fur = rgb(theme.fur);
  const dark = rgb(shade(theme.fur, 0.78));
  return recolor(source, [
    { from: SRC.fur, to: fur },
    { from: SRC.furDark, to: dark },
  ]);
}
