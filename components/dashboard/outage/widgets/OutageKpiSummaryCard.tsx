"use client";

import { applyOutageKpis } from "../derive";
import { useTileReorder } from "../../useTileReorder";
import { IconImage, IconImageControls } from "../../iconImage";
import { PickerPopover } from "../../PickerPopover";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { OUTAGE_KPI_TILES } from "../data";
import { OUTAGE_KPI_ICON_KINDS } from "../types";
import type { OutageKpiTile } from "../types";

interface OutageKpiSummaryProps {
  defaultTiles?: OutageKpiTile[];
  storageKey?: string;
  editable?: boolean;
  onChange?: (tiles: OutageKpiTile[]) => void;
  /** Live tile values keyed by id, from a template that is filtering. */
  derivedValues?: Record<string, string>;
}

export function OutageKpiSummaryCard({
  defaultTiles = OUTAGE_KPI_TILES,
  storageKey = "outage.kpisummary.v1",
  editable = true,
  onChange,
  derivedValues,
}: OutageKpiSummaryProps) {
  const [tiles, setTiles] = useState<OutageKpiTile[]>(() =>
    loadTiles(storageKey, defaultTiles)
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(tiles));
    } catch {
      // ignore
    }
    onChange?.(tiles);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tiles, storageKey]);

  function patchTile(id: string, changes: Partial<OutageKpiTile>) {
    setTiles((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...changes } : t))
    );
  }

  function addTile() {
    const id = `kpi-${Date.now().toString(36)}`;
    setTiles((prev) => [
      ...prev,
      {
        id,
        label: "New Metric",
        value: "0",
        icon: "doc-blue",
        colorScheme: "blue",
      },
    ]);
  }

  function removeTile(id: string) {
    setTiles((prev) => prev.filter((t) => t.id !== id));
  }

  function reset() {
    setTiles(defaultTiles);
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
  }

  // Only one picker is ever open, so a single id is enough — no need to split
  // each tile into its own component for local state. Outside-click closing
  // lives in PickerPopover, which owns the portaled element.
  const [openPicker, setOpenPicker] = useState<string | null>(null);
  const [iconAnchor, setIconAnchor] = useState<HTMLButtonElement | null>(null);

  const reorder = useTileReorder(tiles, setTiles, editable);

  const displayTiles = derivedValues
    ? applyOutageKpis(tiles, derivedValues)
    : tiles;

  return (
    <section className="group/summary relative rounded-lg border border-blue-200/90 bg-white shadow-xs">
      {/* KPI Tiles Container */}
      {/* One row whatever the tile count — a fixed 8-column grid pushed the
          ninth tile onto a second line. See SoeSummaryCard. */}
      <div className="flex flex-nowrap divide-x divide-zinc-200/70 overflow-x-auto">
        {displayTiles.map((tile) => (
          <div
            key={tile.id}
            {...reorder.dropProps(tile.id)}
            className={`group/tile relative flex min-w-[96px] flex-1 shrink flex-col justify-between p-2.5 transition-colors hover:bg-blue-50/20 ${
              reorder.draggingId === tile.id ? "opacity-40" : ""
            }`}
          >
            {/* Top Row: Icon + Value */}
            <div className="flex items-center gap-2">
              <div className="relative shrink-0">
                <button
                  ref={openPicker === tile.id ? setIconAnchor : undefined}
                  type="button"
                  onClick={(e) => {
                    // Ignore the second click of a double-click, matching the
                    // SOE card's picker.
                    if (!editable || e.detail > 1) return;
                    setOpenPicker((id) => (id === tile.id ? null : tile.id));
                  }}
                  disabled={!editable}
                  title={editable ? "Click to change icon" : undefined}
                  className={
                    editable
                      ? "cursor-pointer rounded transition-colors hover:bg-zinc-100"
                      : "cursor-default"
                  }
                >
                  {tile.iconImage ? (
                    <IconImage
                      src={tile.iconImage}
                      className="h-7 w-7"
                      // A remote image can stop resolving later; fall back to
                      // the glyph rather than showing a broken-image box.
                      onError={() => patchTile(tile.id, { iconImage: undefined })}
                    />
                  ) : (
                    <OutageIconGlyph icon={tile.icon} />
                  )}
                </button>

                {openPicker === tile.id && (
                  <PickerPopover
                    anchor={iconAnchor}
                    width={196}
                    onClose={() => setOpenPicker(null)}
                  >
                    <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-wide text-zinc-400">
                      Choose icon
                    </p>
                    <div className="grid grid-cols-4 gap-1">
                      {OUTAGE_KPI_ICON_KINDS.map((kind) => (
                        <button
                          key={kind}
                          type="button"
                          onClick={() => {
                            patchTile(tile.id, { icon: kind, iconImage: undefined });
                            setOpenPicker(null);
                          }}
                          title={kind}
                          className={`flex items-center justify-center rounded p-1 ${
                            kind === tile.icon && !tile.iconImage
                              ? "bg-blue-600 ring-2 ring-blue-400"
                              : "hover:bg-zinc-100"
                          }`}
                        >
                          <OutageIconGlyph icon={kind} mini />
                        </button>
                      ))}
                    </div>

                    <IconImageControls
                      value={tile.iconImage}
                      onChange={(image) =>
                        patchTile(tile.id, { iconImage: image ?? undefined })
                      }
                      onDone={() => setOpenPicker(null)}
                    />
                  </PickerPopover>
                )}
              </div>
              <div className="flex items-center gap-1 min-w-0">
                <EditableBlock
                  value={tile.value}
                  onChange={(v) => patchTile(tile.id, { value: v || "0" })}
                  editable={editable}
                  placeholder="0"
                  className={`text-[18px] font-black tracking-tight leading-none ${
                    tile.colorScheme === "red"
                      ? "text-red-600"
                      : tile.colorScheme === "green"
                      ? "text-emerald-600"
                      : "text-zinc-900"
                  }`}
                />
                {tile.trend === "up" && (
                  <span className="text-emerald-600 font-extrabold text-[14px] leading-none">
                    ↑
                  </span>
                )}
                {tile.trend === "down" && (
                  <span className="text-emerald-600 font-extrabold text-[14px] leading-none">
                    ↓
                  </span>
                )}
              </div>
            </div>

            {/* Bottom Row: Label + Subtext */}
            <div className="mt-1 space-y-0.2">
              <EditableBlock
                value={tile.label}
                onChange={(v) => patchTile(tile.id, { label: v || "Metric" })}
                editable={editable}
                placeholder="Label"
                className="text-[10px] font-semibold text-zinc-700 leading-tight"
              />
              {tile.subtext && (
                <EditableBlock
                  value={tile.subtext}
                  onChange={(v) => patchTile(tile.id, { subtext: v })}
                  editable={editable}
                  placeholder="Subtext"
                  className="text-[9px] text-zinc-400 leading-tight"
                />
              )}
            </div>

            {/* Hover controls, grouped inside the tile's own bounds. At
                -left-1 / -right-1 one tile's grip landed on exactly the same
                pixels as the next tile's delete button, since adjacent tiles
                share an edge. */}
            {editable && (() => {
              const grip = reorder.gripProps(tile.id);
              return (
                <span className="absolute right-0.5 top-0.5 z-20 hidden items-center gap-0.5 group-hover/tile:flex">
                  <span
                    {...grip}
                    title="Drag to reorder"
                    aria-label="Drag to reorder tile"
                    className={`${
                      (grip.className as string) ?? ""
                    } flex h-4 w-4 cursor-grab items-center justify-center rounded bg-white text-zinc-400 shadow ring-1 ring-zinc-200 hover:text-zinc-700 active:cursor-grabbing`}
                  >
                    <svg viewBox="0 0 16 16" className="h-2.5 w-2.5" fill="currentColor">
                      <circle cx="6" cy="4" r="1.2" /><circle cx="10" cy="4" r="1.2" />
                      <circle cx="6" cy="8" r="1.2" /><circle cx="10" cy="8" r="1.2" />
                      <circle cx="6" cy="12" r="1.2" /><circle cx="10" cy="12" r="1.2" />
                    </svg>
                  </span>

                  <button
                    type="button"
                    onClick={() => removeTile(tile.id)}
                    title="Remove metric tile"
                    aria-label="Remove metric tile"
                    className="flex h-4 w-4 cursor-pointer items-center justify-center rounded-full bg-red-600 text-white shadow hover:bg-red-700"
                  >
                    <svg viewBox="0 0 16 16" className="h-2 w-2" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="4" y1="4" x2="12" y2="12" />
                      <line x1="12" y1="4" x2="4" y2="12" />
                    </svg>
                  </button>
                </span>
              );
            })()}
          </div>
        ))}
      </div>

      {/* Floating Add + Reset bar (hover) */}
      {editable && (
        <div className="absolute right-2 -bottom-2 z-20 flex items-center gap-1.5 opacity-0 group-hover/summary:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={addTile}
            title="Add metric tile"
            className="rounded bg-blue-600 px-2 py-0.5 text-[9px] font-bold text-white shadow hover:bg-blue-700 cursor-pointer"
          >
            + Add KPI
          </button>
          <button
            type="button"
            onClick={reset}
            title="Reset KPI tiles to default"
            className="rounded bg-white px-2 py-0.5 text-[9px] font-semibold text-zinc-600 shadow border border-zinc-200 hover:bg-zinc-100 cursor-pointer"
          >
            Reset
          </button>
        </div>
      )}
    </section>
  );
}

