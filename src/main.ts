import { getCurrentWindow } from "@tauri-apps/api/window";
import { LogicalSize } from "@tauri-apps/api/dpi";
import { invoke } from "@tauri-apps/api/core";
import selfUrl from "./assets/self.png";
import catUrl from "./assets/cat.png";
import { PixelCat } from "./cat";
import { PixelSelf, SELF_FRAME_H, SELF_FRAME_W, SELF_PAD_X, SELF_PAD_Y } from "./self";
import { loadImage, ROOM_H, ROOM_W, SCALE, setupCanvas, windowSize } from "./render";
import { drawThemedRoom } from "./room";
import { recolorCat, recolorSelf } from "./recolor";
import {
  CAT_PRESETS,
  HAIR_STYLES,
  hairRow,
  loadTheme,
  ROBE_PRESETS,
  ROOM_PRESETS,
  saveTheme,
  SELF_PRESETS,
  type Theme,
} from "./theme";
import { drawRobe } from "./robe";
import { loadTodos, saveTodos, type Todo } from "./todos";

const CUSTOMIZE_H = 520;

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
    document.querySelector<HTMLElement>("#todos")!.hidden = true;
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
  const ids = [
    "wall",
    "floor",
    "furniture",
    "rug",
    "board",
    "hair",
    "skin",
    "shirt",
    "pants",
    "robe",
    "sash",
    "fur",
  ] as const;
  const inputs = Object.fromEntries(
    ids.map((id) => [id, document.querySelector<HTMLInputElement>(`#color-${id}`)!]),
  ) as Record<(typeof ids)[number], HTMLInputElement>;

  const syncInputs = () => {
    for (const id of ids) inputs[id].value = theme[id];
  };
  syncInputs();

  const syncHair = () => {
    for (const button of document.querySelectorAll<HTMLButtonElement>("#styles-hair button")) {
      button.classList.toggle("on", button.dataset.hair === theme.hairStyle);
    }
  };

  const syncRobe = () => {
    for (const button of document.querySelectorAll<HTMLButtonElement>("#styles-robe button")) {
      const on = button.dataset.robe === "on";
      button.classList.toggle("on", on === theme.robeOn);
    }
  };

  const apply = () => {
    saveTheme(theme);
    onChange();
    syncInputs();
    syncHair();
    syncRobe();
  };
  syncHair();
  syncRobe();

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

  document.querySelector("#styles-hair")!.addEventListener("click", (event) => {
    const button = (event.target as HTMLElement).closest("button");
    const style = HAIR_STYLES.find((item) => item.id === button?.dataset.hair);
    if (!style) return;
    theme.hairStyle = style.id;
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

  document.querySelector("#styles-robe")!.addEventListener("click", (event) => {
    const button = (event.target as HTMLElement).closest("button");
    if (!button?.dataset.robe) return;
    theme.robeOn = button.dataset.robe === "on";
    apply();
  });

  document.querySelector("#presets-robe")!.addEventListener("click", (event) => {
    const button = (event.target as HTMLElement).closest("button");
    const preset = ROBE_PRESETS.find((item) => item.id === button?.dataset.robePreset);
    if (!preset) return;
    theme.robe = preset.robe;
    theme.sash = preset.sash;
    theme.robeOn = true;
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

function bindTodos() {
  const panel = document.querySelector<HTMLElement>("#todos")!;
  const list = document.querySelector<HTMLUListElement>("#todo-list")!;
  const form = document.querySelector<HTMLFormElement>("#todo-form")!;
  const input = document.querySelector<HTMLInputElement>("#todo-input")!;
  const close = document.querySelector<HTMLButtonElement>("#todo-close")!;
  const hotspot = document.querySelector<HTMLButtonElement>("#board-hotspot")!;
  let todos = loadTodos();

  const render = () => {
    list.replaceChildren();
    if (todos.length === 0) {
      const empty = document.createElement("li");
      empty.className = "todo-empty";
      empty.textContent = "Pin a note…";
      list.append(empty);
      return;
    }
    for (const todo of todos) {
      const item = document.createElement("li");
      if (todo.done) item.classList.add("done");
      const check = document.createElement("button");
      check.type = "button";
      check.className = "check";
      check.title = todo.done ? "Not done" : "Done";
      check.setAttribute("aria-label", check.title);
      const text = document.createElement("span");
      text.textContent = todo.text;
      const drop = document.createElement("button");
      drop.type = "button";
      drop.className = "drop";
      drop.title = "Remove";
      drop.setAttribute("aria-label", "Remove");
      drop.textContent = "×";
      check.addEventListener("click", () => {
        todo.done = !todo.done;
        saveTodos(todos);
        render();
      });
      drop.addEventListener("click", () => {
        todos = todos.filter((entry) => entry.id !== todo.id);
        saveTodos(todos);
        render();
      });
      item.append(check, text, drop);
      list.append(item);
    }
  };

  const setOpen = (on: boolean) => {
    panel.hidden = !on;
    if (on) input.focus();
  };

  hotspot.addEventListener("click", (event) => {
    event.stopPropagation();
    setOpen(panel.hidden);
  });

  close.addEventListener("click", () => setOpen(false));

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    const todo: Todo = { id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, text, done: false };
    todos = [todo, ...todos];
    saveTodos(todos);
    input.value = "";
    render();
    list.scrollTop = 0;
  });

  render();
  return { close: () => setOpen(false) };
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
  bindTodos();

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
    buddyHotspot.title = buddy.nextClickLabel();
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
    ctx.clearRect(0, 0, ROOM_W * SCALE, ROOM_H * SCALE);
    drawThemedRoom(ctx, theme, glow);
    cat.draw(ctx, catSheet, SCALE);
    buddy.draw(ctx, selfSheet, SCALE, hairRow(theme.hairStyle));
    drawRobe(ctx, buddy, SCALE, theme);
    buddyHotspot.style.left = `${(Math.round(buddy.x) - SELF_PAD_X) * SCALE}px`;
    buddyHotspot.style.top = `${(Math.round(buddy.y) - SELF_PAD_Y) * SCALE}px`;
    buddyHotspot.style.width = `${SELF_FRAME_W * SCALE}px`;
    buddyHotspot.style.height = `${SELF_FRAME_H * SCALE}px`;
    catHotspot.style.left = `${Math.round(cat.x) * SCALE}px`;
    catHotspot.style.top = `${Math.round(cat.y) * SCALE}px`;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

boot().catch((err) => {
  console.error(err);
});
