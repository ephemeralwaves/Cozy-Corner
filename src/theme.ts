const STORAGE_KEY = "cozy-corner-theme";

export const HAIR_STYLES = [
  { id: "short", label: "Short" },
  { id: "long", label: "Long" },
  { id: "afro", label: "Afro" },
  { id: "bun", label: "Bun" },
  { id: "pony", label: "Pony" },
] as const;

export type HairStyle = (typeof HAIR_STYLES)[number]["id"];

export const ROOM_STYLES = [
  { id: "modern", label: "Modern" },
  { id: "dynasty", label: "Dynasty" },
  { id: "enchanted", label: "Enchanted" },
  { id: "space", label: "Space" },
] as const;

export type RoomStyle = (typeof ROOM_STYLES)[number]["id"];

export const WINDOW_PANES = [
  { id: "sky", label: "Sky" },
  { id: "desktop", label: "Desktop" },
] as const;

export type WindowPanes = (typeof WINDOW_PANES)[number]["id"];

export const PET_KINDS = [
  { id: "cat", label: "Cat" },
  { id: "dog", label: "Dog" },
] as const;

export type PetKind = (typeof PET_KINDS)[number]["id"];

export type Theme = {
  wall: string;
  floor: string;
  furniture: string;
  rug: string;
  board: string;
  glass: string;
  windowPanes: WindowPanes;
  roomStyle: RoomStyle;
  hair: string;
  hairStyle: HairStyle;
  skin: string;
  shirt: string;
  pants: string;
  robeOn: boolean;
  robe: string;
  sash: string;
  fur: string;
  petKind: PetKind;
};

export const DEFAULT_THEME: Theme = {
  wall: "#e8d5b7",
  floor: "#c4a574",
  furniture: "#8b5a3c",
  rug: "#c45c5c",
  board: "#be9766",
  glass: "#8ec8e8",
  windowPanes: "sky",
  roomStyle: "modern",
  hair: "#4a3728",
  hairStyle: "short",
  skin: "#f0c8a0",
  shirt: "#7eb8a0",
  pants: "#5c4a6e",
  robeOn: false,
  robe: "#7aa6e8",
  sash: "#f0c430",
  fur: "#e09a4a",
  petKind: "cat",
};

export function hairRow(style: HairStyle): number {
  const index = HAIR_STYLES.findIndex((item) => item.id === style);
  return index < 0 ? 0 : index;
}

function isHairStyle(value: unknown): value is HairStyle {
  return HAIR_STYLES.some((item) => item.id === value);
}

function isWindowPanes(value: unknown): value is WindowPanes {
  return WINDOW_PANES.some((item) => item.id === value);
}

function isRoomStyle(value: unknown): value is RoomStyle {
  return ROOM_STYLES.some((item) => item.id === value);
}

function isPetKind(value: unknown): value is PetKind {
  return PET_KINDS.some((item) => item.id === value);
}

export const ROOM_PRESETS = [
  { id: "cream", label: "Cream", theme: { wall: "#e8d5b7", floor: "#c4a574", furniture: "#8b5a3c" } },
  { id: "sage", label: "Sage", theme: { wall: "#d7e4cc", floor: "#b39a72", furniture: "#6d7f58" } },
  { id: "blush", label: "Blush", theme: { wall: "#f3d4ce", floor: "#c9a089", furniture: "#a45c5c" } },
  { id: "night", label: "Night", theme: { wall: "#3f4556", floor: "#2c2432", furniture: "#6a5348" } },
  { id: "sky", label: "Sky", theme: { wall: "#d3e7f4", floor: "#e0cba0", furniture: "#6f92b3" } },
  { id: "dynasty", label: "Tang", theme: { wall: "#f0e0c0", floor: "#c09060", furniture: "#7a3820", rug: "#c83040", glass: "#e8d8a8" } },
  {
    id: "enchanted",
    label: "Grove",
    theme: {
      wall: "#c8d8d0",
      floor: "#a88868",
      furniture: "#6a4834",
      rug: "#5a8878",
      board: "#c4a878",
      glass: "#98b8d8",
    },
  },
  {
    id: "space",
    label: "Orbit",
    theme: {
      wall: "#2a3048",
      floor: "#dce2ea",
      furniture: "#4a5568",
      rug: "#3a5080",
      board: "#1a2040",
      glass: "#6a90c8",
    },
  },
] as const;

