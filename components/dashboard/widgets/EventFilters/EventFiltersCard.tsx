"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import {
  DEFAULT_EVENT_FILTERS,
  type EventFiltersConfig,
} from "./types";

// ── Props ─────────────────────────────────────────────────────────────

interface EventFiltersCardProps {
  /** Initial configuration; used on first render if nothing in storage. */
  defaultConfig?: EventFiltersConfig;
  /** Storage key for localStorage persistence. */
  storageKey?: string;
  /** Disable inline editing to lock into pure view/filter mode. */
  editable?: boolean;
  /** Callback fired whenever the config changes. */
  onChange?: (config: EventFiltersConfig) => void;
  /** Callback fired when the user clicks 'Apply Filters'. */
  onApply?: (filters: EventFiltersConfig) => void;
  /** Callback fired when the user clicks 'Reset'. */
  onResetFilters?: () => void;
  /** Callback fired when the user clicks 'Export'. */
  onExport?: () => void;
}

/**
 * Fully-customizable and editable Event Filters widget component.
 *
 * - Double-click any field label, date value, search placeholder, or button text to edit inline.
 * - Click select dropdowns to filter or switch active selection.
 * - Full localStorage persistence.
 */
export function EventFiltersCard({
  defaultConfig = DEFAULT_EVENT_FILTERS,
  storageKey = "widget.eventfilters.v1",
  editable = true,
  onChange,
  onApply,
  onResetFilters,
  onExport,
}: EventFiltersCardProps) {
  const [config, setConfig] = useState<EventFiltersConfig>(() =>
    loadConfig(storageKey, defaultConfig)
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(config));
    } catch {
      // storage disabled / quota full
    }
    onChange?.(config);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, storageKey]);

  function patch<K extends keyof EventFiltersConfig>(
    key: K,
    value: EventFiltersConfig[K]
  ) {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }

  function handleResetAll() {
    setConfig(defaultConfig);
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
    onResetFilters?.();
  }

  function handleApply() {
    onApply?.(config);
  }

  /**
   * Clears what the user *selected*, leaving what they *edited* alone.
   *
   * Each dropdown goes back to its own first option — the "All …" sentinel —
   * rather than to a hard-coded string, so a renamed option still resets
   * correctly. Labels and option lists are untouched; wiping those is what the
   * separate "Reset card" action is for.
   */
  function handleResetSelections() {
    setConfig((prev) => ({
      ...prev,
      pssValue: prev.pssOptions[0] ?? prev.pssValue,
      equipmentValue: prev.equipmentOptions[0] ?? prev.equipmentValue,
      eventTypeValue: prev.eventTypeOptions[0] ?? prev.eventTypeValue,
      priorityValue: prev.priorityOptions[0] ?? prev.priorityValue,
      qualityValue: prev.qualityOptions[0] ?? prev.qualityValue,
      searchValue: "",
      dateFromValue: defaultConfig.dateFromValue,
      dateToValue: defaultConfig.dateToValue,
    }));
    onResetFilters?.();
  }

  return (
    <section className="overflow-visible rounded-lg border border-blue-200 bg-white shadow-sm">
      {/* ── Header ── */}
      <header className="group/header relative flex items-center gap-2 border-b border-blue-200 bg-blue-600 px-3 py-2">
        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-white/20 text-white">
          <svg
            viewBox="0 0 24 24"
            className="h-3 w-3"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 4h16l-6 8v6l-4 2v-8Z" fill="currentColor" fillOpacity="0.2" />
          </svg>
        </div>

        <h2 className="flex-1 text-[13px] font-semibold text-white">
          <Editable
            value={config.title}
            onChange={(v) => patch("title", v || "Event Filters")}
            editable={editable}
            placeholder="Event Filters"
            dark={false}
          />
        </h2>

        {/* Reset card button — visible on focus/hover */}
        {editable && (
          <button
            type="button"
            onClick={handleResetAll}
            title="Reset filters card to defaults"
            className="absolute -bottom-2.5 right-3 rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-semibold text-zinc-600 opacity-0 shadow transition-opacity group-focus-within/header:opacity-100 hover:!opacity-100 hover:bg-white z-10"
          >
            Reset card
          </button>
        )}
      </header>

      {/* ── Body: 2-Column Filters Grid ── */}
      <div className="p-3 text-[11px] space-y-2.5">
        {/* Row 1: Date From & Date To */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Date From */}
          <FilterInputRow
            label={config.dateFromLabel}
            onLabelChange={(v) => patch("dateFromLabel", v)}
            editable={editable}
            rightElement={
              <DateInputBox
                value={config.dateFromValue}
                onChange={(v) => patch("dateFromValue", v)}
                editable={editable}
              />
            }
          />

          {/* Date To */}
          <FilterInputRow
            label={config.dateToLabel}
            onLabelChange={(v) => patch("dateToLabel", v)}
            editable={editable}
            rightElement={
              <DateInputBox
                value={config.dateToValue}
                onChange={(v) => patch("dateToValue", v)}
                editable={editable}
              />
            }
          />
        </div>

        {/* Row 2: PSS & Equipment */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* PSS */}
          <FilterInputRow
            label={config.pssLabel}
            onLabelChange={(v) => patch("pssLabel", v)}
            editable={editable}
            rightElement={
              <SelectBox
                value={config.pssValue}
                options={config.pssOptions}
                onChange={(v) => patch("pssValue", v)}
                editable={editable}
              />
            }
          />

          {/* Equipment */}
          <FilterInputRow
            label={config.equipmentLabel}
            onLabelChange={(v) => patch("equipmentLabel", v)}
            editable={editable}
            rightElement={
              <SelectBox
                value={config.equipmentValue}
                options={config.equipmentOptions}
                onChange={(v) => patch("equipmentValue", v)}
                editable={editable}
              />
            }
          />
        </div>

        {/* Row 3: Event Type & Priority */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Event Type */}
          <FilterInputRow
            label={config.eventTypeLabel}
            onLabelChange={(v) => patch("eventTypeLabel", v)}
            editable={editable}
            rightElement={
              <SelectBox
                value={config.eventTypeValue}
                options={config.eventTypeOptions}
                onChange={(v) => patch("eventTypeValue", v)}
                editable={editable}
              />
            }
          />

          {/* Priority */}
          <FilterInputRow
            label={config.priorityLabel}
            onLabelChange={(v) => patch("priorityLabel", v)}
            editable={editable}
            rightElement={
              <SelectBox
                value={config.priorityValue}
                options={config.priorityOptions}
                onChange={(v) => patch("priorityValue", v)}
                editable={editable}
              />
            }
          />
        </div>

        {/* Row 4: Quality (Left) & Search (Right) */}
        <div className="grid grid-cols-2 gap-2.5 items-end">
          {/* Quality */}
          <div className="mb-0.5">
            <FilterInputRow
              label={config.qualityLabel}
              onLabelChange={(v) => patch("qualityLabel", v)}
              editable={editable}
              rightElement={
                <SelectBox
                  value={config.qualityValue}
                  options={config.qualityOptions}
                  onChange={(v) => patch("qualityValue", v)}
                  editable={editable}
                />
              }
            />
          </div>

          {/* Search Box (stacked label on top) */}
          <div>
            <div className="mb-1 text-[10.5px] font-medium text-blue-950">
              <EditableBlock
                value={config.searchLabel}
                onChange={(v) => patch("searchLabel", v || "Search (Equipment / Event / Text)")}
                editable={editable}
                placeholder="Search label"
                className="text-[10.5px] font-medium text-blue-950"
              />
            </div>
            <div className="flex items-center rounded-md border border-blue-200/80 bg-white px-2 py-1 shadow-xs focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-400">
              <svg
                viewBox="0 0 24 24"
                className="h-3.5 w-3.5 text-blue-900 shrink-0 mr-1.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={config.searchValue}
                onChange={(e) => patch("searchValue", e.target.value)}
                placeholder={config.searchPlaceholder}
                className="w-full bg-transparent text-[11px] text-zinc-800 outline-none placeholder:text-zinc-400"
              />
            </div>
          </div>
        </div>

        {/* ── Row 5: Action Buttons ── */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          {/* Apply Filters */}
          <button
            type="button"
            onClick={handleApply}
            className="flex items-center justify-center gap-1.5 rounded-md bg-blue-600 py-1.5 px-2 text-[11px] font-semibold text-white shadow-xs transition-colors hover:bg-blue-700 active:scale-[0.98]"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5 shrink-0"
              fill="currentColor"
            >
              <path d="M4 4h16l-6 8v6l-4 2v-8Z" />
            </svg>
            <Editable
              value={config.applyButtonLabel}
              onChange={(v) => patch("applyButtonLabel", v || "Apply Filters")}
              editable={editable}
              placeholder="Apply Filters"
              dark={false}
            />
          </button>

          {/* Reset */}
          <button
            type="button"
            onClick={handleResetSelections}
            className="flex items-center justify-center gap-1.5 rounded-md border border-blue-200 bg-blue-50/80 py-1.5 px-2 text-[11px] font-semibold text-blue-900 shadow-xs transition-colors hover:bg-blue-100 active:scale-[0.98]"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            <Editable
              value={config.resetButtonLabel}
              onChange={(v) => patch("resetButtonLabel", v || "Reset")}
              editable={editable}
              placeholder="Reset"
              dark={true}
            />
          </button>

          {/* Export */}
          <button
            type="button"
            onClick={onExport}
            className="flex items-center justify-center gap-1.5 rounded-md border border-blue-200 bg-blue-50/80 py-1.5 px-2 text-[11px] font-semibold text-blue-900 shadow-xs transition-colors hover:bg-blue-100 active:scale-[0.98]"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <Editable
              value={config.exportButtonLabel}
              onChange={(v) => patch("exportButtonLabel", v || "Export")}
              editable={editable}
              placeholder="Export"
              dark={true}
            />
          </button>
        </div>
      </div>
    </section>
  );
}

