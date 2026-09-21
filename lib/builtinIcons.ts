import { readdirSync } from "node:fs";
import { join } from "node:path";
import { CONVERTED_FILES, CONVERTED_WIDGETS } from "./convertedWidgets";
import type { IconDef } from "./types";

const ICONS_DIR = join(process.cwd(), "public", "icons");

const IMAGE_RE = /\.(svg|png|jpe?g|gif|webp|avif)$/i;

// Server-only: reads every image in public/icons so adding an icon is just
// dropping a file in that folder. The filename becomes the icon's label.
//
// Traced widgets are listed first and come from the component registry rather
// than the folder; the raw file each one replaces is skipped so the library
// doesn't show the same widget twice.
export function loadBuiltinIcons(): IconDef[] {
  const traced: IconDef[] = CONVERTED_WIDGETS.map((widget) => ({
    id: `builtin-${widget.key}`,
    name: widget.label,
    componentKey: widget.key,
  }));

  const raw = listIconFiles()
    .filter((file) => IMAGE_RE.test(file) && !CONVERTED_FILES.has(file))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((file) => {
      const name = file.replace(IMAGE_RE, "");
      return {
        id: `builtin-${name}`,
        name,
        svg: markupFor(file, name),
      };
    });

  return [...traced, ...raw];
}

// Every widget is a component now, so public/icons is empty and git does not
// track empty directories — a fresh clone has no folder at all. Treating that
// as "no extra icons" keeps the drop-in-a-file workflow alive without making
// the page fall over when nobody has dropped one in.
function listIconFiles(): string[] {
  try {
    return readdirSync(ICONS_DIR);
  } catch {
    return [];
  }
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