// ── Outage Icon Glyphs ────────────────────────────────────────────────

/**
 * The picker grid needs a smaller version of each glyph. Rather than
 * duplicating the size classes through all eight branches, the full-size
 * glyph is rendered and scaled down in a fixed-size box.
 */
function OutageIconGlyph({
  icon,
  mini,
}: {
  icon: OutageKpiTile["icon"];
  mini?: boolean;
}) {
  const glyph = <OutageIconGlyphBase icon={icon} />;
  if (!mini) return glyph;
  return (
    <span className="flex h-5 w-5 items-center justify-center overflow-hidden">
      <span className="origin-center scale-[0.66]">{glyph}</span>
    </span>
  );
}

function OutageIconGlyphBase({ icon }: { icon: OutageKpiTile["icon"] }) {
  switch (icon) {
    case "alert-red":
      return (
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-100 text-red-600">
          <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="currentColor">
            <path d="M12 2L1 21h22L12 2zm0 3.5L20.3 19H3.7L12 5.5zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z" />
          </svg>
        </div>
      );
    case "check-green":
      return (
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      );
    case "doc-blue":
      return (
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
          <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        </div>
      );
    case "clock-blue":
      return (
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-600">
          <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
      );
    case "stopwatch-red":
      return (
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-100 text-red-600">
          <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="14" r="8" />
            <line x1="12" y1="2" x2="12" y2="6" />
            <line x1="12" y1="14" x2="12" y2="10" />
          </svg>
        </div>
      );
    case "calendar-blue":
      return (
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
          <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>
      );
    case "bolt-orange":
      return (
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
          <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="currentColor">
            <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
          </svg>
        </div>
      );
    case "breaker-blue":
      return (
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-900 text-white">
          <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="4" width="14" height="16" rx="2" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <circle cx="12" cy="15" r="1" fill="currentColor" />
          </svg>
        </div>
      );
  }
}

// ── EditableBlock ─────────────────────────────────────────────────────

function EditableBlock({
  value,
  onChange,
  editable,
  placeholder,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  editable: boolean;
  placeholder: string;
  className: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | null>(null);

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
    if (!editable || e.detail < 2) return;
    e.stopPropagation();
    setDraft(value);
    setEditing(true);
  }

  function commit() {
    setEditing(false);
    if (draft !== value) onChange(draft);
  }

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") commit();
    else if (e.key === "Escape") setEditing(false);
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
        className={`${className} w-full rounded border border-blue-400 bg-white px-0.5 outline-none`}
      />
    );
  }

  return (
    <div
      onClick={startEdit}
      title={editable ? "Double-click to edit" : undefined}
      className={`${className} truncate select-none rounded ${
        editable ? "cursor-text hover:bg-blue-100/50" : ""
      }`}
    >
      {value || <span className="italic opacity-50">{placeholder}</span>}
    </div>
  );
}

function loadTiles(key: string, fallback: OutageKpiTile[]): OutageKpiTile[] {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = window.localStorage.getItem(key);
    if (!stored) return fallback;
    return JSON.parse(stored);
  } catch {
    return fallback;
  }
}