// ── Horizontal Filter Row (Label on left, Input on right) ─────────────

interface FilterInputRowProps {
  label: string;
  onLabelChange: (val: string) => void;
  editable: boolean;
  rightElement: ReactNode;
}

function FilterInputRow({
  label,
  onLabelChange,
  editable,
  rightElement,
}: FilterInputRowProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-16 shrink-0 text-[11px] font-medium text-blue-950">
        <EditableBlock
          value={label}
          onChange={(v) => onLabelChange(v || label)}
          editable={editable}
          placeholder="Label"
          className="text-[11px] font-medium text-blue-950"
        />
      </span>
      <div className="min-w-0 flex-1">{rightElement}</div>
    </div>
  );
}

// ── Date Input Box ────────────────────────────────────────────────────

interface DateInputBoxProps {
  value: string;
  onChange: (val: string) => void;
  editable: boolean;
}

function DateInputBox({ value, onChange, editable }: DateInputBoxProps) {
  return (
    <div className="flex items-center justify-between rounded-md border border-blue-200/80 bg-white px-2 py-1 shadow-xs hover:border-blue-400 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-400">
      <div className="min-w-0 flex-1">
        <EditableBlock
          value={value}
          onChange={(v) => onChange(v || "01-Jan-2026")}
          editable={editable}
          placeholder="DD-Mon-YYYY"
          className="text-[11px] text-zinc-800 font-normal"
        />
      </div>
      <svg
        viewBox="0 0 24 24"
        className="h-3.5 w-3.5 text-blue-600 shrink-0 ml-1 cursor-pointer"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    </div>
  );
}

