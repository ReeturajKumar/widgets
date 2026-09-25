"use client";

// Pieces shared by every table widget: the column resizer, the inline header
// editor, the small settings-panel primitives and the storage loader.
//
// These live together rather than being copied per table because the resizer
// in particular carries two non-obvious fixes — window listeners instead of
// pointer capture, and zoom compensation — that must not drift between tables.

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

export const COLUMN_MIN_WIDTH = 64;

// ── Column resizer ────────────────────────────────────────────────────

export interface ColumnResizerProps {
  width: number;
  onResize: (width: number) => void;
  color: string;
}

/**
 * Divider on a header cell's right edge.
 *
 * Tracks the drag with window listeners rather than pointer capture. The board
 * reorders its node array to bring a node to the front on pointerdown, which
 * moves the node in the DOM and silently voids any capture taken on an element
 * inside it — so capture cannot be relied on here. Window listeners are
 * immune to that, and a ref (not state) guards the move handler so no
 * movement is dropped between pointerdown and React committing.
 *
 * The delta is divided by the board's current zoom: clientX is in screen
 * pixels but a column width is in layout pixels, so at 50% zoom a 100px drag
 * would otherwise widen the column by 200.
 */
export function ColumnResizer({ width, onResize, color }: ColumnResizerProps) {
  const startX = useRef(0);
  const startWidth = useRef(0);
  const scale = useRef(1);
  const frame = useRef<number | null>(null);
  const pending = useRef<number | null>(null);
  const draggingRef = useRef(false);
  const [dragging, setDragging] = useState(false);

  // Latest onResize without re-binding listeners mid-drag. Written in an
  // effect rather than during render — a ref write during render is not a
  // legal commit point.
  const resizeRef = useRef(onResize);
  useEffect(() => {
    resizeRef.current = onResize;
  }, [onResize]);

  useEffect(() => {
    function onMove(event: PointerEvent) {
      if (!draggingRef.current) return;
      const dx = (event.clientX - startX.current) / scale.current;
      pending.current = Math.max(
        COLUMN_MIN_WIDTH,
        Math.round(startWidth.current + dx)
      );
      // One commit per frame; intermediate moves collapse into the latest.
      if (frame.current !== null) return;
      frame.current = requestAnimationFrame(() => {
        frame.current = null;
        if (pending.current !== null) resizeRef.current(pending.current);
      });
    }
    function onUp() {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      if (frame.current !== null) {
        cancelAnimationFrame(frame.current);
        frame.current = null;
      }
      // Flush rather than discard: the frame pending at release holds the
      // final width, and cancelling it would drop the end of the drag.
      if (pending.current !== null) {
        resizeRef.current(pending.current);
        pending.current = null;
      }
      setDragging(false);
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, []);

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    startX.current = event.clientX;
    startWidth.current = width;
    // Rendered width ÷ configured width is the board's effective zoom.
    const header = event.currentTarget.parentElement;
    const rendered = header?.getBoundingClientRect().width ?? width;
    scale.current = width > 0 ? rendered / width : 1;
    pending.current = null;
    draggingRef.current = true;
    setDragging(true);
  }

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize column"
      title="Drag to resize column"
      onPointerDown={onPointerDown}
      // nodrag/nopan: without them React Flow starts panning the board the
      // moment the pointer presses on the divider.
      className="nodrag nopan absolute inset-y-0 right-0 z-20 w-[5px] cursor-col-resize touch-none"
      style={{ backgroundColor: dragging ? "#3b82f6" : "transparent" }}
      onMouseEnter={(e) => {
        if (!dragging) e.currentTarget.style.backgroundColor = color;
      }}
      onMouseLeave={(e) => {
        if (!dragging) e.currentTarget.style.backgroundColor = "transparent";
      }}
    />
  );
}

// ── Settings panel kit ────────────────────────────────────────────────
//
// Both tables build their panel from these, so the two stay visually
// identical and the column rhythm cannot drift apart.

/** Shared control chrome for selects and number inputs. */
const CONTROL =
  "w-full min-w-0 rounded border border-zinc-200 bg-white px-1.5 py-[3px] text-[10px] text-zinc-700 outline-none transition-colors focus:border-blue-400 disabled:bg-zinc-50 disabled:text-zinc-400";

