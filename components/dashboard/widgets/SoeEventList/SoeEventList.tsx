"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import {
  FilterBar,
  NoMatches,
  useRowFilter,
  type FilterField,
} from "../../filterShared";
import {
  Group,
  NumberField,
  PanelColumn,
  SelectField,
  SettingsShell,
  Slider,
  Swatch,
  TablePager,
  TRANSITION_MS,
  TRANSITION_OPTIONS,
  Toggle,
  usePaging,
  type TransitionStyle,
} from "../tableShared";
import {
  DEFAULT_SOE_EVENT_LIST,
  type EventPriority,
  type SoeColumnConfig,
  type SoeEventListConfig,
  type SoeRowConfig,
} from "./types";

// ── Props ─────────────────────────────────────────────────────────────

interface SoeEventListProps {
  defaultConfig?: SoeEventListConfig;
  storageKey?: string;
  editable?: boolean;
  onChange?: (config: SoeEventListConfig) => void;
  /**
   * Supplied when a dashboard template drives filtering from its own filter
   * panel. The widget then defers to that predicate and hides its built-in
   * filter bar, so the two never appear at once.
   */
  externalFilter?: (row: SoeRowConfig) => boolean;
  /**
   * Hides the widget's own filter bar. A dashboard template sets this because
   * it has a filter panel of its own; keying it off `externalFilter` instead
   * would make the bar appear and disappear as filters are applied.
   */
  hideFilterBar?: boolean;
}

// ── Filtering ─────────────────────────────────────────────────────────

const FILTER_FIELDS: FilterField<SoeRowConfig>[] = [
  { key: "pss", label: "PSS", value: (r) => r.pss },
  { key: "equipment", label: "Equipment", value: (r) => r.equipment },
  { key: "event", label: "Events", value: (r) => r.event },
  { key: "priority", label: "Priorities", value: (r) => r.priority },
  { key: "quality", label: "Quality", value: (r) => r.quality },
];

function searchableText(r: SoeRowConfig): string {
  return [
    r.num, r.date, r.time, r.msec, r.pss, r.equipment,
    r.event, r.previousState, r.newState, r.priority, r.quality,
  ].join(" ");
}

function rowDate(r: SoeRowConfig): string {
  return r.date;
}

/**
 * Fully-editable SOE Event List table widget.
 *
 * - Double-click any header label, cell value, title or subtitle to edit.
 * - In edit mode: column visibility toggle (eye icon in header); add/remove rows.
 * - Priority badge colour auto-derives from the cell value.
 * - All changes persist to localStorage under `storageKey`.
 */
