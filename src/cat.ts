export type CatState = "idle" | "sit" | "walk" | "sleep";

const FRAME_W = 16;
const FRAME_H = 16;
const IDLE_FRAMES = 4;
const SIT_FRAMES = 2;
const WALK_FRAMES = 2;
const SLEEP_FRAMES = 2;

const MIN_X = 22;
const MAX_X = 32;
const BACK_Y = 22;

export class PixelCat {
  x = 24;
  y = BACK_Y;
  facing: 1 | -1 = 1;
  state: CatState = "idle";
  frame = 0;
  private frameMs = 0;
  private stateMs = 0;
  private walkTarget = 24;

  update(dtMs: number) {
    this.frameMs += dtMs;
    this.stateMs += dtMs;

    const frameDur =
      this.state === "walk" ? 140 : this.state === "sleep" ? 700 : this.state === "sit" ? 420 : 260;
    if (this.frameMs >= frameDur) {
      this.frameMs -= frameDur;
      const count =
        this.state === "idle"
          ? IDLE_FRAMES
          : this.state === "sit"
            ? SIT_FRAMES
            : this.state === "walk"
              ? WALK_FRAMES
              : SLEEP_FRAMES;
      this.frame = (this.frame + 1) % count;
    }

    if (this.state === "walk") {
      const dir = this.walkTarget >= this.x ? 1 : -1;
      this.facing = dir as 1 | -1;
      this.x += dir * 0.035 * dtMs;
      if ((dir > 0 && this.x >= this.walkTarget) || (dir < 0 && this.x <= this.walkTarget)) {
        this.x = this.walkTarget;
        this.enter(Math.random() < 0.55 ? "sit" : "idle");
      }
      return;
    }

    const hold =
      this.state === "sleep"
        ? 5000 + Math.random() * 2500
        : this.state === "sit"
          ? 2800 + Math.random() * 1200
          : 2400 + Math.random() * 1600;
    if (this.stateMs < hold) return;

    if (this.state === "sleep") {
      this.enter("idle");
      return;
    }

    const roll = Math.random();
    if (this.state === "sit") {
      if (roll < 0.35) this.enter("sleep");
      else if (roll < 0.7) this.enter("idle");
      else this.startWalk();
      return;
    }

    if (roll < 0.4) this.enter("sit");
    else if (roll < 0.55) this.enter("sleep");
    else this.startWalk();
  }

  draw(ctx: CanvasRenderingContext2D, sheet: CanvasImageSource, scale: number) {
    const sx = this.sheetFrame() * FRAME_W;
    const dx = Math.round(this.x) * scale;
    const dy = Math.round(this.y) * scale;
    const dw = FRAME_W * scale;
    const dh = FRAME_H * scale;
    ctx.save();
    if (this.facing < 0) {
      ctx.translate(dx + dw, dy);
      ctx.scale(-1, 1);
      ctx.drawImage(sheet, sx, 0, FRAME_W, FRAME_H, 0, 0, dw, dh);
    } else {
      ctx.drawImage(sheet, sx, 0, FRAME_W, FRAME_H, dx, dy, dw, dh);
    }
    ctx.restore();
  }

  private sheetFrame(): number {
    if (this.state === "idle") return this.frame % IDLE_FRAMES;
    if (this.state === "sit") return IDLE_FRAMES + (this.frame % SIT_FRAMES);
    if (this.state === "walk") return IDLE_FRAMES + SIT_FRAMES + (this.frame % WALK_FRAMES);
    return IDLE_FRAMES + SIT_FRAMES + WALK_FRAMES + (this.frame % SLEEP_FRAMES);
  }

  private startWalk() {
    let next = MIN_X + Math.random() * (MAX_X - MIN_X);
    if (Math.abs(next - this.x) < 5) {
      next = this.x < 20 ? MAX_X - 1 : MIN_X + 1;
    }
    this.walkTarget = next;
    this.enter("walk");
  }

  private enter(state: CatState) {
    this.state = state;
    this.frame = 0;
    this.frameMs = 0;
    this.stateMs = 0;
  }
}