export function SettingsShell({
  title,
  hint,
  onReset,
  onClose,
  children,
}: {
  title: string;
  hint: ReactNode;
  onReset: () => void;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className="nodrag nopan absolute bottom-10 right-2 z-30 flex max-h-[88%] w-[520px] max-w-[calc(100%-1rem)] flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white text-zinc-700 shadow-2xl"
      onPointerDown={(event) => event.stopPropagation()}
    >
      <div className="flex shrink-0 items-center justify-between border-b border-zinc-100 px-3 py-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
          {title}
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
            onClick={onClose}
            aria-label="Close settings"
            className="text-[11px] leading-none text-zinc-400 transition-colors hover:text-zinc-700"
          >
            ✕
          </button>
        </div>
      </div>

      {/* One scroll region, so a tall column cannot push the footer away. */}
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-2.5">
        {/* divide-x draws the column rules; the first/last padding resets keep
            the outer gutters equal to the panel's own padding instead of
            doubling it. */}
        <div className="grid grid-cols-3 divide-x divide-zinc-100">{children}</div>
      </div>

      <p className="shrink-0 border-t border-zinc-100 px-3 py-1.5 text-[9px] leading-[1.5] text-zinc-400">
        {hint}
      </p>
    </div>
  );
}

export function PanelColumn({ children }: { children: ReactNode }) {
  return <div className="px-3 first:pl-0 last:pr-0">{children}</div>;
}

export function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="mb-3.5 last:mb-0">
      <h4 className="mb-1.5 text-[9px] font-semibold uppercase tracking-wider text-zinc-400">
        {label}
      </h4>
      <div className="flex flex-col gap-1.5">{children}</div>
    </section>
  );
}

export function Swatch({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-2 text-[10px] leading-4 text-zinc-600">
      <span className="min-w-0 flex-1 truncate">{label}</span>
      <input
        type="color"
        value={value || "#000000"}
        onChange={(e) => onChange(e.target.value)}
        className="h-[18px] w-8 shrink-0 cursor-pointer rounded border border-zinc-200 bg-white p-0"
      />
    </label>
  );
}

/** Label above its control — keeps a long select from clipping its own text. */
export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-[10px] text-zinc-600">
      <span className="mb-1 block truncate">{label}</span>
      {children}
    </label>
  );
}

