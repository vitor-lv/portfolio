import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";

export type Palette = {
  glow: string;
  accent: string;
  title: string;
};

const PALETTES: Palette[] = [
  {
    glow: "#145F88",
    accent: "#7EC4E1",
    title: "#6F9EB1",
  },
  {
    glow: "#0D5C5C",
    accent: "#2DBDBD",
    title: "#4A9B9B",
  },
  {
    glow: "#2A4A5E",
    accent: "#6B9BB2",
    title: "#5A7A8A",
  },
  // Violet — deep plum / soft lavender
  {
    glow: "#2E2442",
    accent: "#9B8BB5",
    title: "#7B6B9A",
  },
  // Orange — warm terracotta / amber
  {
    glow: "#4A3528",
    accent: "#C4A574",
    title: "#A88B6B",
  },
];

type ContextValue = {
  paletteIndex: number;
  currentPalette: Palette;
  cyclePalette: () => void;
};

const ColorSchemeContext = createContext<ContextValue | null>(null);

export function ColorSchemeProvider({ children }: { children: ReactNode }) {
  const [paletteIndex, setPaletteIndex] = useState(0);
  const currentPalette = PALETTES[paletteIndex];

  const cyclePalette = useCallback(() => {
    setPaletteIndex((i) => (i + 1) % PALETTES.length);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--color-accent", currentPalette.accent);
    root.style.setProperty("--color-hero-title", currentPalette.title);
    root.style.setProperty("--color-glow", currentPalette.glow);
  }, [currentPalette]);

  return (
    <ColorSchemeContext.Provider
      value={{ paletteIndex, currentPalette, cyclePalette }}
    >
      {children}
    </ColorSchemeContext.Provider>
  );
}

export function useColorScheme(): ContextValue {
  const ctx = useContext(ColorSchemeContext);
  if (!ctx) throw new Error("useColorScheme must be used within ColorSchemeProvider");
  return ctx;
}

/** Parse hex "#145F88" to "r, g, b" for rgba() in canvas */
export function hexToRgb(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 0xff;
  const g = (n >> 8) & 0xff;
  const b = n & 0xff;
  return `${r}, ${g}, ${b}`;
}
