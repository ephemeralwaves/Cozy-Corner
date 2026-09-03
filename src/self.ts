import { ROOF_PAD } from "./render";
import type { RoomStyle } from "./theme";

export const SELF_FRAME_W = 18;
export const SELF_FRAME_H = 20;
export const SELF_PAD_X = 1;
export const SELF_PAD_Y = 4;

export type SelfState = "idle" | "sit" | "walk" | "type" | "read" | "piano" | "brush" | "brew";

const FRAME_W = SELF_FRAME_W;
const FRAME_H = SELF_FRAME_H;
const IDLE_FRAMES = 4;
const SIT_FRAMES = 2;
const WALK_FRAMES = 2;
const TYPE_FRAMES = 4;
const READ_FRAMES = 4;
const PIANO_FRAMES = 4;
const BRUSH_FRAMES = 4;
const BREW_FRAMES = 4;

const MIN_X = 16;
const MAX_X = 48;
const DESK_X = 54;
// Writing/typing anchor: high enough that arms rest on the tabletop.
const DESK_Y = 15 + ROOF_PAD;
const CHAIR_X = 29;
// Raised by 1px so the seated sprite sits on the chair top.
const CHAIR_Y = 19 + ROOF_PAD;
const PIANO_X = 5;
const PIANO_Y = 15 + ROOF_PAD;
const GROUND_Y = 28 + ROOF_PAD;

const DESK_STATES: SelfState[] = ["type", "brush", "brew"];

function deskStateFor(style: RoomStyle): Exclude<SelfState, "walk"> {
  if (style === "dynasty") return "brush";
  if (style === "enchanted") return "brew";
  return "type";
}

export class PixelSelf {
  x = 24;
  y = GROUND_Y;
  facing: 1 | -1 = 1;
  state: SelfState = "idle";
  roomStyle: RoomStyle = "modern";