export function SelectField({
  label,
  value,
  options,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <Field label={label}>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={CONTROL}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function NumberField({
  label,
  value,
  min,
  max,
  disabled,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <Field label={label}>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        disabled={disabled}
        onChange={(e) =>
          onChange(Math.min(max, Math.max(min, Number(e.target.value) || min)))
        }
        className={CONTROL}
      />
    </Field>
  );
}

/** Value sits on the baseline opposite its label, so the slider below gets a
 *  full-width track instead of sharing the row. */
export function Slider({
  label,
  value,
  suffix,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  suffix: string;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2 text-[10px] text-zinc-600">
        <span className="min-w-0 truncate">{label}</span>
        <span className="shrink-0 tabular-nums text-zinc-400">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="block w-full accent-blue-600"
      />
    </div>
  );
}

export function Toggle({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      className={`flex items-center justify-between gap-2 text-[10px] leading-4 ${
        disabled ? "text-zinc-300" : "cursor-pointer text-zinc-600"
      }`}
    >
      <span className="min-w-0 flex-1 truncate">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="h-3 w-3 shrink-0 accent-blue-600"
      />
    </label>
  );
}

export function PanelButton({
  children,
  disabled,
  onClick,
}: {
  children: ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded border border-zinc-200 px-2 py-1 text-[9.5px] font-medium text-zinc-600 transition-colors enabled:hover:border-blue-400 enabled:hover:text-blue-600 disabled:opacity-40"
    >
      {children}
    </button>
  );
}

// ── Inline editable text ──────────────────────────────────────────────

export interface EditableProps {
  value: string;
  onChange: (value: string) => void;
  editable: boolean;
  color: string;
}

export function Editable({ value, onChange, editable, color }: EditableProps) {
  const [session, setSession] = useState<number | null>(null);

  if (!editable) return <>{value}</>;

  if (session !== null) {
    return (
      <EditableInput
        key={session}
        initial={value}
        color={color}
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
      onClick={(event) => event.stopPropagation()}
      onDoubleClick={(event) => {
        event.stopPropagation();
        setSession(Date.now());
      }}
      title="Double-click to edit"
      className="cursor-text rounded px-0.5 hover:bg-white/15"
    >
      {value}
    </span>
  );
}

export function EditableInput({
  initial,
  color,
  align = "center",
  onCommit,
  onCancel,
}: {
  initial: string;
  color: string;
  align?: "left" | "center" | "right";
  onCommit: (value: string) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState(initial);
  const committed = useRef(false);

  function focusOnMount(node: HTMLInputElement | null) {
    if (!node) return;
    node.focus();
    // Caret at the end — select-all lets the first keystroke wipe the text.
    node.setSelectionRange(node.value.length, node.value.length);
  }

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
      event.stopPropagation();
      committed.current = true;
      onCancel();
    }
  }

  return (
    <input
      ref={focusOnMount}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={onKey}
      onPointerDown={(e) => e.stopPropagation()}
      className="nodrag nopan w-full rounded border border-white/40 bg-white/10 px-1 outline-none focus:border-white"
      style={{ color, font: "inherit", textAlign: align }}
    />
  );
}

/**
 * A body cell that can be edited in place.
 *
 * `children` is what the cell normally shows — a badge, coloured status text,
 * a formatted number — while `value` is the raw text the editor seeds itself
 * with. Splitting the two lets a badge stay a badge until you double-click it.
 *
 * Like {@link Editable}, the editor is keyed per session so a fresh draft
 * starts from the current value and never drifts from props mid-edit.
 */
export interface EditableCellProps {
  value: string;
  onChange: (value: string) => void;
  editable: boolean;
  color: string;
  align?: "left" | "center" | "right";
  children: ReactNode;
}

export function EditableCell({
  value,
  onChange,
  editable,
  color,
  align = "center",
  children,
}: EditableCellProps) {
  const [session, setSession] = useState<number | null>(null);

  if (!editable) return <>{children}</>;

  if (session !== null) {
    return (
      <EditableInput
        key={session}
        initial={value}
        color={color}
        align={align}
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
      onClick={(event) => event.stopPropagation()}
      onDoubleClick={(event) => {
        event.stopPropagation();
        setSession(Date.now());
      }}
      title="Double-click to edit"
      // block, not inline: a wrapped inline span's hit box spans both line
      // boxes and the centre lands in the dead gap between them.
      // A ring rather than a background tint, so the hover cue is visible on
      // both the dark and the light table.
      className="block cursor-text rounded hover:ring-1 hover:ring-blue-400/70"
    >
      {children}
    </span>
  );
}

// ── Paging & page transitions ─────────────────────────────────────────

export type TransitionStyle =
  | "none"
  | "fade"
  | "slide"
  | "slideUp"
  | "zoom"
  | "flip"
  | "blur"
  | "stagger";

export const TRANSITION_OPTIONS: { value: TransitionStyle; label: string }[] = [
  { value: "fade", label: "Fade in / out" },
  { value: "slide", label: "Slide sideways" },
  { value: "slideUp", label: "Slide up / down" },
  { value: "zoom", label: "Zoom" },
  { value: "flip", label: "Flip" },
  { value: "blur", label: "Blur dissolve" },
  { value: "stagger", label: "Cascade rows" },
  { value: "none", label: "None (instant)" },
];

/** Half a page turn: the out phase and the in phase each take this long. */
export const TRANSITION_MS = 240;

/** Per-row offset for the cascade, capped so a long page still turns promptly. */
const STAGGER_STEP_MS = 22;
const STAGGER_MAX_ROWS = 10;

export interface Paging<T> {
  /** The slice to render. */
  pageRows: T[];
  /** Index of `pageRows[0]` within the full list — the row identity that cell
   *  overrides and React keys must use, not the index within the page. */
  offset: number;
  page: number;
  pageCount: number;
  total: number;
  canPrev: boolean;
  canNext: boolean;
  prev: () => void;
  next: () => void;
  /** Direction of the turn in progress: 1 forward, -1 back. */
  direction: number;
  /** Animation class for every row, or "" when settled. */
  rowClass: string;
  /** Per-row animation delay, non-zero only for the cascade. */
  rowDelay: (indexInPage: number) => number;
}

/**
 * Splits `rows` into pages and drives the two-phase turn.
 *
 * A page turn is out-then-in rather than a crossfade: the table has one set of
 * rows at a time, so the outgoing page animates away, the slice swaps, and the
 * incoming page animates in. Both halves use the same duration, so the whole
 * turn takes 2 × TRANSITION_MS.
 *
 * The page is clamped rather than corrected in an effect — if the row count
 * shrinks under it (a shorter interval, fewer RTUs), the render simply falls
 * back to the last valid page instead of flashing an empty table for a frame.
 */
export function usePaging<T>(
  rows: T[],
  pageSize: number,
  style: TransitionStyle,
  enabled: boolean
): Paging<T> {
  const [page, setPage] = useState(1);
  const [phase, setPhase] = useState<"idle" | "out" | "in">("idle");
  const [direction, setDirection] = useState(1);
  const pendingPage = useRef(1);

  const size = Math.max(1, Math.round(pageSize));
  const pageCount = enabled ? Math.max(1, Math.ceil(rows.length / size)) : 1;
  const current = Math.min(Math.max(page, 1), pageCount);

  const animated = enabled && style !== "none";
  const stagger = style === "stagger";
  const holdMs = stagger
    ? TRANSITION_MS + STAGGER_MAX_ROWS * STAGGER_STEP_MS
    : TRANSITION_MS;

  useEffect(() => {
    if (phase === "idle") return;
    const timer = setTimeout(() => {
      if (phase === "out") {
        setPage(pendingPage.current);
        setPhase("in");
      } else {
        setPhase("idle");
      }
    }, holdMs);
    return () => clearTimeout(timer);
  }, [phase, holdMs]);

  function go(delta: number) {
    // Ignore clicks mid-turn; otherwise a fast double-click would swap the
    // slice while the outgoing rows are still animating.
    if (phase !== "idle") return;
    const target = Math.min(Math.max(current + delta, 1), pageCount);
    if (target === current) return;
    setDirection(delta);
    if (!animated) {
      setPage(target);
      return;
    }
    pendingPage.current = target;
    setPhase("out");
  }

  const offset = enabled ? (current - 1) * size : 0;
  const pageRows = enabled ? rows.slice(offset, offset + size) : rows;

  const rowClass =
    phase === "idle" || !animated ? "" : `tbl-anim tbl-${phase}-${style}`;

  return {
    pageRows,
    offset,
    page: current,
    pageCount,
    total: rows.length,
    canPrev: current > 1,
    canNext: current < pageCount,
    prev: () => go(-1),
    next: () => go(1),
    direction,
    rowClass,
    rowDelay: (i) =>
      stagger && phase !== "idle"
        ? Math.min(i, STAGGER_MAX_ROWS) * STAGGER_STEP_MS
        : 0,
  };
}

export interface TablePagerProps {
  paging: Paging<unknown>;
  background: string;
  color: string;
  borderColor: string;
}

/** Prev / Next bar pinned under the table. */
export function TablePager({
  paging,
  background,
  color,
  borderColor,
}: TablePagerProps) {
  const from = paging.total === 0 ? 0 : paging.offset + 1;
  const to = Math.min(paging.offset + paging.pageRows.length, paging.total);

  const button =
    "nodrag nopan flex items-center gap-1 rounded border px-2 py-[3px] text-[10px] font-medium transition-colors enabled:hover:border-blue-400 enabled:hover:text-blue-600 disabled:opacity-35";

  return (
    <div
      className="flex shrink-0 items-center justify-between gap-2 px-3 py-1.5"
      style={{ backgroundColor: background, borderTop: `1px solid ${borderColor}` }}
    >
      <button
        type="button"
        onClick={paging.prev}
        disabled={!paging.canPrev}
        aria-label="Previous page"
        className={button}
        style={{ color, borderColor }}
      >
        <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Previous
      </button>

      <span className="text-[10px] tabular-nums opacity-80" style={{ color }}>
        Page {paging.page} of {paging.pageCount}
        <span className="opacity-60">
          {" "}
          · {from}–{to} of {paging.total}
        </span>
      </span>

      <button
        type="button"
        onClick={paging.next}
        disabled={!paging.canNext}
        aria-label="Next page"
        className={button}
        style={{ color, borderColor }}
      >
        Next
        <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
}

// ── Fit to card width ─────────────────────────────────────────────────

/**
 * Column width for a table that scales with its card.
 *
 * When fitting, the configured pixel widths are emitted as percentages of
 * their own total, so `table-layout: fixed` reflows the columns to whatever
 * width the card currently has — the proportions the user dragged are kept at
 * every size. This is done in CSS rather than by measuring the card, so there
 * is no unscaled first paint and nothing to recompute on resize.
 *
 * When not fitting, the widths stay literal pixels and the table scrolls
 * sideways instead.
 */
export function fitColumnWidth(
  width: number,
  totalWidth: number,
  fit: boolean
): string {
  if (!fit || totalWidth <= 0) return `${width}px`;
  return `${(width / totalWidth) * 100}%`;
}

// ── Storage helper ────────────────────────────────────────────────────

/**
 * Merges a stored config over the preset, so older saves still boot.
 *
 * Only keys the preset still defines are carried across. Without that filter a
 * field dropped in a later version rides along in every subsequent save
 * forever, because the card writes back whatever it loaded.
 */
export function loadStoredConfig<T extends object>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const stored = JSON.parse(raw) as Partial<T>;
    const merged = { ...fallback };
    for (const field of Object.keys(fallback) as (keyof T)[]) {
      const value = stored[field];
      if (value !== undefined) merged[field] = value as T[keyof T];
    }
    return merged;
  } catch {
    return fallback;
  }
}
