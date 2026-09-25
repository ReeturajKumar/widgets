"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {
  FilterBar,
  useRowFilter,
  type FilterField,
} from "../../filterShared";
import {
  DEFAULT_EVENT_CHRONOLOGY,
  type EventChronologyConfig,
  type TimelineKind,
  type TimelinePointConfig,
} from "./types";

const TIMELINE_COLOR: Record<TimelineKind, string> = {
  critical: "#dc2626",
  warning: "#eab308",
  info: "#2563eb",
  restoration: "#16a34a",
};

// ── Props ─────────────────────────────────────────────────────────────

interface EventChronologyCardProps {
  /** Initial configuration; used on first render if nothing in storage. */
  defaultConfig?: EventChronologyConfig;
  /** Storage key for localStorage persistence. */
  storageKey?: string;
  /** Disable inline editing to lock into view-only mode. */
  editable?: boolean;
  /** Callback fired whenever config changes. */
  onChange?: (config: EventChronologyConfig) => void;
  /** Callback fired when a timeline point is selected. */
  onSelectPoint?: (point: TimelinePointConfig) => void;
  /** Set by a dashboard template driving filtering from its filter panel. */
  externalFilter?: (point: TimelinePointConfig) => boolean;
  /**
   * Timeline points rebuilt from the filtered events. Takes precedence over
   * the card's own points so the timeline describes the same event set as the
   * rest of the dashboard.
   */
  derivedPoints?: TimelinePointConfig[];
  /** Hides the widget's own filter bar — see SoeEventList. */
  hideFilterBar?: boolean;
}

/**
 * Fully-customizable and editable Event Chronology (Timeline View) widget component.
 *
 * - Double-click title, subtitle, legend labels, event timestamps/titles, and arrow labels to edit.
 * - Single-click any point node to select it and show the active callout bubble.
 * - Hover over a point to cycle its severity kind (Critical, Warning, Info, Restoration), toggle a break slash, or delete it.
 * - Header '+ Point' button adds new timeline events.
 * - Full localStorage persistence.
 */

// ── Filtering ─────────────────────────────────────────────────────────

const FILTER_FIELDS: FilterField<TimelinePointConfig>[] = [
  { key: "kind", label: "Severities", value: (p) => p.kind },
];

function searchableText(p: TimelinePointConfig): string {
  return `${p.time} ${p.label} ${p.kind}`;
}

