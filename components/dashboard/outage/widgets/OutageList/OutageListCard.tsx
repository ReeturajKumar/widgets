"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {
  DEFAULT_OUTAGE_LIST,
  type BreakerStatus,
  type OutageListConfig,
  type OutageRowConfig,
  type OutageStatus,
} from "./types";

interface OutageListProps {
  /** Initial configuration shape; used on first render if nothing in storage. */
  defaultConfig?: OutageListConfig;
  /** Storage key for localStorage persistence. */
  storageKey?: string;
  /** Disable inline editing to lock into pure view mode. */
  editable?: boolean;
  /** Callback fired whenever the active selected row changes. */
  onSelectRow?: (row: OutageRowConfig) => void;
  /** Callback fired whenever configuration changes. */
  onChange?: (config: OutageListConfig) => void;
}

/**
 * Fully-customizable, compact, and editable Outage List table widget.
 *
 * - Double-click title, subtitle, column headers, and all table cells to edit inline.
 * - Single-click Breaker Status or Status badge to cycle states.
 * - Header '+ Outage' button to add new records.
 * - Row hover '×' button to delete records.
 * - Full localStorage persistence.
 */
export function OutageListCard({
  defaultConfig = DEFAULT_OUTAGE_LIST,
  storageKey = "outage.list.v2",
  editable = true,
  onSelectRow,
  onChange,
}: OutageListProps) {
  const [config, setConfig] = useState<OutageListConfig>(() =>
    loadConfig(storageKey, defaultConfig)
  );
  const [selectedId, setSelectedId] = useState<string>(config.rows[0]?.id || "");
  const [search, setSearch] = useState("");

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(config));
    } catch {
      // storage disabled / full
    }
    onChange?.(config);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, storageKey]);

  const activeCount = config.rows.filter(
    (r) => r.status === "Active" || r.status === "Critical"
  ).length;
  const restoredCount = config.rows.filter((r) => r.status === "Restored").length;

  const filteredRows = config.rows.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.pss.toLowerCase().includes(q) ||
      r.feeder.toLowerCase().includes(q) ||
      r.tripCause.toLowerCase().includes(q) ||
      r.operatorRemarks.toLowerCase().includes(q) ||
      r.status.toLowerCase().includes(q)
    );
  });

  function patch<K extends keyof OutageListConfig>(
    key: K,
    val: OutageListConfig[K]
  ) {
    setConfig((prev) => ({ ...prev, [key]: val }));
  }

  function patchColumn(key: string, label: string) {
    setConfig((prev) => ({
      ...prev,
      columns: prev.columns.map((c) => (c.key === key ? { ...c, label } : c)),
    }));
  }

  function patchRow(id: string, changes: Partial<OutageRowConfig>) {
    setConfig((prev) => ({
      ...prev,
      rows: prev.rows.map((r) => (r.id === id ? { ...r, ...changes } : r)),
    }));
  }

  function addRow() {
    const id = `out-${Date.now().toString(36)}`;
    const now = new Date();
    const timeStr = `09-Sep-2026 ${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;

    const newRow: OutageRowConfig = {
      id,
      num: String(config.rows.length + 1),
      pss: "KANKANPURA PSS",
      feeder: "Feeder 07",
      outageStart: timeStr,
      outageEnd: "—",
      outageDuration: "0 h 05 m",
      breakerStatus: "Tripped",
      tripCause: "Overcurrent",
      restorationTime: "—",
      operatorRemarks: "New outage reported",
      status: "Active",
    };

    setConfig((prev) => ({
      ...prev,
      rows: [newRow, ...prev.rows],
    }));
    setSelectedId(id);
    onSelectRow?.(newRow);
  }

  function removeRow(id: string) {
    setConfig((prev) => ({
      ...prev,
      rows: prev.rows.filter((r) => r.id !== id),
    }));
  }

  function cycleStatus(id: string) {
    const sequence: OutageStatus[] = ["Active", "Restored", "Critical"];
    setConfig((prev) => ({
      ...prev,
      rows: prev.rows.map((r) => {
        if (r.id !== id) return r;
        const nextIdx = (sequence.indexOf(r.status) + 1) % sequence.length;
        return { ...r, status: sequence[nextIdx] };
      }),
    }));
  }

  function cycleBreaker(id: string) {
    const sequence: BreakerStatus[] = ["Tripped", "Open", "Closed"];
    setConfig((prev) => ({
      ...prev,
      rows: prev.rows.map((r) => {
        if (r.id !== id) return r;
        const nextIdx = (sequence.indexOf(r.breakerStatus) + 1) % sequence.length;
        return { ...r, breakerStatus: sequence[nextIdx] };
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
      <header className="group/header relative flex flex-wrap items-center justify-between gap-2 border-b border-blue-200 bg-blue-600 px-3 py-1.5 text-white">
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-white/20 text-white">
            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor">
              <path d="M4 4h16l-6 8v6l-4 2v-8Z" />
            </svg>
          </div>

          <div className="flex items-baseline gap-1.5">
            <h2 className="text-[12.5px] font-bold tracking-tight text-white">
              <Editable
                value={config.title}
                onChange={(v) => patch("title", v || "Outage List / Active & Recent Outages")}
                editable={editable}
                placeholder="Outage List"
                dark={false}
              />
            </h2>
            <span className="text-[10.5px] text-blue-100 font-normal">
              <Editable
                value={config.subtitle}
                onChange={(v) => patch("subtitle", v || "")}
                editable={editable}
                placeholder="(Latest First)"
                dark={false}
              />
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[10.5px]">
          {/* Quick Header Stats */}
          <div className="font-semibold text-blue-100 flex items-center gap-1.5 bg-white/10 px-2 py-0.5 rounded">
            <span>Total: {config.rows.length}</span>
            <span>|</span>
            <span className="text-red-200">Active: {activeCount}</span>
            <span>|</span>
            <span className="text-emerald-200">Restored: {restoredCount}</span>
          </div>

          {/* Quick Search */}
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-24 focus:w-36 transition-all rounded bg-white/15 px-1.5 py-0.5 text-[10px] text-white placeholder:text-blue-200 outline-none border border-white/20 focus:border-white focus:bg-white/25"
            />
          </div>

          {/* Add Row Button */}
          {editable && (
            <button
              type="button"
              onClick={addRow}
              title="Add outage record"
              aria-label="Add outage record"
              className="flex h-5 items-center gap-1 rounded border border-dashed border-white/50 px-1.5 text-[10px] font-bold text-white hover:border-white hover:bg-white/15 transition-colors cursor-pointer"
            >
              <svg viewBox="0 0 16 16" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="8" y1="2" x2="8" y2="14" />
                <line x1="2" y1="8" x2="14" y2="8" />
              </svg>
              <span>+ Outage</span>
            </button>
          )}

          {/* Reset button — hover */}
          {editable && (
            <button
              type="button"
              onClick={reset}
              title="Reset table to defaults"
              className="absolute -bottom-2.5 right-3 rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-semibold text-zinc-600 opacity-0 shadow transition-opacity group-focus-within/header:opacity-100 hover:!opacity-100 hover:bg-white z-10 cursor-pointer"
            >
              Reset list
            </button>
          )}
        </div>
      </header>

      {/* ── Compact Table Container ── */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[10.5px] border-collapse">
          <thead>
            <tr className="border-b border-blue-100 bg-blue-50/60 font-semibold text-blue-950 text-[10px] whitespace-nowrap">
              {config.columns.map((col) => (
                <th
                  key={col.key}
                  className={`py-1.5 px-2 select-none whitespace-nowrap ${
                    col.key === "num"
                      ? "w-7 text-center"
                      : col.key === "status"
                      ? "w-20 text-center"
                      : ""
                  }`}
                >
                  <Editable
                    value={col.label}
                    onChange={(v) => patchColumn(col.key, v || col.label)}
                    editable={editable}
                    placeholder={col.label}
                    dark={true}
                  />
                  {col.key === "outageStart" && (
                    <span className="text-blue-600 font-bold ml-0.5">↓</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200/50 text-zinc-800 whitespace-nowrap">
            {filteredRows.map((row, idx) => {
              const isSelected = row.id === selectedId;
              return (
                <tr
                  key={row.id}
                  onClick={() => {
                    setSelectedId(row.id);
                    onSelectRow?.(row);
                  }}
                  className={`group/row cursor-pointer transition-colors whitespace-nowrap ${
                    isSelected
                      ? "bg-blue-50/80 font-medium"
                      : idx % 2 === 0
                      ? "bg-white hover:bg-zinc-50/80"
                      : "bg-zinc-50/30 hover:bg-zinc-50/80"
                  }`}
                >
                  {/* # Number */}
                  <td className="py-1 px-2 text-center text-zinc-400 text-[9.5px] relative whitespace-nowrap">
                    <EditableCell
                      value={row.num || String(idx + 1)}
                      onChange={(v) => patchRow(row.id, { num: v })}
                      editable={editable}
                    />
                    {editable && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeRow(row.id);
                        }}
                        title="Remove row"
                        aria-label="Remove row"
                        className="absolute -left-1 top-1 hidden h-3.5 w-3.5 items-center justify-center rounded-full bg-red-600 text-white shadow hover:bg-red-700 group-hover/row:flex cursor-pointer"
                      >
                        <svg viewBox="0 0 16 16" className="h-2 w-2" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <line x1="4" y1="4" x2="12" y2="12" />
                          <line x1="12" y1="4" x2="4" y2="12" />
                        </svg>
                      </button>
                    )}
                  </td>

                  {/* PSS */}
                  <td className="py-1 px-2 font-medium text-blue-950 whitespace-nowrap">
                    <EditableCell
                      value={row.pss}
                      onChange={(v) => patchRow(row.id, { pss: v })}
                      editable={editable}
                    />
                  </td>

                  {/* Feeder */}
                  <td className="py-1 px-2 font-semibold text-blue-900 whitespace-nowrap">
                    <EditableCell
                      value={row.feeder}
                      onChange={(v) => patchRow(row.id, { feeder: v })}
                      editable={editable}
                    />
                  </td>

                  {/* Outage Start */}
                  <td className="py-1 px-2 text-zinc-700 font-mono text-[9.5px] whitespace-nowrap">
                    <EditableCell
                      value={row.outageStart}
                      onChange={(v) => patchRow(row.id, { outageStart: v })}
                      editable={editable}
                    />
                  </td>

                  {/* Outage End */}
                  <td className="py-1 px-2 text-zinc-600 font-mono text-[9.5px] whitespace-nowrap">
                    <EditableCell
                      value={row.outageEnd}
                      onChange={(v) => patchRow(row.id, { outageEnd: v })}
                      editable={editable}
                    />
                  </td>

                  {/* Outage Duration */}
                  <td className="py-1 px-2 font-medium text-zinc-800 whitespace-nowrap">
                    <EditableCell
                      value={row.outageDuration}
                      onChange={(v) => patchRow(row.id, { outageDuration: v })}
                      editable={editable}
                    />
                  </td>

                  {/* Breaker Status */}
                  <td className="py-1 px-2 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (editable) cycleBreaker(row.id);
                      }}
                      className={`font-semibold cursor-pointer whitespace-nowrap ${
                        row.breakerStatus === "Tripped"
                          ? "text-red-600 font-bold"
                          : row.breakerStatus === "Open"
                          ? "text-amber-600 font-semibold"
                          : "text-emerald-600"
                      }`}
                      title={editable ? "Click to toggle breaker state" : undefined}
                    >
                      {row.breakerStatus}
                    </button>
                  </td>

                  {/* Trip Cause */}
                  <td className="py-1 px-2 text-zinc-700 whitespace-nowrap">
                    <EditableCell
                      value={row.tripCause}
                      onChange={(v) => patchRow(row.id, { tripCause: v })}
                      editable={editable}
                    />
                  </td>

                  {/* Restoration Time */}
                  <td className="py-1 px-2 text-zinc-600 font-mono text-[9.5px] whitespace-nowrap">
                    <EditableCell
                      value={row.restorationTime}
                      onChange={(v) => patchRow(row.id, { restorationTime: v })}
                      editable={editable}
                    />
                  </td>

                  {/* Operator Remarks */}
                  <td className="py-1 px-2 text-zinc-600 whitespace-nowrap">
                    <EditableCell
                      value={row.operatorRemarks}
                      onChange={(v) => patchRow(row.id, { operatorRemarks: v })}
                      editable={editable}
                    />
                  </td>

                  {/* Status Badge */}
                  <td className="py-1 px-2 text-center whitespace-nowrap">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (editable) cycleStatus(row.id);
                      }}
                      className={`inline-flex items-center justify-center rounded px-2 py-0.5 text-[9px] font-bold text-white shadow-xs cursor-pointer whitespace-nowrap ${
                        row.status === "Active"
                          ? "bg-red-600"
                          : row.status === "Critical"
                          ? "bg-red-700"
                          : "bg-emerald-600"
                      }`}
                      title={editable ? "Click to toggle status" : undefined}
                    >
                      {row.status}
                    </button>
                  </td>
                </tr>
              );
            })}

            {filteredRows.length === 0 && (
              <tr>
                <td
                  colSpan={config.columns.length}
                  className="py-4 text-center text-zinc-400 text-[10.5px]"
                >
                  No outage records match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ── EditableCell ──────────────────────────────────────────────────────

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
        className="w-full rounded border border-blue-400 bg-white px-0.5 outline-none text-[10.5px]"
      />
    );
  }

  return (
    <span
      onClick={startEdit}
      title={editable ? "Double-click to edit" : undefined}
      className={`rounded px-0.5 select-none ${
        editable ? "cursor-text hover:bg-blue-100/40" : ""
      }`}
    >
      {value || "—"}
    </span>
  );
}

// ── Editable Inline (Header / Columns) ────────────────────────────────

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
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  if (!editable) {
    return <span>{value || placeholder}</span>;
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          setEditing(false);
          if (draft !== value) onChange(draft);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            setEditing(false);
            if (draft !== value) onChange(draft);
          } else if (e.key === "Escape") {
            setEditing(false);
          }
        }}
        className={`rounded border px-1 text-inherit outline-none ${
          dark
            ? "border-blue-300 bg-white text-blue-950 focus:border-blue-500"
            : "border-white/40 bg-white/10 focus:border-white text-white"
        }`}
        style={{ width: `${Math.max(draft.length + 1, 4)}ch` }}
      />
    );
  }

  return (
    <span
      onDoubleClick={(event) => {
        event.stopPropagation();
        setDraft(value);
        setEditing(true);
      }}
      title="Double-click to edit"
      className={`cursor-text rounded px-0.5 ${
        dark ? "hover:bg-blue-100/60" : "hover:bg-white/20"
      } ${!value ? "italic opacity-60" : ""}`}
    >
      {value || placeholder || " "}
    </span>
  );
}

function loadConfig(
  key: string,
  fallback: OutageListConfig
): OutageListConfig {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = window.localStorage.getItem(key);
    if (!stored) return fallback;
    const parsed = JSON.parse(stored) as Partial<OutageListConfig>;
    return { ...fallback, ...parsed };
  } catch {
    return fallback;
  }
}
