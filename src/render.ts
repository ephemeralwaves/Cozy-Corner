export const ROOM_W = 80;
export const ROOM_INNER_H = 48;
/** Extra pixels above the room box for peaked roofs. */
export const ROOF_PAD = 18;
export const ROOM_H = ROOM_INNER_H + ROOF_PAD;
export const SCALE = 4;

export function windowSize(): { width: number; height: number } {
  return { width: ROOM_W * SCALE, height: ROOM_H * SCALE };
}

export function setupCanvas(canvas: HTMLCanvasElement, dpr: number): CanvasRenderingContext2D {
  const { width, height } = windowSize();
  const pixelRatio = dpr || 1;
  // Integer sprite scale on the backing store so 125%/150% DPI stays nearest-neighbor crisp.
  const backing = Math.max(SCALE, Math.round(SCALE * pixelRatio));
  canvas.width = ROOM_W * backing;
  canvas.height = ROOM_H * backing;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas 2D is not available");
  }
  ctx.imageSmoothingEnabled = false;
  const map = backing / SCALE;
  ctx.setTransform(map, 0, 0, map, 0, 0);
  ctx.imageSmoothingEnabled = false;
  return ctx;
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
    img.src = src;
  });
}
