const STORAGE_KEY = "cozy-corner-theme";

export type Theme = {
  wall: string;
  floor: string;
  furniture: string;
  hair: string;
  skin: string;
  shirt: string;
  pants: string;
  fur: string;
};

export const DEFAULT_THEME: Theme = {
  wall: "#e8d5b7",
  floor: "#c4a574",
  furniture: "#8b5a3c",
  hair: "#4a3728",
  skin: "#f0c8a0",
  shirt: "#7eb8a0",
  pants: "#5c4a6e",
  fur: "#e09a4a",
};

export const ROOM_PRESETS = [
  { id: "cream", label: "Cream", theme: { wall: "#e8d5b7", floor: "#c4a574", furniture: "#8b5a3c" } },
  { id: "sage", label: "Sage", theme: { wall: "#d7e4cc", floor: "#b39a72", furniture: "#6d7f58" } },
  { id: "blush", label: "Blush", theme: { wall: "#f3d4ce", floor: "#c9a089", furniture: "#a45c5c" } },
  { id: "night", label: "Night", theme: { wall: "#3f4556", floor: "#2c2432", furniture: "#6a5348" } },
  { id: "sky", label: "Sky", theme: { wall: "#d3e7f4", floor: "#e0cba0", furniture: "#6f92b3" } },
] as const;

export const SELF_PRESETS = [
  { id: "default", label: "Teal", hair: "#4a3728", skin: "#f0c8a0", shirt: "#7eb8a0", pants: "#5c4a6e" },
  { id: "raven", label: "Raven", hair: "#1e1c22", skin: "#f0c8a0", shirt: "#4a5568", pants: "#2d2a38" },
  { id: "berry", label: "Berry", hair: "#c45c6a", skin: "#f3c4b0", shirt: "#f2b6c6", pants: "#7a4a62" },
  { id: "moss", label: "Moss", hair: "#3a4a28", skin: "#e0b080", shirt: "#7eb87a", pants: "#3d4a38" },
] as const;

export const CAT_PRESETS = [
  { id: "orange", label: "Orange", fur: "#e09a4a" },
  { id: "gray", label: "Gray", fur: "#9aa0a8" },
  { id: "black", label: "Black", fur: "#3a3230" },
  { id: "cream", label: "Cream", fur: "#e8d0a8" },
] as const;

export const SRC = {
  hair: [74, 55, 40] as const,
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
    return { ...DEFAULT_THEME, ...parsed };
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
