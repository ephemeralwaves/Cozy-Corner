export type SelfState = "idle" | "sit" | "walk" | "type";

const FRAME_W = 16;
const FRAME_H = 16;
const IDLE_FRAMES = 4;
const SIT_FRAMES = 2;
const WALK_FRAMES = 2;
const TYPE_FRAMES = 4;

const MIN_X = 20;
const MAX_X = 32;
const DESK_X = 38;
const DESK_Y = 18;
const GROUND_Y = 28;

export class PixelSelf {
  x = 24;
  y = GROUND_Y;
  facing: 1 | -1 = 1;
  state: SelfState = "idle";
  frame = 0;
  private frameMs = 0;
  private stateMs = 0;
  private walkTarget = 24;
  private walkFromX = 24;
  private walkFromY = GROUND_Y;
  private walkToY = GROUND_Y;
  private afterWalk: Exclude<SelfState, "walk"> = "idle";
  private holdMs = 3500;

  get typing(): boolean {
    return this.state === "type" || (this.state === "walk" && this.afterWalk === "type");
  }

  onClick() {
    if (this.typing) {
      this.y = GROUND_Y;
      this.facing = -1;
      this.enter("idle");
      return;
    }
    this.goToDesk();
  }

  update(dtMs: number) {
    this.frameMs += dtMs;
    this.stateMs += dtMs;

    const frameDur =
      this.state === "walk" ? 160 : this.state === "type" ? 110 : this.state === "sit" ? 480 : 280;
    if (this.frameMs >= frameDur) {
      this.frameMs -= frameDur;
      const count =
        this.state === "idle"
          ? IDLE_FRAMES
          : this.state === "sit"
            ? SIT_FRAMES
            : this.state === "walk"
              ? WALK_FRAMES
              : TYPE_FRAMES;
      this.frame = (this.frame + 1) % count;
    }

    if (this.state === "walk") {
      const span = Math.max(1, Math.abs(this.walkTarget - this.walkFromX));
      const dir = this.walkTarget >= this.x ? 1 : -1;
      this.facing = dir as 1 | -1;
      this.x += dir * 0.045 * dtMs;
      const t = Math.min(1, Math.abs(this.x - this.walkFromX) / span);
      this.y = this.walkFromY + (this.walkToY - this.walkFromY) * t;
      if ((dir > 0 && this.x >= this.walkTarget) || (dir < 0 && this.x <= this.walkTarget)) {
        this.x = this.walkTarget;
        this.y = this.walkToY;
        if (this.afterWalk === "type") this.facing = 1;
        this.enter(this.afterWalk);
      }
      return;
    }

    if (this.state === "type") {
      this.facing = 1;
      this.y = DESK_Y;
      return;
    }

    this.y = GROUND_Y;
    if (this.stateMs < this.holdMs) return;

    if (this.state === "sit") {
      this.enter("idle");
      return;
    }

    if (Math.random() < 0.4) {
      this.enter("sit");
      return;
    }

    let next = MIN_X + Math.random() * (MAX_X - MIN_X);
    if (Math.abs(next - this.x) < 6) {
      next = this.x < 26 ? MAX_X - 2 : MIN_X + 2;
    }
    this.startWalk(next, "idle");
  }

  sheetFrame(): number {
    if (this.state === "idle") return this.frame % IDLE_FRAMES;
    if (this.state === "sit") return IDLE_FRAMES + (this.frame % SIT_FRAMES);
    if (this.state === "walk") return IDLE_FRAMES + SIT_FRAMES + (this.frame % WALK_FRAMES);
    return IDLE_FRAMES + SIT_FRAMES + WALK_FRAMES + (this.frame % TYPE_FRAMES);
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

  private goToDesk() {
    this.facing = 1;
    if (Math.abs(this.x - DESK_X) < 2) {
      this.x = DESK_X;
      this.y = DESK_Y;
      this.enter("type");
      return;
    }
    this.startWalk(DESK_X, "type");
  }

  private startWalk(target: number, then: Exclude<SelfState, "walk">) {
    this.walkFromX = this.x;
    this.walkFromY = this.y;
    this.walkTarget = target;
    this.walkToY = then === "type" ? DESK_Y : GROUND_Y;
    this.afterWalk = then;
    this.enter("walk");
  }

  private enter(state: SelfState) {
    this.state = state;
    this.frame = 0;
    this.frameMs = 0;
    this.stateMs = 0;
    if (state === "sit") this.holdMs = 2200;
    else this.holdMs = 3200 + Math.random() * 1800;
  }
}