// ── Select Box ────────────────────────────────────────────────────────

interface SelectBoxProps {
  value: string;
  options: string[];
  onChange: (val: string) => void;
  editable: boolean;
}

function SelectBox({ value, options, onChange, editable }: SelectBoxProps) {
  const [open, setOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!selectRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown, true);
    return () =>
      document.removeEventListener("pointerdown", onPointerDown, true);
  }, [open]);

  return (
    <div ref={selectRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-md border border-blue-200/80 bg-white px-2 py-1 shadow-xs hover:border-blue-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-400 text-left"
      >
        <span className="truncate text-[11px] text-zinc-800">
          {value || options[0] || "Select"}
        </span>
        <svg
          viewBox="0 0 12 12"
          className="h-3 w-3 text-blue-900 shrink-0 ml-1"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="3 5 6 8 9 5" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {open && (
        <div className="absolute left-0 top-full z-[300] mt-1 w-full rounded-md border border-zinc-200 bg-white py-1 shadow-xl max-h-48 overflow-y-auto">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={`w-full px-2.5 py-1 text-left text-[11px] transition-colors ${
                opt === value
                  ? "bg-blue-600 text-white font-medium"
                  : "text-zinc-700 hover:bg-blue-50"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
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
        className={`${className} w-full rounded border border-zinc-300 bg-white px-1 outline-none focus:border-blue-500`}
      />
    );
  }

  return (
    <div
      onClick={startEdit}
      title={editable ? "Double-click to edit" : undefined}
      className={`${className} select-none rounded px-0.5 ${
        editable ? "cursor-text hover:bg-zinc-100/80" : ""
      }`}
    >
      {value || <span className="italic opacity-50">{placeholder}</span>}
    </div>
  );
}

// ── Editable Inline (for glass/header/buttons) ─────────────────────────

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
  fallback: EventFiltersConfig
): EventFiltersConfig {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = window.localStorage.getItem(key);
    if (!stored) return fallback;
    const parsed = JSON.parse(stored) as Partial<EventFiltersConfig>;
    return { ...fallback, ...parsed };
  } catch {
    return fallback;
  }
}
