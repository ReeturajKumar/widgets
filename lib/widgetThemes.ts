// Colour themes for the widget artwork.
//
// The widgets are bitmaps — the original renders, kept pixel-for-pixel — so a
// theme cannot repaint individual parts of a drawing. What it can do is put the
// whole image through one colour transform.
//
// Every theme here flattens the artwork to luminance first and then tints it.
// That is what makes a theme a theme: a green pump and a yellow valve come out
// the same colour family, instead of each shifting to somewhere different. The
// shading and the linework survive, because only hue and saturation are being
// replaced — lightness is what the grayscale pass preserves.

export interface WidgetTheme {
  id: string;
  label: string;
  /** Colour of the dot shown in the picker. */
  swatch: string;
  /** CSS filter applied to the artwork; empty means leave it alone. */
  filter: string;
}

export const WIDGET_THEMES: readonly WidgetTheme[] = [
  {
    id: "original",
    label: "Original",
    swatch: "#94a3b8",
    filter: "",
  },
  {
    id: "steel",
    label: "Steel",
    swatch: "#6b7280",
    filter: "grayscale(1) contrast(1.05)",
  },
  {
    id: "blueprint",
    label: "Blueprint",
    swatch: "#2563eb",
    filter: "grayscale(1) sepia(1) hue-rotate(175deg) saturate(3.2) brightness(0.95)",
  },
  {
    id: "ocean",
    label: "Ocean",
    swatch: "#0891b2",
    filter: "grayscale(1) sepia(1) hue-rotate(160deg) saturate(2.6)",
  },
  {
    id: "emerald",
    label: "Emerald",
    swatch: "#16a34a",
    filter: "grayscale(1) sepia(1) hue-rotate(105deg) saturate(2.4)",
  },
  {
    id: "amber",
    label: "Amber",
    swatch: "#d97706",
    filter: "grayscale(1) sepia(1) saturate(2.4) hue-rotate(-12deg)",
  },
  {
    id: "crimson",
    label: "Crimson",
    swatch: "#dc2626",
    filter: "grayscale(1) sepia(1) hue-rotate(-38deg) saturate(3.4)",
  },
  {
    id: "violet",
    label: "Violet",
    swatch: "#7c3aed",
    filter: "grayscale(1) sepia(1) hue-rotate(215deg) saturate(2.8)",
  },
];

export const DEFAULT_THEME_ID = "original";

/**
 * CSS filter for a theme id. An unknown id — a theme removed after boards were
 * saved with it — falls back to the original artwork rather than disappearing.
 */
export function themeFilter(id: string | undefined): string | undefined {
  if (!id || id === DEFAULT_THEME_ID) return undefined;
  return WIDGET_THEMES.find((theme) => theme.id === id)?.filter || undefined;
}