  setRoomStyle(style: RoomStyle) {
    this.roomStyle = style;
    const dest = deskStateFor(style);
    if (DESK_STATES.includes(this.state) && this.state !== dest) this.enter(dest);
    if (this.state === "walk" && DESK_STATES.includes(this.afterWalk) && this.afterWalk !== dest) {
      this.afterWalk = dest;
    }
  }
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
    return (
      DESK_STATES.includes(this.state) ||
      (this.state === "walk" && DESK_STATES.includes(this.afterWalk))
    );
  }

  get reading(): boolean {
    return this.state === "read" || (this.state === "walk" && this.afterWalk === "read");
  }

  get playingPiano(): boolean {
    return this.state === "piano" || (this.state === "walk" && this.afterWalk === "piano");
  }

  nextClickLabel(): string {
    if (this.typing) return "Idle";
    if (this.reading) {
      if (this.roomStyle === "modern") return "Sit and type";
      if (this.roomStyle === "enchanted") return "Sit and brew";
      return "Sit and write";
    }
    if (this.playingPiano) return "Read by the window";
    if (this.roomStyle === "dynasty") return "Play guzheng";
    if (this.roomStyle === "enchanted") return "Play harp";
    return "Play piano";
  }

  onClick() {
    const busy = this.state === "walk" ? this.afterWalk : this.state;
    if (DESK_STATES.includes(busy)) {
      this.y = GROUND_Y;
      this.facing = -1;
      this.enter("idle");
      return;
    }
    if (busy === "read") {
      this.goToDesk();
      return;
    }
    if (busy === "piano") {
      this.goToChair();
      return;
    }
    this.goToPiano();
  }

  update(dtMs: number) {
    this.frameMs += dtMs;
    this.stateMs += dtMs;

    const frameDur =
      this.state === "walk"
        ? 160
        : this.state === "type"
          ? 110
          : this.state === "brush" || this.state === "brew"
            ? 280
            : this.state === "read"
              ? 520
              : this.state === "piano"
                ? 130
                : this.state === "sit"
                  ? 480
                  : 280;
    if (this.frameMs >= frameDur) {
      this.frameMs -= frameDur;
      const count =
        this.state === "idle"
          ? IDLE_FRAMES
          : this.state === "sit"
            ? SIT_FRAMES
            : this.state === "walk"
              ? WALK_FRAMES
              : this.state === "read"
                ? READ_FRAMES
                : this.state === "piano"
                  ? PIANO_FRAMES
                  : this.state === "brush"
                    ? BRUSH_FRAMES
                    : this.state === "brew"
                      ? BREW_FRAMES
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
        if (
          this.afterWalk === "type" ||
          this.afterWalk === "brush" ||
          this.afterWalk === "brew" ||
          this.afterWalk === "read" ||
          this.afterWalk === "piano"
        ) {
          this.facing = 1;
        }
        this.enter(this.afterWalk);
      }
      return;
    }

    if (DESK_STATES.includes(this.state)) {
      this.facing = 1;
      this.y = DESK_Y;
      return;
    }

    if (this.state === "read") {
      this.facing = 1;
      this.y = CHAIR_Y;
      return;
    }

    if (this.state === "piano") {
      this.facing = 1;
      this.y = PIANO_Y;
      return;
    }

    this.y = GROUND_Y;
    if (this.state === "sit") {
      this.enter("idle");
      return;
    }
    if (this.stateMs < this.holdMs) return;

    let next = MIN_X + Math.random() * (MAX_X - MIN_X);
    if (Math.abs(next - this.x) < 8) {
      next = this.x < (MIN_X + MAX_X) / 2 ? MAX_X - 2 : MIN_X + 2;
    }
    this.startWalk(next, "idle");
  }

  sheetFrame(): number {
    if (this.state === "idle") return this.frame % IDLE_FRAMES;
    if (this.state === "sit") return IDLE_FRAMES + (this.frame % SIT_FRAMES);
    if (this.state === "walk") return IDLE_FRAMES + SIT_FRAMES + (this.frame % WALK_FRAMES);
    if (this.state === "type") {
      return IDLE_FRAMES + SIT_FRAMES + WALK_FRAMES + (this.frame % TYPE_FRAMES);
    }
    if (this.state === "read") {
      return IDLE_FRAMES + SIT_FRAMES + WALK_FRAMES + TYPE_FRAMES + (this.frame % READ_FRAMES);
    }
    if (this.state === "brush") {
      return (
        IDLE_FRAMES + SIT_FRAMES + WALK_FRAMES + TYPE_FRAMES + READ_FRAMES + PIANO_FRAMES +
        (this.frame % BRUSH_FRAMES)
      );
    }
    if (this.state === "brew") {
      return (
        IDLE_FRAMES +
        SIT_FRAMES +
        WALK_FRAMES +
        TYPE_FRAMES +
        READ_FRAMES +
        PIANO_FRAMES +
        BRUSH_FRAMES +
        (this.frame % BREW_FRAMES)
      );
    }
    return (
      IDLE_FRAMES +
      SIT_FRAMES +
      WALK_FRAMES +
      TYPE_FRAMES +
      READ_FRAMES +
      (this.frame % PIANO_FRAMES)
    );
  }

  robePose(): { gy: number; pose: "stand" | "sit" | "type" | "read" | "piano" | "brush" | "brew" } {
    if (this.state === "brew") return { gy: 0, pose: "brew" };
    if (this.state === "brush") return { gy: 0, pose: "brush" };
    if (this.state === "type") return { gy: 0, pose: "type" };
    if (this.state === "read") return { gy: 0, pose: "read" };
    if (this.state === "piano") return { gy: 0, pose: "piano" };
    if (this.state === "sit") return { gy: 3, pose: "sit" };
    if (this.state === "walk") return { gy: this.frame % 2, pose: "stand" };
    return { gy: this.frame === 1 ? 1 : 0, pose: "stand" };
  }

  draw(ctx: CanvasRenderingContext2D, sheet: CanvasImageSource, scale: number, hairRow = 0) {
    const sx = this.sheetFrame() * FRAME_W;
    const sy = hairRow * FRAME_H;
    const dx = (Math.round(this.x) - SELF_PAD_X) * scale;
    const dy = (Math.round(this.y) - SELF_PAD_Y) * scale;
    const dw = FRAME_W * scale;
    const dh = FRAME_H * scale;
    ctx.save();
    if (this.facing < 0 && this.state !== "piano") {
      ctx.translate(dx + dw, dy);
      ctx.scale(-1, 1);
      ctx.drawImage(sheet, sx, sy, FRAME_W, FRAME_H, 0, 0, dw, dh);
    } else {
      ctx.drawImage(sheet, sx, sy, FRAME_W, FRAME_H, dx, dy, dw, dh);
    }
    ctx.restore();
  }

  private goToPiano() {
    this.facing = 1;
    if (Math.abs(this.x - PIANO_X) < 2) {
      this.x = PIANO_X;
      this.y = PIANO_Y;
      this.enter("piano");
      return;
    }
    this.startWalk(PIANO_X, "piano");
  }

  private goToChair() {
    this.facing = 1;
    if (Math.abs(this.x - CHAIR_X) < 2) {
      this.x = CHAIR_X;
      this.y = CHAIR_Y;
      this.enter("read");
      return;
    }
    this.startWalk(CHAIR_X, "read");
  }

  private goToDesk() {
    const dest = deskStateFor(this.roomStyle);
    this.facing = 1;
    if (Math.abs(this.x - DESK_X) < 2) {
      this.x = DESK_X;
      this.y = DESK_Y;
      this.enter(dest);
      return;
    }
    this.startWalk(DESK_X, dest);
  }

  private startWalk(target: number, then: Exclude<SelfState, "walk">) {
    this.walkFromX = this.x;
    this.walkFromY = this.y;
    this.walkTarget = target;
    this.walkToY =
      then === "type" || then === "brush" || then === "brew"
        ? DESK_Y
        : then === "read"
          ? CHAIR_Y
          : then === "piano"
            ? PIANO_Y
            : GROUND_Y;
    this.afterWalk = then;
    this.enter("walk");
  }

  private enter(state: SelfState) {
    this.state = state;
    this.frame = 0;
    this.frameMs = 0;
    this.stateMs = 0;
    this.holdMs = 1400 + Math.random() * 1600;
  }
}