export function SoeEventList({
  defaultConfig = DEFAULT_SOE_EVENT_LIST,
  storageKey = "widget.soeeventlist.v1",
  editable = true,
  onChange,
  externalFilter,
  hideFilterBar = false,
}: SoeEventListProps) {
  const [config, setConfig] = useState<SoeEventListConfig>(() =>
    loadConfig(storageKey, defaultConfig)
  );
  const [colMenuOpen, setColMenuOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const colMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try { window.localStorage.setItem(storageKey, JSON.stringify(config)); } catch { /* full */ }
    onChange?.(config);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, storageKey]);

  // Close column menu on outside click
  useEffect(() => {
    if (!colMenuOpen) return;
    const handler = (e: PointerEvent) => {
      if (!colMenuRef.current?.contains(e.target as Node)) setColMenuOpen(false);
    };
    document.addEventListener("pointerdown", handler, true);
    return () => document.removeEventListener("pointerdown", handler, true);
  }, [colMenuOpen]);

  function patch<K extends keyof SoeEventListConfig>(key: K, value: SoeEventListConfig[K]) {
    setConfig((p) => ({ ...p, [key]: value }));
  }

  function patchCol(key: string, changes: Partial<SoeColumnConfig>) {
    setConfig((p) => ({
      ...p,
      columns: p.columns.map((c) => (c.key === key ? { ...c, ...changes } : c)),
    }));
  }

  function patchRow(id: string, changes: Partial<SoeRowConfig>) {
    setConfig((p) => ({
      ...p,
      rows: p.rows.map((r) => (r.id === id ? { ...r, ...changes } : r)),
    }));
  }

  function addRow() {
    const id = `row-${Date.now().toString(36)}`;
    const num = String(config.rows.length + 1);
    setConfig((p) => ({
      ...p,
      rows: [
        ...p.rows,
        { id, num, date: "—", time: "—", msec: "—", pss: "—", equipment: "—",
          event: "New Event", previousState: "—", newState: "—",
          priority: "INFO", quality: "Good", qualityGood: true },
      ],
    }));
  }

  function removeRow(id: string) {
    setConfig((p) => ({ ...p, rows: p.rows.filter((r) => r.id !== id) }));
  }

  function reset() {
    setConfig(defaultConfig);
    try { window.localStorage.removeItem(storageKey); } catch { /* ignore */ }
  }

  const visibleCols = config.columns.filter((c) => !c.hidden);
  const filter = useRowFilter(
    config.rows,
    FILTER_FIELDS,
    searchableText,
    rowDate
  );
  const visibleRows = externalFilter
    ? config.rows.filter(externalFilter)
    : filter.rows;
  const paging = usePaging(
    visibleRows,
    config.pageSize,
    config.transition,
    config.paginate
  );

  return (
    <section className="relative overflow-hidden rounded-lg border border-blue-200 bg-white">
      {/* ── Header ── */}
      <header className="group/hdr relative flex items-center gap-2 border-b border-blue-200 bg-blue-600 px-3 py-1.5">
        {/* Section icon */}
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-white/20 text-white">
          <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="4" width="16" height="16" rx="1.5" /><line x1="4" y1="8" x2="20" y2="8" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="8" y1="16" x2="14" y2="16" />
          </svg>
        </span>

        {/* Title + subtitle */}
        <h2 className="flex flex-1 flex-wrap items-baseline gap-1 text-[12px] font-semibold text-white">
          <EditableInline value={config.title} onChange={(v) => patch("title", v || "SOE Event List")} editable={editable} glass />
          <span className="text-[10px] font-normal text-blue-200">
            <EditableInline value={config.subtitle} onChange={(v) => patch("subtitle", v)} editable={editable} glass />
          </span>
        </h2>

        {editable && (
          <div className="relative flex items-center gap-1">
            {/* Column visibility toggle */}
            <div className="relative" ref={colMenuRef}>
              <button
                type="button"
                onClick={(e) => { if (e.detail < 2) setColMenuOpen((v) => !v); }}
                title="Show / hide columns"
                className="flex h-6 w-6 items-center justify-center rounded border border-dashed border-white/50 text-white hover:border-white hover:bg-white/15"
              >
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <line x1="2" y1="4" x2="14" y2="4" /><line x1="2" y1="8" x2="14" y2="8" /><line x1="2" y1="12" x2="10" y2="12" />
                </svg>
              </button>
              {colMenuOpen && (
                <div className="absolute right-0 top-full z-[300] mt-1 w-44 rounded-md border border-zinc-200 bg-white p-2 shadow-xl">
                  <p className="mb-1 text-[9px] font-semibold uppercase tracking-wide text-zinc-400">Columns</p>
                  {config.columns.map((col) => (
                    <label key={col.key} className="flex cursor-pointer items-center gap-2 rounded px-1 py-0.5 hover:bg-zinc-50">
                      <input
                        type="checkbox"
                        checked={!col.hidden}
                        onChange={() => patchCol(col.key, { hidden: !col.hidden })}
                        className="h-3 w-3 accent-blue-600"
                      />
                      <span className="text-[11px] text-zinc-700">{col.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Add row */}
            <button
              type="button"
              onClick={addRow}
              title="Add row"
              className="flex h-6 w-6 items-center justify-center rounded border border-dashed border-white/50 text-white hover:border-white hover:bg-white/15"
            >
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="8" y1="2" x2="8" y2="14" /><line x1="2" y1="8" x2="14" y2="8" />
              </svg>
            </button>

            {/* Reset */}
            <button
              type="button"
              onClick={reset}
              title="Reset to defaults"
              className="absolute -bottom-2.5 right-0 rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-semibold text-zinc-600 opacity-0 shadow transition-opacity group-focus-within/hdr:opacity-100 hover:!opacity-100 hover:bg-white"
            >
              Reset
            </button>
          </div>
        )}
      </header>

      {!hideFilterBar && !externalFilter && (
        <FilterBar
          filter={filter}
          fields={FILTER_FIELDS}
          placeholder="Search events…"
          showDates
          noun="events"
        />
      )}

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        <table
          className="w-full"
          style={
            {
              fontSize: config.fontSize,
              color: config.cellText,
              "--tbl-dir": paging.direction,
              "--tbl-ms": `${TRANSITION_MS}ms`,
            } as CSSProperties
          }
        >
          <thead style={{ backgroundColor: config.headerBg, color: config.headerText }}>
            <tr>
              {visibleCols.map((col) => (
                <th key={col.key} className="whitespace-nowrap px-2 py-1 text-left font-semibold">
                  <EditableInline
                    value={col.label}
                    onChange={(v) => patchCol(col.key, { label: v || col.key })}
                    editable={editable}
                  />
                </th>
              ))}
              {/* Action column. Sticky to the right edge so it stays reachable
                  however many columns are shown or however wide the content
                  is — otherwise it scrolls away behind the overflow. */}
              {editable && (
                <th
                  className="sticky right-0 z-10 w-8 px-1 py-1"
                  style={{
                    backgroundColor: config.headerBg,
                    borderLeft: `1px solid ${config.borderColor}`,
                  }}
                />
              )}
            </tr>
          </thead>
          <tbody>
            {paging.pageRows.map((row, indexInPage) => {
              const isCritical = row.priority === "CRITICAL";
              return (
                <tr
                  key={row.id}
                  className={`group/row border-t ${isCritical ? "bg-red-50" : "hover:bg-zinc-50"} ${paging.rowClass}`}
                  style={{
                    // The critical-row highlight keeps priority over the
                    // configured background, so a red row stays red.
                    backgroundColor: isCritical
                      ? undefined
                      : config.stripeBg && (paging.offset + indexInPage) % 2 === 1
                        ? config.stripeBg
                        : config.cellBg,
                    height: config.rowHeight,
                    borderTopColor: config.borderColor,
                    animationDelay: `${paging.rowDelay(indexInPage)}ms`,
                  }}
                >
                  {visibleCols.map((col) => (
                    <RowCell
                      key={col.key}
                      colKey={col.key}
                      row={row}
                      editable={editable}
                      onChange={(changes) => patchRow(row.id, changes)}
                    />
                  ))}
                  {editable && (
                    <td
                      className="sticky right-0 z-10 w-8 px-1 py-0.5 text-center"
                      // Its own background, or the cells it floats over while
                      // scrolling would show through underneath it. The left
                      // divider makes it read as a pinned column.
                      style={{
                        backgroundColor: isCritical
                          ? "#fef2f2"
                          : config.stripeBg &&
                              (paging.offset + indexInPage) % 2 === 1
                            ? config.stripeBg
                            : config.cellBg,
                        borderLeft: `1px solid ${config.borderColor}`,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => removeRow(row.id)}
                        title="Remove row"
                        aria-label="Remove row"
                        className="mx-auto flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] leading-none text-white opacity-0 transition-opacity group-hover/row:opacity-100 focus-visible:opacity-100"
                      >×</button>
                    </td>
                  )}
                </tr>
              );
            })}
            {paging.pageRows.length === 0 && config.rows.length > 0 && (
              <NoMatches
                colSpan={visibleCols.length + (editable ? 1 : 0)}
                onClear={filter.clear}
                showClear={!externalFilter}
              />
            )}
            {config.rows.length === 0 && (
              <tr>
                <td colSpan={visibleCols.length + (editable ? 1 : 0)} className="py-4 text-center text-zinc-400">
                  No rows.{editable ? " Click + to add one." : ""}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {config.paginate && (
        <TablePager
          paging={paging}
          background={config.headerBg}
          color={config.headerText}
          borderColor={config.borderColor}
        />
      )}

      {editable && (
        <button
          type="button"
          onClick={() => setPanelOpen((v) => !v)}
          title="Table settings"
          aria-label="Table settings"
          className={`nodrag nopan absolute bottom-2 right-2 z-20 flex h-6 w-6 items-center justify-center rounded-full shadow transition-colors ${
            panelOpen ? "bg-blue-500 text-white" : "bg-white/90 text-zinc-600 hover:bg-white"
          }`}
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
          </svg>
        </button>
      )}

      {editable && panelOpen && (
        <SettingsShell
          title="Table settings"
          onReset={reset}
          onClose={() => setPanelOpen(false)}
          hint={
            <>
              Double-click any header or cell to edit it · use the column menu
              to show or hide columns · Previous / Next turn the page.
            </>
          }
        >
          <PanelColumn>
            <Group label="Colours">
              <Swatch label="Header bg" value={config.headerBg} onChange={(v) => patch("headerBg", v)} />
              <Swatch label="Header text" value={config.headerText} onChange={(v) => patch("headerText", v)} />
              <Swatch label="Cell bg" value={config.cellBg} onChange={(v) => patch("cellBg", v)} />
              <Swatch label="Cell text" value={config.cellText} onChange={(v) => patch("cellText", v)} />
              <Swatch label="Stripe" value={config.stripeBg} onChange={(v) => patch("stripeBg", v)} />
              <Swatch label="Border" value={config.borderColor} onChange={(v) => patch("borderColor", v)} />
            </Group>
          </PanelColumn>

          <PanelColumn>
            <Group label="Size">
              <Slider
                label="Row height"
                value={config.rowHeight}
                suffix="px"
                min={18}
                max={56}
                onChange={(v) => patch("rowHeight", v)}
              />
              <Slider
                label="Font size"
                value={config.fontSize}
                suffix="px"
                min={8}
                max={18}
                onChange={(v) => patch("fontSize", v)}
              />
            </Group>
          </PanelColumn>

          <PanelColumn>
            <Group label="Paging">
              <Toggle
                label="Paginate rows"
                checked={config.paginate}
                onChange={(v) => patch("paginate", v)}
              />
              <NumberField
                label="Rows per page"
                value={config.pageSize}
                min={1}
                max={100}
                disabled={!config.paginate}
                onChange={(v) => patch("pageSize", v)}
              />
              <SelectField
                label="Transition"
                value={config.transition}
                options={TRANSITION_OPTIONS}
                disabled={!config.paginate}
                onChange={(v) => patch("transition", v as TransitionStyle)}
              />
            </Group>
          </PanelColumn>
        </SettingsShell>
      )}
    </section>
  );
}

// ── Row cell — delegates special columns to specialised renderers ─────

interface RowCellProps {
  colKey: string;
  row: SoeRowConfig;
  editable: boolean;
  onChange: (changes: Partial<SoeRowConfig>) => void;
}

function RowCell({ colKey, row, editable, onChange }: RowCellProps) {
  const base = "whitespace-nowrap px-2 py-0.5";

  // Priority badge — clicking cycles between CRITICAL → WARNING → INFO
  if (colKey === "priority") {
    const cycle: EventPriority[] = ["CRITICAL", "WARNING", "INFO"];
    const next = cycle[(cycle.indexOf(row.priority) + 1) % cycle.length];
    const styles: Record<EventPriority, string> = {
      CRITICAL: "bg-red-600 text-white",
      WARNING:  "bg-amber-400 text-zinc-900",
      INFO:     "bg-blue-500 text-white",
    };
    return (
      <td className={base}>
        <button
          type="button"
          disabled={!editable}
          onClick={() => editable && onChange({ priority: next })}
          title={editable ? "Click to cycle priority" : undefined}
          className={`inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-bold tracking-wide ${styles[row.priority]} ${editable ? "cursor-pointer hover:opacity-80" : ""}`}
        >
          {row.priority}
        </button>
      </td>
    );
  }

  // Quality — toggle between Good / Invalid on click
  if (colKey === "quality") {
    return (
      <td className={`${base} font-semibold ${row.qualityGood ? "text-emerald-600" : "text-red-600"}`}>
        {editable ? (
          <button
            type="button"
            onClick={() => onChange({ quality: row.qualityGood ? "Invalid" : "Good", qualityGood: !row.qualityGood })}
            title="Click to toggle quality"
            className="cursor-pointer hover:underline"
          >
            {row.quality}
          </button>
        ) : row.quality}
      </td>
    );
  }

  // All other columns — double-click to edit inline
  const value = row[colKey as keyof SoeRowConfig] as string;
  return (
    <td className={colKey === "num" || colKey === "msec" ? `${base} text-zinc-500` : base}>
      <EditableCell
        value={value}
        onChange={(v) => onChange({ [colKey]: v } as Partial<SoeRowConfig>)}
        editable={editable}
      />
    </td>
  );
}

// ── EditableCell: double-click on the <td> content to edit ───────────

function EditableCell({
  value,
  onChange,
  editable,
}: {
  value: string;
  onChange: (v: string) => void;
  editable: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const committed = useRef(false);

  useEffect(() => { if (!editing) setDraft(value); }, [value, editing]);
  useEffect(() => { if (editing) { inputRef.current?.focus(); const caret = inputRef.current; if (caret) caret.setSelectionRange(caret.value.length, caret.value.length); } }, [editing]);

  function startEdit(e: React.MouseEvent) {
    if (!editable || e.detail < 2) return;
    e.stopPropagation();
    committed.current = false;
    setDraft(value);
    setEditing(true);
  }

  function commit() {
    if (committed.current) return;
    committed.current = true;
    setEditing(false);
    if (draft !== value) onChange(draft);
  }

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") { e.preventDefault(); commit(); }
    else if (e.key === "Escape") { committed.current = true; setEditing(false); }
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={onKey}
        className="w-full rounded border border-blue-400 bg-white px-0.5 outline-none"
        style={{ minWidth: Math.max(draft.length + 1, 4) + "ch" }}
      />
    );
  }

  return (
    <span
      onClick={startEdit}
      title={editable ? "Double-click to edit" : undefined}
      className={`block select-none whitespace-nowrap ${editable ? "cursor-text rounded px-0.5 hover:bg-zinc-100" : ""}`}
    >
      {value || <span className="italic text-zinc-300">—</span>}
    </span>
  );
}

// ── EditableInline — used in the header for title/subtitle/col labels ─

function EditableInline({
  value,
  onChange,
  editable,
  glass = false,
}: {
  value: string;
  onChange: (v: string) => void;
  editable: boolean;
  glass?: boolean;
}) {
  const [session, setSession] = useState<number | null>(null);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const committed = useRef(false);
  const editing = session !== null;

  useEffect(() => { if (!editing) setDraft(value); }, [value, editing]);
  useEffect(() => { if (editing) { inputRef.current?.focus(); const caret = inputRef.current; if (caret) caret.setSelectionRange(caret.value.length, caret.value.length); } }, [editing]);

  if (!editable) return <>{value}</>;

  function startEdit(e: React.MouseEvent) {
    if (e.detail < 2) return;
    e.stopPropagation();
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
        className={`rounded border px-1 text-inherit outline-none ${glass ? "border-white/40 bg-white/10 focus:border-white" : "border-zinc-300 bg-white focus:border-blue-500"}`}
        style={{ width: `${Math.max(draft.length + 1, 4)}ch` }}
      />
    );
  }

  return (
    <span
      onClick={startEdit}
      title="Double-click to edit"
      className={`cursor-text select-none rounded px-0.5 ${glass ? "hover:bg-white/20" : "hover:bg-zinc-100"}`}
    >
      {value || <span className="italic opacity-50">…</span>}
    </span>
  );
}

// ── localStorage helpers ──────────────────────────────────────────────

function loadConfig(key: string, fallback: SoeEventListConfig): SoeEventListConfig {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<SoeEventListConfig>;
    return { ...fallback, ...parsed };
  } catch {
    return fallback;
  }
}

