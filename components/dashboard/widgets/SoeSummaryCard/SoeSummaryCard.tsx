"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {
  DEFAULT_SOE_SUMMARY,
  KPI_ICON_KINDS,
  type KpiIconKind,
  type KpiTileConfig,
  type SoeSummaryConfig,
} from "./types";

// ── Props ─────────────────────────────────────────────────────────────

interface SoeSummaryCardProps {
  /** Starting configuration; used only on first render if nothing is in storage. */
  defaultConfig?: SoeSummaryConfig;
  /** Distinct key per instance — lets two cards on the same board keep separate state. */
  storageKey?: string;
  /** false locks the widget to view-only mode. */
  editable?: boolean;
  /** Fired whenever the config changes, if the parent wants to observe. */
  onChange?: (config: SoeSummaryConfig) => void;
}

/**
 * Fully-editable SOE Summary KPI card widget.
 *
 * - Double-click the card title or any value / label to edit inline.
 * - Click the icon on a tile to open an icon picker and swap it.
 * - Hover over a tile to reveal the × remove button (edit mode only).
 * - Click the + button in the header to add a new tile.
 * - All changes persist to localStorage under `storageKey`.
 */
export function SoeSummaryCard({
  defaultConfig = DEFAULT_SOE_SUMMARY,
  storageKey = "widget.soesummary.v1",
  editable = true,
  onChange,
}: SoeSummaryCardProps) {
  const [config, setConfig] = useState<SoeSummaryConfig>(() =>
    loadConfig(storageKey, defaultConfig)
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(config));
    } catch {
      // storage full / disabled — silently skip
    }
    onChange?.(config);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, storageKey]);

  function patch<K extends keyof SoeSummaryConfig>(
    key: K,
    value: SoeSummaryConfig[K]
  ) {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }

  function patchTile(id: string, changes: Partial<KpiTileConfig>) {
    setConfig((prev) => ({
      ...prev,
      tiles: prev.tiles.map((t) => (t.id === id ? { ...t, ...changes } : t)),
    }));
  }

  function addTile() {
    const id = `tile-${Date.now().toString(36)}`;
    setConfig((prev) => ({
      ...prev,
      tiles: [
        ...prev.tiles,
        { id, value: "0", label: "New Metric", icon: "doc-blue" },
      ],
    }));
  }

  function removeTile(id: string) {
    setConfig((prev) => ({
      ...prev,
      tiles: prev.tiles.filter((t) => t.id !== id),
    }));
  }

  function reset() {
    setConfig(defaultConfig);
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
  }

  return (
    <section className="overflow-visible rounded-lg border border-blue-200 bg-white">
      {/* ── Header ── */}
      <header className="group/header relative flex items-center gap-2 border-b border-blue-200 bg-blue-600 px-3 py-2">
        <SectionIcon />
        <h2 className="flex-1 text-[13px] font-semibold text-white">
          <Editable
            value={config.title}
            onChange={(v) => patch("title", v || "SOE Summary")}
            editable={editable}
            placeholder="Card title"
            dark={false}
          />
        </h2>

        {/* Add tile button */}
        {editable && (
          <button
            type="button"
            onClick={addTile}
            title="Add KPI tile"
            aria-label="Add KPI tile"
            className="flex h-6 w-6 items-center justify-center rounded border border-dashed border-white/50 text-white hover:border-white hover:bg-white/15"
          >
            <svg
              viewBox="0 0 16 16"
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <line x1="8" y1="2" x2="8" y2="14" />
              <line x1="2" y1="8" x2="14" y2="8" />
            </svg>
          </button>
        )}

        {/* Reset button — only visible on focus-within */}
        {editable && (
          <button
            type="button"
            onClick={reset}
            title="Reset card to defaults"
            className="absolute -bottom-2.5 right-3 rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-semibold text-zinc-600 opacity-0 shadow transition-opacity group-focus-within/header:opacity-100 hover:!opacity-100 hover:bg-white"
          >
            Reset card
          </button>
        )}
      </header>

      {/* ── KPI tile grid ── */}
      <div className="flex flex-wrap gap-0 divide-x divide-zinc-100">
        {config.tiles.map((tile) => (
          <KpiTile
            key={tile.id}
            tile={tile}
            editable={editable}
            onChange={(changes) => patchTile(tile.id, changes)}
            onRemove={() => removeTile(tile.id)}
          />
        ))}

        {config.tiles.length === 0 && (
          <p className="px-4 py-6 text-center text-[11px] text-zinc-400 w-full">
            No KPI tiles.{editable ? " Click + to add one." : ""}
          </p>
        )}
      </div>
    </section>
  );
}

