import { getCurrentWindow } from "@tauri-apps/api/window";
import { LogicalSize } from "@tauri-apps/api/dpi";
import { invoke } from "@tauri-apps/api/core";
import selfUrl from "./assets/self.png";
import catUrl from "./assets/cat.png";
import { PixelCat } from "./cat";
import { PixelSelf } from "./self";
import { loadImage, SCALE, setupCanvas, windowSize } from "./render";
import { drawThemedRoom } from "./room";
import { recolorCat, recolorSelf } from "./recolor";
import {
  CAT_PRESETS,
  loadTheme,
  ROOM_PRESETS,
  saveTheme,
  SELF_PRESETS,
  type Theme,
} from "./theme";

const CUSTOMIZE_H = 368;

function hideMenu(menu: HTMLElement) {
  menu.hidden = true;
}

function setTab(tab: string) {
  for (const button of document.querySelectorAll<HTMLButtonElement>("#cust-tabs button")) {
    button.classList.toggle("on", button.dataset.tab === tab);
  }
  for (const panel of document.querySelectorAll<HTMLElement>("[data-panel]")) {
    panel.hidden = panel.dataset.panel !== tab;
  }
}

async function setCustomizeMode(on: boolean, tab?: string) {
  const { width, height } = windowSize();
  document.body.classList.toggle("customize", on);
  document.querySelector<HTMLElement>("#customize")!.hidden = !on;
  if (on && tab) setTab(tab);
  const win = getCurrentWindow();
  await win.setSize(new LogicalSize(width, on ? CUSTOMIZE_H : height));
}

async function handleAction(
  action: string | undefined,
  notes: HTMLElement,
  playing: { value: boolean },
) {
  if (action === "hide") {
    await setCustomizeMode(false);
    await getCurrentWindow().hide();
    return;
  }
  if (action === "quit") {
    await invoke("quit_app");
    return;
  }
  if (action === "player") {
    await invoke("radio_toggle_window");
    return;
  }
  if (action === "customize") {
    await setCustomizeMode(true, "room");
    return;
  }
  if (action === "play") {
    await invoke("radio_play_pause");
    playing.value = !playing.value;
    notes.hidden = !playing.value;
    return;
  }
  if (action === "stop") {
    await invoke("radio_stop");
    playing.value = false;
    notes.hidden = true;
  }
}

function bindCustomize(theme: Theme, onChange: () => void) {
  const ids: Array<keyof Theme> = [
    "wall",
    "floor",
    "furniture",
    "hair",
    "skin",
    "shirt",
    "pants",
    "fur",
  ];
  const inputs = Object.fromEntries(
    ids.map((id) => [id, document.querySelector<HTMLInputElement>(`#color-${id}`)!]),
  ) as Record<keyof Theme, HTMLInputElement>;

  const syncInputs = () => {
    for (const id of ids) inputs[id].value = theme[id];
  };
  syncInputs();

  const apply = () => {
    saveTheme(theme);
    onChange();
    syncInputs();
  };

  for (const id of ids) {
    inputs[id].addEventListener("input", () => {
      theme[id] = inputs[id].value;
      apply();
    });
  }

  document.querySelector("#cust-tabs")!.addEventListener("click", (event) => {
    const button = (event.target as HTMLElement).closest("button");
    if (button?.dataset.tab) setTab(button.dataset.tab);
  });

  document.querySelector("#presets-room")!.addEventListener("click", (event) => {
    const button = (event.target as HTMLElement).closest("button");
    const preset = ROOM_PRESETS.find((item) => item.id === button?.dataset.preset);
    if (!preset) return;
    Object.assign(theme, preset.theme);
    apply();
  });

  document.querySelector("#presets-self")!.addEventListener("click", (event) => {
    const button = (event.target as HTMLElement).closest("button");
    const preset = SELF_PRESETS.find((item) => item.id === button?.dataset.self);
    if (!preset) return;
    theme.hair = preset.hair;
    theme.skin = preset.skin;
    theme.shirt = preset.shirt;
    theme.pants = preset.pants;
    apply();
  });

  document.querySelector("#presets-cat")!.addEventListener("click", (event) => {
    const button = (event.target as HTMLElement).closest("button");
    const preset = CAT_PRESETS.find((item) => item.id === button?.dataset.cat);
    if (!preset) return;
    theme.fur = preset.fur;
    apply();
  });

  document.querySelector("#customize-done")!.addEventListener("click", () => {
    void setCustomizeMode(false);
  });
}

