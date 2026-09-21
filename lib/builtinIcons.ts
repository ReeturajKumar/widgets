import { readdirSync } from "node:fs";
import { join } from "node:path";
import type { IconDef } from "./types";

const ICONS_DIR = join(process.cwd(), "public", "icons");

const IMAGE_RE = /\.(svg|png|jpe?g|gif|webp|avif)$/i;

// Server-only: reads every image in public/icons so adding an icon is just
// dropping a file in that folder. The filename becomes the icon's label.
export function loadBuiltinIcons(): IconDef[] {
  return readdirSync(ICONS_DIR)
    .filter((file) => IMAGE_RE.test(file))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((file) => {
      const name = file.replace(IMAGE_RE, "");
      return {
        id: `builtin-${name}`,
        name,
        source: "builtin" as const,
        svg: markupFor(file, name),
      };
    });
}

function markupFor(file: string, name: string): string {
  // Served by URL rather than inlined: these files are large, and <img> renders
  // an .svg as vector all the same while letting the browser cache it.
  return `<img src="/icons/${encodeURIComponent(file)}" alt="${escapeHtml(name)}" loading="lazy" decoding="async" />`;
}

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c] as string
  );
}
