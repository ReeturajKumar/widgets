"use client";

// Per-widget theming for the dashboard cards.
//
// Every card in both templates shares the same shell — a bordered section with
// a coloured header bar — so one theme shape covers all of them. The theme
// lives inside each widget's own config and persists under that widget's own
// storage key, which is what keeps them independent: changing one card's
// colours cannot touch another's.
//
// The defaults reproduce the original hard-coded Tailwind colours exactly, so
// adding this changed nothing on screen until someone edits it.

import { useState, type CSSProperties } from "react";
import { PickerPopover } from "./PickerPopover";
import {
  Group,
  PanelButton,
  PanelColumn,
  Slider,
  Swatch,
} from "./widgets/tableShared";

export interface WidgetTheme {
  headerBg: string;
  headerText: string;
  bodyBg: string;
  bodyText: string;
  borderColor: string;
  fontSize: number;
}

/** blue-600 / white / blue-200 / zinc-800 — the original card palette. */
export const DEFAULT_WIDGET_THEME: WidgetTheme = {
  headerBg: "#2563eb",
  headerText: "#ffffff",
  bodyBg: "#ffffff",
  bodyText: "#27272a",
  borderColor: "#bfdbfe",
  fontSize: 11,
};

/**
 * Fills in anything a stored config predates.
 *
 * Most widgets parse their saved JSON straight back without merging defaults,
 * so a config written before theming existed has no `theme` at all. Reading
 * through this keeps those saves working untouched.
 */
export function resolveTheme(theme?: Partial<WidgetTheme>): WidgetTheme {
  return theme ? { ...DEFAULT_WIDGET_THEME, ...theme } : DEFAULT_WIDGET_THEME;
}

/** Inline styles for the card shell. */
export function sectionStyle(theme: WidgetTheme): CSSProperties {
  return {
    backgroundColor: theme.bodyBg,
    borderColor: theme.borderColor,
    color: theme.bodyText,
  };
}

/**
 * Inline styles for the header bar.
 *
 * `--wt-header-text` is published as a custom property because the header's
 * children set `text-white` explicitly; a plain inherited `color` would never
 * reach them, so those classes read the variable instead.
 */
export function headerStyle(theme: WidgetTheme): CSSProperties {
  return {
    backgroundColor: theme.headerBg,
    borderBottomColor: theme.borderColor,
    color: theme.headerText,
    ["--wt-header-text" as string]: theme.headerText,
  } as CSSProperties;
}

// ── Presets ───────────────────────────────────────────────────────────

export interface ThemePreset {
  name: string;
  theme: WidgetTheme;
}

export const THEME_PRESETS: ThemePreset[] = [
  { name: "Blue", theme: DEFAULT_WIDGET_THEME },
  {
    name: "Slate",
    theme: {
      headerBg: "#334155",
      headerText: "#ffffff",
      bodyBg: "#ffffff",
      bodyText: "#1e293b",
      borderColor: "#cbd5e1",
      fontSize: 11,
    },
  },
  {
    name: "Dark",
    theme: {
      headerBg: "#0f172a",
      headerText: "#e2e8f0",
      bodyBg: "#1e293b",
      bodyText: "#e2e8f0",
      borderColor: "#334155",
      fontSize: 11,
    },
  },
  {
    name: "Emerald",
    theme: {
      headerBg: "#047857",
      headerText: "#ffffff",
      bodyBg: "#ffffff",
      bodyText: "#064e3b",
      borderColor: "#a7f3d0",
      fontSize: 11,
    },
  },
  {
    name: "Amber",
    theme: {
      headerBg: "#b45309",
      headerText: "#ffffff",
      bodyBg: "#fffbeb",
      bodyText: "#451a03",
      borderColor: "#fde68a",
      fontSize: 11,
    },
  },
  {
    name: "Graphite",
    theme: {
      headerBg: "#3f3f46",
      headerText: "#fafafa",
      bodyBg: "#fafafa",
      bodyText: "#27272a",
      borderColor: "#d4d4d8",
      fontSize: 11,
    },
  },
];