export function EventChronologyCard({
  defaultConfig = DEFAULT_EVENT_CHRONOLOGY,
  storageKey = "widget.chronology.v1",
  editable = true,
  onChange,
  onSelectPoint,
  externalFilter,
  derivedPoints,
  hideFilterBar = false,
}: EventChronologyCardProps) {
  const [config, setConfig] = useState<EventChronologyConfig>(() =>
    loadConfig(storageKey, defaultConfig)
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(config));
    } catch {
      // ignore
    }
    onChange?.(config);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, storageKey]);

  const filter = useRowFilter(config.points, FILTER_FIELDS, searchableText);
  const visiblePoints = derivedPoints
    ? derivedPoints
    : externalFilter
      ? config.points.filter(externalFilter)
      : filter.rows;

  function patch<K extends keyof EventChronologyConfig>(
    key: K,
    value: EventChronologyConfig[K]
  ) {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }

  function patchPoint(id: string, changes: Partial<TimelinePointConfig>) {
    setConfig((prev) => ({
      ...prev,
      points: prev.points.map((p) => (p.id === id ? { ...p, ...changes } : p)),
    }));
  }

  function selectActive(id: string) {
    setConfig((prev) => ({
      ...prev,
      points: prev.points.map((p) => ({ ...p, active: p.id === id })),
    }));
    const found = config.points.find((p) => p.id === id);
    if (found) onSelectPoint?.(found);
  }

  function cycleKind(id: string) {
    const sequence: TimelineKind[] = ["critical", "warning", "info", "restoration"];
    setConfig((prev) => ({
      ...prev,
      points: prev.points.map((p) => {
        if (p.id !== id) return p;
        const nextIdx = (sequence.indexOf(p.kind) + 1) % sequence.length;
        return { ...p, kind: sequence[nextIdx] };
      }),
    }));
  }

  function toggleBreak(id: string) {
    setConfig((prev) => ({
      ...prev,
      points: prev.points.map((p) =>
        p.id === id ? { ...p, breakAfter: !p.breakAfter } : p
      ),
    }));
  }

  function addPoint() {
    const id = `pt-${Date.now().toString(36)}`;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}.${String(
      now.getMilliseconds()
    ).padStart(3, "0")}`;

    setConfig((prev) => ({
      ...prev,
      points: [
        ...prev.points,
        {
          id,
          time: timeStr,
          label: "New Event",
          kind: "info",
          active: false,
        },
      ],
    }));
  }

  function removePoint(id: string) {
    setConfig((prev) => ({
      ...prev,
      points: prev.points.filter((p) => p.id !== id),
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
    <section className="overflow-visible rounded-lg border border-blue-200 bg-white shadow-sm">
      {/* ── Header ── */}
      <header className="group/header relative flex flex-wrap items-center justify-between gap-2 border-b border-blue-200 bg-blue-600 px-3 py-2 text-white">
        <div className="flex items-center gap-2">
          {/* Target / Radar section icon */}
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-white/20 text-white">
            <svg
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="9" />
              <circle cx="12" cy="12" r="4" />
              <line x1="12" y1="2" x2="12" y2="5" />
              <line x1="12" y1="19" x2="12" y2="22" />
              <line x1="2" y1="12" x2="5" y2="12" />
              <line x1="19" y1="12" x2="22" y2="12" />
            </svg>
          </div>

          <div className="flex items-baseline gap-1.5">
            <h2 className="text-[13px] font-semibold text-white">
              <Editable
                value={config.title}
                onChange={(v) => patch("title", v || "Event Chronology")}
                editable={editable}
                placeholder="Event Chronology"
                dark={false}
              />
            </h2>
            <span className="text-[11px] text-blue-100">
              <Editable
                value={config.subtitle}
                onChange={(v) => patch("subtitle", v || "")}
                editable={editable}
                placeholder="(Timeline View)"
                dark={false}
              />
            </span>
          </div>
        </div>

        {/* Legend + Header Actions */}
        <div className="flex items-center gap-3 text-[10px]">
          <div className="flex items-center gap-2.5">
            <LegendItem
              color={TIMELINE_COLOR.critical}
              label={config.criticalLabel}
              onLabelChange={(v) => patch("criticalLabel", v)}
              editable={editable}
            />
            <LegendItem
              color={TIMELINE_COLOR.warning}
              label={config.warningLabel}
              onLabelChange={(v) => patch("warningLabel", v)}
              editable={editable}
            />
            <LegendItem
              color={TIMELINE_COLOR.info}
              label={config.infoLabel}
              onLabelChange={(v) => patch("infoLabel", v)}
              editable={editable}
            />
            <LegendItem
              color={TIMELINE_COLOR.restoration}
              label={config.restorationLabel}
              onLabelChange={(v) => patch("restorationLabel", v)}
              editable={editable}
            />
          </div>

          {/* Add Point Button */}
          {editable && (
            <button
              type="button"
              onClick={addPoint}
              title="Add event point"
              aria-label="Add event point"
              className="flex h-5 items-center gap-1 rounded border border-dashed border-white/50 px-1.5 text-[10px] font-medium text-white hover:border-white hover:bg-white/15 transition-colors"
            >
              <svg
                viewBox="0 0 16 16"
                className="h-2.5 w-2.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <line x1="8" y1="2" x2="8" y2="14" />
                <line x1="2" y1="8" x2="14" y2="8" />
              </svg>
              <span>Point</span>
            </button>
          )}

          {/* Reset button — visible on hover/focus */}
          {editable && (
            <button
              type="button"
              onClick={reset}
              title="Reset timeline to defaults"
              className="absolute -bottom-2.5 right-3 rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-semibold text-zinc-600 opacity-0 shadow transition-opacity group-focus-within/header:opacity-100 hover:!opacity-100 hover:bg-white z-10"
            >
              Reset card
            </button>
          )}
        </div>
      </header>

      {!hideFilterBar && !externalFilter && (
        <FilterBar
          filter={filter}
          fields={FILTER_FIELDS}
          placeholder="Search events…"
          noun="points"
        />
      )}

      {/* ── Body: Timeline Visualization ── */}
      <div className="p-3">
        <div className="overflow-x-auto pt-4 pb-1">
          {/* Top Labels Row */}
          <div className="mb-2 flex items-end justify-between gap-1 text-[9.5px]">
            {visiblePoints.map((point) => (
              <div
                key={point.id}
                className="group/pt relative flex flex-1 flex-col items-center text-center"
              >
                {/* Active Bubble Card vs Regular Label */}
                <div
                  onClick={() => selectActive(point.id)}
                  className={`relative cursor-pointer transition-all ${
                    point.active
                      ? "rounded-md border border-red-400 bg-red-50/90 px-2 py-1 shadow-xs ring-1 ring-red-300"
                      : "rounded px-1 py-0.5 hover:bg-blue-50/60"
                  }`}
                >
                  <div
                    className={`font-semibold ${
                      point.active ? "text-red-950 font-bold" : "text-blue-950"
                    }`}
                  >
                    <EditableBlock
                      value={point.time}
                      onChange={(v) => patchPoint(point.id, { time: v || point.time })}
                      editable={editable}
                      placeholder="00:00:00.000"
                      className={`text-[9.5px] font-semibold ${
                        point.active ? "text-red-950 font-bold" : "text-blue-950"
                      }`}
                    />
                  </div>
                  <div
                    className={`leading-tight ${
                      point.active ? "text-red-900 font-semibold" : "text-zinc-600"
                    }`}
                  >
                    <EditableBlock
                      value={point.label}
                      onChange={(v) => patchPoint(point.id, { label: v || point.label })}
                      editable={editable}
                      placeholder="Event name"
                      className="text-[9px] text-zinc-600"
                    />
                  </div>

                  {/* Active speech bubble indicator pointer */}
                  {point.active && (
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-red-50 border-r border-b border-red-400 rotate-45" />
                  )}
                </div>

                {/* Point Quick Actions (hover) */}
                {editable && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 opacity-0 group-hover/pt:opacity-100 transition-opacity bg-white px-1.5 py-0.5 rounded-full shadow-md border border-zinc-200">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        cycleKind(point.id);
                      }}
                      title={`Cycle type (Current: ${point.kind})`}
                      className="flex h-4 items-center justify-center rounded px-1 text-[9px] font-bold uppercase hover:bg-zinc-100 cursor-pointer"
                      style={{ color: TIMELINE_COLOR[point.kind] }}
                    >
                      ●
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBreak(point.id);
                      }}
                      title={point.breakAfter ? "Remove timeline break" : "Add timeline break ( / )"}
                      className={`flex h-4 items-center justify-center rounded px-1 text-[9px] font-bold hover:bg-zinc-100 cursor-pointer ${
                        point.breakAfter ? "text-blue-600 font-black" : "text-zinc-400"
                      }`}
                    >
                      /
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removePoint(point.id);
                      }}
                      title="Remove point"
                      aria-label="Remove point"
                      className="flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700 shadow-xs cursor-pointer"
                    >
                      <svg
                        viewBox="0 0 16 16"
                        className="h-2.5 w-2.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      >
                        <line x1="4" y1="4" x2="12" y2="12" />
                        <line x1="12" y1="4" x2="4" y2="12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Timeline Bar & Nodes */}
          <div className="relative flex h-6 items-center px-4">
            {/* Background horizontal track line */}
            <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-0.5 bg-blue-300" />

            {/* Nodes across track */}
            <div className="relative flex w-full items-center justify-between">
              {visiblePoints.map((point, i) => (
                <div
                  key={point.id}
                  className="relative flex items-center justify-center"
                >
                  {/* Node Dot */}
                  <button
                    type="button"
                    onClick={() => selectActive(point.id)}
                    title={`${point.time} - ${point.label} (${point.kind})`}
                    className={`relative z-10 block rounded-full border-2 border-white shadow-sm transition-all ${
                      point.active
                        ? "h-4 w-4 ring-4 ring-red-400/40 scale-125"
                        : "h-3.5 w-3.5 hover:scale-110"
                    }`}
                    style={{ backgroundColor: TIMELINE_COLOR[point.kind] }}
                  />

                  {/* Break Slash '/' between nodes */}
                  {point.breakAfter && i < config.points.length - 1 && (
                    <span className="absolute -right-3 top-1/2 -translate-y-1/2 font-extrabold text-blue-900 text-[12px] select-none z-10">
                      /
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Footer Older / Newer Events ── */}
        <div className="mt-2 flex items-center justify-between text-[10px] text-blue-900 font-medium">
          <div className="flex items-center gap-1">
            <EditableBlock
              value={config.olderEventsLabel}
              onChange={(v) => patch("olderEventsLabel", v || "← Older Events")}
              editable={editable}
              placeholder="← Older Events"
              className="text-[10px] text-blue-900 font-medium"
            />
          </div>
          <div className="flex items-center gap-1">
            <EditableBlock
              value={config.newerEventsLabel}
              onChange={(v) => patch("newerEventsLabel", v || "Newer Events →")}
              editable={editable}
              placeholder="Newer Events →"
              className="text-[10px] text-blue-900 font-medium"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Legend Dot Item ───────────────────────────────────────────────────

function LegendItem({
  color,
  label,
  onLabelChange,
  editable,
}: {
  color: string;
  label: string;
  onLabelChange: (val: string) => void;
  editable: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1 text-white">
      <span
        className="h-2 w-2 rounded-full ring-1 ring-white/40"
        style={{ backgroundColor: color }}
      />
      <Editable
        value={label}
        onChange={(v) => onLabelChange(v || label)}
        editable={editable}
        placeholder={label}
        dark={false}
      />
    </span>
  );
}

// ── EditableBlock ─────────────────────────────────────────────────────

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
    if (e.key === "Enter") {
      e.preventDefault();
      commit();
    } else if (e.key === "Escape") {
      committed.current = true;
      setSession(null);
    }
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
        className={`${className} w-full rounded border border-blue-300 bg-white px-1 outline-none focus:border-blue-500`}
      />
    );
  }

  return (
    <div
      onClick={startEdit}
      title={editable ? "Double-click to edit" : undefined}
      className={`${className} select-none rounded px-0.5 ${
        editable ? "cursor-text hover:bg-blue-100/50" : ""
      }`}
    >
      {value || <span className="italic opacity-50">{placeholder}</span>}
    </div>
  );
}

// ── Editable Inline (for glass/header) ────────────────────────────────

interface EditableProps {
  value: string;
  onChange: (value: string) => void;
  editable?: boolean;
  placeholder?: string;
  dark?: boolean;
}

function Editable({
  value,
  onChange,
  editable = true,
  placeholder,
  dark = false,
}: EditableProps) {
  const [session, setSession] = useState<number | null>(null);

  if (!editable) {
    return <span>{value || placeholder}</span>;
  }

  if (session !== null) {
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
        dark ? "hover:bg-blue-100" : "hover:bg-white/20"
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
          ? "border-blue-300 bg-white text-blue-950 focus:border-blue-500"
          : "border-white/40 bg-white/10 focus:border-white text-white"
      }`}
      style={{ width: `${Math.max(draft.length + 1, 4)}ch` }}
    />
  );
}

// ── localStorage helper ───────────────────────────────────────────────

function loadConfig(
  key: string,
  fallback: EventChronologyConfig
): EventChronologyConfig {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = window.localStorage.getItem(key);
    if (!stored) return fallback;
    const parsed = JSON.parse(stored) as Partial<EventChronologyConfig>;
    return { ...fallback, ...parsed };
  } catch {
    return fallback;
  }
}