// ── Individual KPI tile ───────────────────────────────────────────────

interface KpiTileProps {
  tile: KpiTileConfig;
  editable: boolean;
  onChange: (changes: Partial<KpiTileConfig>) => void;
  onRemove: () => void;
}

function KpiTile({ tile, editable, onChange, onRemove }: KpiTileProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement | null>(null);

  // Close icon picker when clicking outside it
  useEffect(() => {
    if (!pickerOpen) return;
    function onPointerDown(event: PointerEvent) {
      if (!pickerRef.current?.contains(event.target as Node)) {
        setPickerOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown, true);
    return () =>
      document.removeEventListener("pointerdown", onPointerDown, true);
  }, [pickerOpen]);

  return (
    <div className="group/tile relative flex min-w-[100px] flex-1 items-center gap-1 px-2 py-1.5">
      {/* Icon — single click opens picker; guard against double-click toggling twice */}
      <button
        type="button"
        onClick={(e) => {
          if (!editable || e.detail > 1) return; // ignore 2nd click of a dblclick
          setPickerOpen((v) => !v);
        }}
        disabled={!editable}
        title={editable ? "Click to change icon" : undefined}
        className={editable ? "shrink-0 cursor-pointer rounded p-0.5 hover:bg-zinc-100 transition-colors" : "shrink-0 cursor-default"}
      >
        <KpiIconGlyph kind={tile.icon} />
      </button>

      {/* Value + label — double-click anywhere in the column to edit */}
      <div className="min-w-0 flex-1 leading-tight">
        {/* Value wrapper: double-click anywhere in this block starts the edit */}
        <EditableBlock
          value={tile.value}
          onChange={(v) => onChange({ value: v || "0" })}
          editable={editable}
          placeholder="0"
          className="text-[16px] font-extrabold text-zinc-900"
        />
        {/* Label wrapper */}
        <EditableBlock
          value={tile.label}
          onChange={(v) => onChange({ label: v || "Metric" })}
          editable={editable}
          placeholder="Label"
          className="text-[10px] text-zinc-500"
        />
      </div>

      {/* Delete button — top-left corner, shown on hover */}
      {editable && (
        <button
          type="button"
          onClick={onRemove}
          title="Remove tile"
          aria-label="Remove KPI tile"
          className="absolute -left-1 -top-1 z-20 hidden h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] leading-none text-white shadow group-hover/tile:flex"
        >
          ×
        </button>
      )}

      {/* Icon picker popover */}
      {pickerOpen && (
        <div
          ref={pickerRef}
          style={{ width: 196 }}
          className="absolute left-0 top-full z-[200] mt-1 rounded-md border border-zinc-200 bg-white p-2 shadow-xl"
        >
          <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-wide text-zinc-400">
            Choose icon
          </p>
          <div className="grid grid-cols-4 gap-1">
            {KPI_ICON_KINDS.map((kind) => (
              <button
                key={kind}
                type="button"
                onClick={() => {
                  onChange({ icon: kind });
                  setPickerOpen(false);
                }}
                title={kind}
                className={`flex items-center justify-center rounded p-1 ${
                  kind === tile.icon
                    ? "bg-blue-600 ring-2 ring-blue-400"
                    : "hover:bg-zinc-100"
                }`}
              >
                <KpiIconGlyph kind={kind} mini />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── EditableBlock: double-click the whole div, not just the text span ──────

interface EditableBlockProps {
  value: string;
  onChange: (value: string) => void;
  editable: boolean;
  placeholder: string;
  className: string;
}

function EditableBlock({
  value,
  onChange,
  editable,
  placeholder,
  className,
}: EditableBlockProps) {
  const [session, setSession] = useState<number | null>(null);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const committed = useRef(false);
  const editing = session !== null;

  // Keep draft in sync when the parent value changes (e.g. reset)
  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      // Caret at the end — select-all lets the first keystroke wipe the text.
      const caret = inputRef.current;
      if (caret) caret.setSelectionRange(caret.value.length, caret.value.length);
    }
  }, [editing]);

  function startEdit(e: React.MouseEvent) {
    if (!editable || e.detail < 2) return; // only on genuine double-click
    e.stopPropagation();
    e.preventDefault();
    committed.current = false;
    setDraft(value);
    setSession(Date.now());
  }

  function commit() {
    if (committed.current) return;
    committed.current = true;
    setSession(null);
    if (draft !== value) onChange(draft);
  }

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") { e.preventDefault(); commit(); }
    else if (e.key === "Escape") { committed.current = true; setSession(null); }
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={onKey}
        placeholder={placeholder}
        className={`${className} w-full rounded border border-zinc-300 bg-white px-1 outline-none focus:border-blue-500`}
      />
    );
  }

  return (
    <div
      onClick={startEdit}
      title={editable ? "Double-click to edit" : undefined}
      className={`${className} w-full select-none rounded px-0.5 ${
        editable ? "cursor-text hover:bg-zinc-50" : ""
      }`}
    >
      {value || <span className="italic opacity-50">{placeholder}</span>}
    </div>
  );
}

// ── KPI icon renderer ─────────────────────────────────────────────────

function KpiIconGlyph({
  kind,
  mini = false,
}: {
  kind: KpiIconKind;
  mini?: boolean;
}) {
  const size = mini ? "h-6 w-6" : "h-8 w-8";
  const iconSize = mini ? "h-3.5 w-3.5" : "h-5 w-5";

  const base = {
    fill: "none" as const,
    stroke: "currentColor" as const,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    viewBox: "0 0 24 24",
  };

  switch (kind) {
    case "doc-blue":
      return (
        <div className={`flex ${size} items-center justify-center rounded-lg bg-blue-100 text-blue-600`}>
          <svg {...base} strokeWidth={1.7} className={iconSize}>
            <path d="M6 3h9l4 4v14H6z" />
            <path d="M15 3v4h4" />
            <line x1="9" y1="12" x2="16" y2="12" />
            <line x1="9" y1="16" x2="14" y2="16" />
          </svg>
        </div>
      );
    case "alert-red":
      return (
        <div className={`flex ${size} items-center justify-center rounded-lg bg-red-100 text-red-600`}>
          <svg {...base} strokeWidth={2} className={iconSize}>
            <path d="M12 3 2 20h20L12 3Z" />
            <line x1="12" y1="10" x2="12" y2="14" />
            <circle cx="12" cy="17" r="0.5" fill="currentColor" />
          </svg>
        </div>
      );
    case "alert-amber":
      return (
        <div className={`flex ${size} items-center justify-center rounded-lg bg-amber-100 text-amber-500`}>
          <svg {...base} strokeWidth={2} className={iconSize}>
            <path d="M12 3 2 20h20L12 3Z" />
            <line x1="12" y1="10" x2="12" y2="14" />
            <circle cx="12" cy="17" r="0.5" fill="currentColor" />
          </svg>
        </div>
      );
    case "bolt-red":
      return (
        <div className={`flex ${size} items-center justify-center rounded-lg bg-red-100 text-red-600`}>
          <svg viewBox="0 0 24 24" fill="currentColor" className={iconSize}>
            <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
          </svg>
        </div>
      );
    case "bolt-amber":
      return (
        <div className={`flex ${size} items-center justify-center rounded-lg bg-amber-100 text-amber-500`}>
          <svg viewBox="0 0 24 24" fill="currentColor" className={iconSize}>
            <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
          </svg>
        </div>
      );
    case "bolt-green":
      return (
        <div className={`flex ${size} items-center justify-center rounded-lg bg-emerald-100 text-emerald-600`}>
          <svg viewBox="0 0 24 24" fill="currentColor" className={iconSize}>
            <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
          </svg>
        </div>
      );
    case "gear-blue":
      return (
        <div className={`flex ${size} items-center justify-center rounded-lg bg-blue-100 text-blue-600`}>
          <svg {...base} strokeWidth={1.7} className={iconSize}>
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
          </svg>
        </div>
      );
    case "refresh-green":
      return (
        <div className={`flex ${size} items-center justify-center rounded-lg bg-emerald-100 text-emerald-600`}>
          <svg {...base} strokeWidth={1.7} className={iconSize}>
            <path d="M4 4v6h6" />
            <path d="M20 20v-6h-6" />
            <path d="M5 14a8 8 0 0 0 14 4" />
            <path d="M19 10a8 8 0 0 0-14-4" />
          </svg>
        </div>
      );
    case "check-green":
      return (
        <div className={`flex ${size} items-center justify-center rounded-lg bg-emerald-100 text-emerald-600`}>
          <svg {...base} strokeWidth={2.5} className={iconSize}>
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      );
    case "wave-blue":
      return (
        <div className={`flex ${size} items-center justify-center rounded-lg bg-blue-100 text-blue-600`}>
          <svg {...base} strokeWidth={1.7} className={iconSize}>
            <path d="M3 12s3-6 5-6 3 6 5 6 5-6 7-6" />
            <path d="M3 18s3-6 5-6 3 6 5 6 5-6 7-6" />
          </svg>
        </div>
      );
    case "zap-purple":
      return (
        <div className={`flex ${size} items-center justify-center rounded-lg bg-purple-100 text-purple-600`}>
          <svg viewBox="0 0 24 24" fill="currentColor" className={iconSize}>
            <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
          </svg>
        </div>
      );
    case "thermometer-red":
      return (
        <div className={`flex ${size} items-center justify-center rounded-lg bg-red-100 text-red-600`}>
          <svg {...base} strokeWidth={1.7} className={iconSize}>
            <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
          </svg>
        </div>
      );
  }
}

// ── Section icon ──────────────────────────────────────────────────────

function SectionIcon() {
  return (
    <span className="flex h-5 w-5 items-center justify-center rounded bg-white/20 text-white">
      <svg
        viewBox="0 0 24 24"
        className="h-3 w-3"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="4" y="4" width="16" height="16" rx="1.5" />
        <line x1="4" y1="8" x2="20" y2="8" />
        <line x1="8" y1="12" x2="16" y2="12" />
        <line x1="8" y1="16" x2="14" y2="16" />
      </svg>
    </span>
  );
}

// ── Inline editable span ──────────────────────────────────────────────

interface EditableProps {
  value: string;
  onChange: (value: string) => void;
  editable: boolean;
  placeholder?: string;
  /** true = light-background hover style (zinc-100); false = white/glass style */
  dark?: boolean;
}

function Editable({
  value,
  onChange,
  editable,
  placeholder,
  dark = true,
}: EditableProps) {
  const [session, setSession] = useState<number | null>(null);
  const editing = session !== null;

  if (!editable) {
    return <>{value || placeholder}</>;
  }

  if (editing) {
    return (
      <EditableInput
        key={session}
        initial={value}
        placeholder={placeholder}
        dark={dark}
        onCommit={(next) => {
          setSession(null);
          if (next !== value) onChange(next);
        }}
        onCancel={() => setSession(null)}
      />
    );
  }

  return (
    <span
      onDoubleClick={(event) => {
        event.stopPropagation();
        setSession(Date.now());
      }}
      title="Double-click to edit"
      className={`cursor-text rounded px-0.5 ${
        dark ? "hover:bg-zinc-100" : "hover:bg-white/20"
      } ${!value ? "italic opacity-60" : ""}`}
    >
      {value || placeholder || " "}
    </span>
  );
}

interface EditableInputProps {
  initial: string;
  placeholder?: string;
  dark: boolean;
  onCommit: (value: string) => void;
  onCancel: () => void;
}

/** Isolated editing session — mounted per edit, so state can't drift with props. */
function EditableInput({
  initial,
  placeholder,
  dark,
  onCommit,
  onCancel,
}: EditableInputProps) {
  const [draft, setDraft] = useState(initial);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const committed = useRef(false);

  useEffect(() => {
    inputRef.current?.focus();
    // Caret at the end — select-all lets the first keystroke wipe the text.
    const caret = inputRef.current;
    if (caret) caret.setSelectionRange(caret.value.length, caret.value.length);
  }, []);

  function commit() {
    if (committed.current) return;
    committed.current = true;
    onCommit(draft);
  }

  function onKey(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      commit();
    } else if (event.key === "Escape") {
      event.preventDefault();
      committed.current = true;
      onCancel();
    }
  }

  return (
    <input
      ref={inputRef}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={onKey}
      placeholder={placeholder}
      className={`rounded border px-1 text-inherit outline-none ${
        dark
          ? "border-zinc-300 bg-white focus:border-blue-500"
          : "border-white/40 bg-white/10 focus:border-white"
      }`}
      style={{ width: `${Math.max(draft.length + 1, 4)}ch` }}
    />
  );
}

// ── localStorage helpers ──────────────────────────────────────────────

function loadConfig(
  key: string,
  fallback: SoeSummaryConfig
): SoeSummaryConfig {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = window.localStorage.getItem(key);
    if (!stored) return fallback;
    const parsed = JSON.parse(stored) as Partial<SoeSummaryConfig>;
    return { ...fallback, ...parsed };
  } catch {
    return fallback;
  }
}