// ── Panel ─────────────────────────────────────────────────────────────

export interface WidgetSettingsProps {
  theme: WidgetTheme;
  onChange: (theme: WidgetTheme) => void;
  /** Restores the whole widget to its defaults. */
  onReset: () => void;
  /** Extra widget-specific controls, rendered in a third column. */
  extra?: React.ReactNode;
  /** Heading for the extra column. */
  extraLabel?: string;
}

/**
 * Gear button plus its settings panel, as one drop-in per widget.
 *
 * The panel is portaled: several of these cards clip their overflow, and an
 * absolutely-positioned panel would be cut off inside them.
 */
export function WidgetSettings({
  theme,
  onChange,
  onReset,
  extra,
  extraLabel = "Options",
}: WidgetSettingsProps) {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);

  const set = <K extends keyof WidgetTheme>(key: K, value: WidgetTheme[K]) =>
    onChange({ ...theme, [key]: value });

  return (
    <>
      <button
        ref={setAnchor}
        type="button"
        onClick={() => setOpen((v) => !v)}
        title="Widget settings"
        aria-label="Widget settings"
        className={`nodrag nopan absolute bottom-1.5 right-1.5 z-20 flex h-5 w-5 items-center justify-center rounded-full opacity-0 shadow transition-opacity group-hover/widget:opacity-100 focus-visible:opacity-100 ${
          open ? "bg-blue-500 text-white opacity-100" : "bg-white/90 text-zinc-600 hover:bg-white"
        }`}
      >
        <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
        </svg>
      </button>

      {open && (
        <PickerPopover anchor={anchor} width={520} onClose={() => setOpen(false)}>
          <div className="mb-2 flex items-center justify-between border-b border-zinc-100 pb-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Widget settings
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onReset}
                className="text-[9px] font-medium text-zinc-400 transition-colors hover:text-blue-600"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close settings"
                className="text-[11px] leading-none text-zinc-400 transition-colors hover:text-zinc-700"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-zinc-100">
            <PanelColumn>
              <Group label="Colours">
                <Swatch label="Header bg" value={theme.headerBg} onChange={(v) => set("headerBg", v)} />
                <Swatch label="Header text" value={theme.headerText} onChange={(v) => set("headerText", v)} />
                <Swatch label="Body bg" value={theme.bodyBg} onChange={(v) => set("bodyBg", v)} />
                <Swatch label="Body text" value={theme.bodyText} onChange={(v) => set("bodyText", v)} />
                <Swatch label="Border" value={theme.borderColor} onChange={(v) => set("borderColor", v)} />
              </Group>
            </PanelColumn>

            <PanelColumn>
              <Group label="Typography">
                <Slider
                  label="Base font size"
                  value={theme.fontSize}
                  suffix="px"
                  min={8}
                  max={18}
                  onChange={(v) => set("fontSize", v)}
                />
              </Group>
              <Group label="Theme">
                <div className="grid grid-cols-3 gap-1">
                  {THEME_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() =>
                        // Keep the font size the user chose; a preset is a
                        // palette, not a full reset.
                        onChange({ ...preset.theme, fontSize: theme.fontSize })
                      }
                      title={preset.name}
                      className="flex flex-col items-center gap-0.5 rounded border border-zinc-200 p-1 transition-colors hover:border-blue-400"
                    >
                      <span
                        className="h-3 w-full rounded-sm"
                        style={{ backgroundColor: preset.theme.headerBg }}
                      />
                      <span className="text-[8.5px] text-zinc-500">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </Group>
            </PanelColumn>

            <PanelColumn>
              <Group label={extraLabel}>
                {extra ?? (
                  <p className="text-[9.5px] leading-snug text-zinc-400">
                    No extra options for this widget.
                  </p>
                )}
              </Group>
              <Group label="Reset">
                <PanelButton onClick={onReset}>Restore defaults</PanelButton>
              </Group>
            </PanelColumn>
          </div>
        </PickerPopover>
      )}
    </>
  );
}
