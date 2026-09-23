"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {
  DEFAULT_SELECTED_EVENT_DETAILS,
  type DetailFieldRow,
  type EventPriority,
  type SelectedEventDetailsConfig,
} from "./types";

// ── Props ─────────────────────────────────────────────────────────────

interface SelectedEventDetailsCardProps {
  /** Initial configuration; used on first render if nothing in storage. */
  defaultConfig?: SelectedEventDetailsConfig;
  /** Storage key for localStorage persistence. */
  storageKey?: string;
  /** Disable inline editing to lock into pure view mode. */
  editable?: boolean;
  /** Callback fired whenever config changes. */
  onChange?: (config: SelectedEventDetailsConfig) => void;
}

/**
 * Fully-customizable and editable Selected Event Details widget component.
 *
 * - Double-click title, row labels, or row values to edit inline.
 * - Supports Priority badges (CRITICAL, WARNING, INFO) with one-click toggling.
 * - Supports Quality formatting (Good = green, etc.).
 * - Hover row to delete or toggle badge mode.
 * - Header '+' button to add new detail rows.
 * - Full localStorage persistence.
 */
export function SelectedEventDetailsCard({
  defaultConfig = DEFAULT_SELECTED_EVENT_DETAILS,
  storageKey = "widget.selecteddetails.v1",
  editable = true,
  onChange,
}: SelectedEventDetailsCardProps) {
  const [config, setConfig] = useState<SelectedEventDetailsConfig>(() =>
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

  function patch<K extends keyof SelectedEventDetailsConfig>(
    key: K,
    value: SelectedEventDetailsConfig[K]
  ) {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }

  function patchRow(id: string, changes: Partial<DetailFieldRow>) {
    setConfig((prev) => ({
      ...prev,
      rows: prev.rows.map((r) => (r.id === id ? { ...r, ...changes } : r)),
    }));
  }

  function addRow() {
    const id = `row-${Date.now().toString(36)}`;
    setConfig((prev) => ({
      ...prev,
      rows: [
        ...prev.rows,
        {
          id,
          label: "New Property",
          value: "Value",
        },
      ],
    }));
  }

  function removeRow(id: string) {
    setConfig((prev) => ({
      ...prev,
      rows: prev.rows.filter((r) => r.id !== id),
    }));
  }

  function toggleBadgeMode(id: string) {
    setConfig((prev) => ({
      ...prev,
      rows: prev.rows.map((r) => {
        if (r.id !== id) return r;
        if (!r.badge) {
          return { ...r, badge: "CRITICAL", value: "CRITICAL" };
        }
        if (r.badge === "CRITICAL") return { ...r, badge: "WARNING", value: "WARNING" };
        if (r.badge === "WARNING") return { ...r, badge: "INFO", value: "INFO" };
        return { ...r, badge: undefined, value: "Normal" };
      }),
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
      <header className="group/header relative flex items-center gap-2 border-b border-blue-200 bg-blue-600 px-3 py-2">
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
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        </div>

        <h2 className="flex-1 text-[13px] font-semibold text-white">
          <Editable
            value={config.title}
            onChange={(v) => patch("title", v || "Selected Event Details")}
            editable={editable}
            placeholder="Selected Event Details"
            dark={false}
          />
        </h2>

        {/* Add Row Button */}
        {editable && (
          <button
            type="button"
            onClick={addRow}
            title="Add detail row"
            aria-label="Add detail row"
            className="flex h-6 items-center gap-1 rounded border border-dashed border-white/50 px-2 text-[11px] font-medium text-white hover:border-white hover:bg-white/15 transition-colors"
          >
            <svg
              viewBox="0 0 16 16"
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <line x1="8" y1="2" x2="8" y2="14" />
              <line x1="2" y1="8" x2="14" y2="8" />
            </svg>
            <span>Row</span>
          </button>
        )}

        {/* Reset card button — visible on focus/hover */}
        {editable && (
          <button
            type="button"
            onClick={reset}
            title="Reset details card to defaults"
            className="absolute -bottom-2.5 right-3 rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-semibold text-zinc-600 opacity-0 shadow transition-opacity group-focus-within/header:opacity-100 hover:!opacity-100 hover:bg-white z-10"
          >
            Reset card
          </button>
        )}
      </header>

      {/* ── Body: Divided List Rows ── */}
      <div className="divide-y divide-blue-100/70 text-[11px]">
        {config.rows.map((row) => (
          <div
            key={row.id}
            className="group/row relative flex items-start gap-2 px-3 py-1.5 transition-colors hover:bg-blue-50/40"
          >
            {/* Label */}
            <span className="w-[42%] shrink-0 font-medium text-blue-950">
              <EditableBlock
                value={row.label}
                onChange={(v) => patchRow(row.id, { label: v || row.label })}
                editable={editable}
                placeholder="Property label"
                className="font-medium text-blue-950"
              />
            </span>

            {/* Value */}
            <div className="min-w-0 flex-1">
              {row.badge ? (
                <div className="flex items-center gap-1.5">
                  <span
                    onClick={() => editable && toggleBadgeMode(row.id)}
                    title={editable ? "Click to cycle priority" : undefined}
                    className={`inline-flex items-center rounded px-2 py-0.5 text-[9.5px] font-bold tracking-wide shadow-xs ${
                      editable ? "cursor-pointer hover:opacity-90" : ""
                    } ${
                      row.badge === "CRITICAL"
                        ? "bg-red-600 text-white"
                        : row.badge === "WARNING"
                        ? "bg-amber-400 text-zinc-900"
                        : "bg-blue-500 text-white"
                    }`}
                  >
                    {row.badge}
                  </span>
                </div>
              ) : row.isQuality || row.label.toLowerCase().includes("quality") ? (
                <div className="text-emerald-600 font-semibold">
                  <EditableBlock
                    value={row.value}
                    onChange={(v) => patchRow(row.id, { value: v || "Good" })}
                    editable={editable}
                    placeholder="Quality status"
                    className="text-emerald-600 font-semibold"
                  />
                </div>
              ) : (
                <EditableBlock
                  value={row.value}
                  onChange={(v) => patchRow(row.id, { value: v || "—" })}
                  editable={editable}
                  placeholder="Value"
                  multiline={row.value.includes("\n") || row.label === "Remarks"}
                  className="text-blue-900 whitespace-pre-line"
                />
              )}
            </div>

            {/* Row Hover Actions */}
            {editable && (
              <div className="absolute right-2 top-1.5 flex items-center gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity bg-white/90 backdrop-blur-xs px-1 rounded shadow-xs">
                <button
                  type="button"
                  onClick={() => toggleBadgeMode(row.id)}
                  title={row.badge ? "Cycle / remove priority badge" : "Add priority badge"}
                  className="rounded px-1 py-0.2 text-[8px] font-bold uppercase bg-blue-50 text-blue-700 hover:bg-blue-100"
                >
                  {row.badge ? "Badge" : "+ Badge"}
                </button>
                <button
                  type="button"
                  onClick={() => removeRow(row.id)}
                  title="Remove row"
                  aria-label="Remove row"
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

        {config.rows.length === 0 && (
          <p className="px-4 py-6 text-center text-[11px] text-zinc-400">
            No detail rows.{editable ? " Click '+ Row' above to add one." : ""}
          </p>
        )}
      </div>
    </section>
  );
}

// ── EditableBlock ─────────────────────────────────────────────────────

interface EditableBlockProps {
  value: string;
  onChange: (value: string) => void;
  editable: boolean;
  placeholder: string;
  className: string;
  multiline?: boolean;
}

function EditableBlock({
  value,
  onChange,
  editable,
  placeholder,
  className,
  multiline = false,
}: EditableBlockProps) {
  const [session, setSession] = useState<number | null>(null);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const committed = useRef(false);
  const editing = session !== null;

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
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

  function onKey(e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
    if (e.key === "Enter" && !multiline) {
      e.preventDefault();
      commit();
    } else if (e.key === "Escape") {
      committed.current = true;
      setSession(null);
    }
  }

  if (editing) {
    if (multiline) {
      return (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={onKey}
          rows={2}
          placeholder={placeholder}
          className={`${className} w-full rounded border border-blue-300 bg-white px-1 py-0.5 outline-none focus:border-blue-500`}
        />
      );
    }

    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
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
    inputRef.current?.select();
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
  fallback: SelectedEventDetailsConfig
): SelectedEventDetailsConfig {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = window.localStorage.getItem(key);
    if (!stored) return fallback;
    const parsed = JSON.parse(stored) as Partial<SelectedEventDetailsConfig>;
    return { ...fallback, ...parsed };
  } catch {
    return fallback;
  }
}