export const SELF_PRESETS = [
  { id: "default", label: "Teal", hair: "#4a3728", skin: "#f0c8a0", shirt: "#7eb8a0", pants: "#5c4a6e" },
  { id: "raven", label: "Raven", hair: "#1e1c22", skin: "#f0c8a0", shirt: "#4a5568", pants: "#2d2a38" },
  { id: "berry", label: "Berry", hair: "#c45c6a", skin: "#f3c4b0", shirt: "#f2b6c6", pants: "#7a4a62" },
  { id: "moss", label: "Moss", hair: "#3a4a28", skin: "#e0b080", shirt: "#7eb87a", pants: "#3d4a38" },
] as const;

export const ROBE_PRESETS = [
  { id: "sky", label: "Sky", robe: "#7aa6e8", sash: "#f0c430" },
  { id: "ink", label: "Ink", robe: "#3d4a78", sash: "#d4a840" },
  { id: "rose", label: "Rose", robe: "#e8a0b4", sash: "#f5e08a" },
  { id: "moss", label: "Moss", robe: "#6a8f68", sash: "#e8d48a" },
] as const;

export const CAT_PRESETS = [
  { id: "orange", label: "Orange", fur: "#e09a4a" },
  { id: "gray", label: "Gray", fur: "#9aa0a8" },
  { id: "black", label: "Black", fur: "#3a3230" },
  { id: "cream", label: "Cream", fur: "#e8d0a8" },
] as const;

export const SRC = {
  hair: [74, 55, 40] as const,
  hairDark: [58, 42, 30] as const,
  skin: [240, 200, 160] as const,
  shirt: [126, 184, 160] as const,
  pants: [92, 74, 110] as const,
  fur: [224, 154, 74] as const,
  furDark: [184, 108, 42] as const,
};

export function shade(hex: string, amount: number): string {
  const { r, g, b } = parseHex(hex);
  return toHex(r * amount, g * amount, b * amount);
}

export function mix(hex: string, other: string, t: number): string {
  const a = parseHex(hex);
  const b = parseHex(other);
  return toHex(a.r + (b.r - a.r) * t, a.g + (b.g - a.g) * t, a.b + (b.b - a.b) * t);
}

export function parseHex(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  const n = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return {
    r: parseInt(n.slice(0, 2), 16),
    g: parseInt(n.slice(2, 4), 16),
    b: parseInt(n.slice(4, 6), 16),
  };
}

export function loadTheme(): Theme {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_THEME };
    const parsed = JSON.parse(raw) as Partial<Theme>;
    const hairStyle = isHairStyle(parsed.hairStyle) ? parsed.hairStyle : DEFAULT_THEME.hairStyle;
    const windowPanes = isWindowPanes(parsed.windowPanes)
      ? parsed.windowPanes
      : DEFAULT_THEME.windowPanes;
    const roomStyle = isRoomStyle(parsed.roomStyle) ? parsed.roomStyle : DEFAULT_THEME.roomStyle;
    const petKind = isPetKind(parsed.petKind) ? parsed.petKind : DEFAULT_THEME.petKind;
    return {
      ...DEFAULT_THEME,
      ...parsed,
      hairStyle,
      windowPanes,
      roomStyle,
      petKind,
      robeOn: parsed.robeOn === true,
    };
  } catch {
    return { ...DEFAULT_THEME };
  }
}

export function saveTheme(theme: Theme) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
}

function toHex(r: number, g: number, b: number): string {
  const c = (v: number) =>
    Math.max(0, Math.min(255, Math.round(v)))
      .toString(16)
      .padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}