async function boot() {
  const canvas = document.querySelector<HTMLCanvasElement>("#room")!;
  const menu = document.querySelector<HTMLElement>("#menu")!;
  const hotspot = document.querySelector<HTMLButtonElement>("#radio-hotspot")!;
  const buddyHotspot = document.querySelector<HTMLButtonElement>("#buddy-hotspot")!;
  const catHotspot = document.querySelector<HTMLButtonElement>("#cat-hotspot")!;
  const notes = document.querySelector<HTMLElement>("#notes")!;
  const playing = { value: false };
  const theme = loadTheme();
  let ctx = setupCanvas(canvas, window.devicePixelRatio);
  const [selfSrc, catSrc] = await Promise.all([loadImage(selfUrl), loadImage(catUrl)]);
  let selfSheet: CanvasImageSource = recolorSelf(selfSrc, theme);
  let catSheet: CanvasImageSource = recolorCat(catSrc, theme);
  const buddy = new PixelSelf();
  const cat = new PixelCat();

  bindCustomize(theme, () => {
    selfSheet = recolorSelf(selfSrc, theme);
    catSheet = recolorCat(catSrc, theme);
  });

  window.addEventListener("resize", () => {
    ctx = setupCanvas(canvas, window.devicePixelRatio);
  });

  window.addEventListener("cozy-customize", () => {
    void setCustomizeMode(true, "room");
  });

  document.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    menu.hidden = false;
    const pad = 8;
    const x = Math.min(event.clientX, window.innerWidth - menu.offsetWidth - pad);
    const y = Math.min(event.clientY, window.innerHeight - menu.offsetHeight - pad);
    menu.style.left = `${Math.max(pad, x)}px`;
    menu.style.top = `${Math.max(pad, y)}px`;
  });

  document.addEventListener("pointerdown", (event) => {
    if (!menu.contains(event.target as Node)) hideMenu(menu);
  });

  hotspot.addEventListener("click", async (event) => {
    event.stopPropagation();
    await handleAction("play", notes, playing);
  });

  buddyHotspot.addEventListener("click", (event) => {
    event.stopPropagation();
    if (document.body.classList.contains("customize")) {
      setTab("self");
      return;
    }
    buddy.onClick();
    buddyHotspot.title = buddy.typing ? "Idle" : "Sit and type";
  });

  catHotspot.addEventListener("click", (event) => {
    event.stopPropagation();
    void setCustomizeMode(true, "cat");
  });

  menu.addEventListener("click", async (event) => {
    const button = (event.target as HTMLElement).closest("button");
    if (!button) return;
    hideMenu(menu);
    await handleAction(button.dataset.action, notes, playing);
  });

  let last = performance.now();
  const tick = (now: number) => {
    const dt = Math.min(48, now - last);
    last = now;
    buddy.update(dt);
    cat.update(dt);
    const glow = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(now / 1400));
    ctx.clearRect(0, 0, 256, 192);
    drawThemedRoom(ctx, theme, glow);
    cat.draw(ctx, catSheet, SCALE);
    buddy.draw(ctx, selfSheet, SCALE);
    buddyHotspot.style.left = `${Math.round(buddy.x) * SCALE}px`;
    buddyHotspot.style.top = `${Math.round(buddy.y) * SCALE}px`;
    catHotspot.style.left = `${Math.round(cat.x) * SCALE}px`;
    catHotspot.style.top = `${Math.round(cat.y) * SCALE}px`;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

boot().catch((err) => {
  console.error(err);
});
