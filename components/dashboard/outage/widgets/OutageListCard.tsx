"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { OUTAGE_ROWS } from "../data";
import type { BreakerStatus, OutageRow, OutageStatus } from "../types";

interface OutageListProps {
  defaultRows?: OutageRow[];
  storageKey?: string;
  editable?: boolean;
  onSelectRow?: (row: OutageRow) => void;
  onChange?: (rows: OutageRow[]) => void;
}

export function OutageListCard({
  defaultRows = OUTAGE_ROWS,
  storageKey = "outage.list.v1",
  editable = true,
  onSelectRow,
  onChange,
}: OutageListProps) {
  const [rows, setRows] = useState<OutageRow[]>(() =>
    loadRows(storageKey, defaultRows)
  );
  const [selectedId, setSelectedId] = useState<string>(rows[0]?.id || "");
  const [search, setSearch] = useState("");

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(rows));
    } catch {
      // ignore
    }
    onChange?.(rows);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, storageKey]);

  const activeCount = rows.filter((r) => r.status === "Active" || r.status === "Critical").length;
  const restoredCount = rows.filter((r) => r.status === "Restored").length;

  const filteredRows = rows.filter((r) => {
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

  function patchRow(id: string, changes: Partial<OutageRow>) {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...changes } : r))
    );
  }

  function addRow() {
    const id = `out-${Date.now().toString(36)}`;
    const now = new Date();
    const timeStr = `09-Sep-2026 ${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;

    const newRow: OutageRow = {
      id,
      num: rows.length + 1,
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

    setRows((prev) => [newRow, ...prev]);
    setSelectedId(id);
    onSelectRow?.(newRow);
  }

  function removeRow(id: string) {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  function cycleStatus(id: string) {
    const sequence: OutageStatus[] = ["Active", "Restored", "Critical"];
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const nextIdx = (sequence.indexOf(r.status) + 1) % sequence.length;
        return { ...r, status: sequence[nextIdx] };
      })
    );
  }

  function cycleBreaker(id: string) {
    const sequence: BreakerStatus[] = ["Tripped", "Open", "Closed"];
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const nextIdx = (sequence.indexOf(r.breakerStatus) + 1) % sequence.length;
        return { ...r, breakerStatus: sequence[nextIdx] };
      })
    );
  }

  function reset() {
    setRows(defaultRows);
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
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-white/20 text-white">
            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor">
              <path d="M4 4h16l-6 8v6l-4 2v-8Z" />
            </svg>
          </div>
          <h2 className="text-[12.5px] font-bold tracking-tight text-white">
            Outage List / Active &amp; Recent Outages (Latest First)
          </h2>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          {/* Quick Stats in header */}
          <div className="font-semibold text-blue-100 flex items-center gap-1.5">
            <span>Total Records: {rows.length}</span>
            <span>|</span>
            <span className="text-red-200">Active: {activeCount}</span>
            <span>|</span>
            <span className="text-emerald-200">Restored: {restoredCount}</span>
          </div>

          {/* Add Row Button */}
          {editable && (
            <button
              type="button"
              onClick={addRow}
              title="Add outage record"
              aria-label="Add outage record"
              className="flex h-5 items-center gap-1 rounded border border-dashed border-white/50 px-1.5 text-[10px] font-semibold text-white hover:border-white hover:bg-white/15 transition-colors"
            >
              <svg viewBox="0 0 16 16" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
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
              className="absolute -bottom-2.5 right-3 rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-semibold text-zinc-600 opacity-0 shadow transition-opacity group-focus-within/header:opacity-100 hover:!opacity-100 hover:bg-white z-10"
            >
              Reset list
            </button>
          )}
        </div>
      </header>

      {/* ── Table Container ── */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[11px] border-collapse">
          <thead>
            <tr className="border-b border-blue-100 bg-blue-50/50 font-semibold text-blue-950 text-[10.5px]">
              <th className="py-1.5 px-2 w-8 text-center">#</th>
              <th className="py-1.5 px-2 min-w-[120px]">PSS</th>
              <th className="py-1.5 px-2 min-w-[85px]">Feeder</th>
              <th className="py-1.5 px-2 min-w-[110px]">
                <span className="flex items-center gap-0.5">
                  Outage Start <span className="text-blue-600 font-bold">↓</span>
                </span>
              </th>
              <th className="py-1.5 px-2 min-w-[110px]">Outage End</th>
              <th className="py-1.5 px-2 min-w-[90px]">Outage Duration</th>
              <th className="py-1.5 px-2 min-w-[90px]">Breaker Status</th>
              <th className="py-1.5 px-2 min-w-[95px]">Trip Cause</th>
              <th className="py-1.5 px-2 min-w-[110px]">Restoration Time</th>
              <th className="py-1.5 px-2 min-w-[150px]">Operator Remarks</th>
              <th className="py-1.5 px-2 min-w-[75px] text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200/60 text-zinc-800">
            {filteredRows.map((row, idx) => {
              const isSelected = row.id === selectedId;
              return (
                <tr
                  key={row.id}
                  onClick={() => {
                    setSelectedId(row.id);
                    onSelectRow?.(row);
                  }}
                  className={`group/row cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-blue-50/80 font-medium"
                      : idx % 2 === 0
                      ? "bg-white hover:bg-zinc-50"
                      : "bg-zinc-50/40 hover:bg-zinc-50"
                  }`}
                >
                  {/* # Index */}
                  <td className="py-1.5 px-2 text-center text-zinc-500 text-[10px] relative">
                    {idx + 1}
                    {editable && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeRow(row.id);
                        }}
                        title="Remove row"
                        aria-label="Remove row"
                        className="absolute -left-1 top-1.5 hidden h-3.5 w-3.5 items-center justify-center rounded-full bg-red-600 text-white shadow hover:bg-red-700 group-hover/row:flex"
                      >
                        <svg viewBox="0 0 16 16" className="h-2 w-2" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <line x1="4" y1="4" x2="12" y2="12" />
                          <line x1="12" y1="4" x2="4" y2="12" />
                        </svg>
                      </button>
                    )}
                  </td>

                  {/* PSS */}
                  <td className="py-1.5 px-2 font-medium text-blue-950">
                    <EditableCell
                      value={row.pss}
                      onChange={(v) => patchRow(row.id, { pss: v })}
                      editable={editable}
                    />
                  </td>

                  {/* Feeder */}
                  <td className="py-1.5 px-2 text-blue-900 font-semibold">
                    <EditableCell
                      value={row.feeder}
                      onChange={(v) => patchRow(row.id, { feeder: v })}
                      editable={editable}
                    />
                  </td>

                  {/* Outage Start */}
                  <td className="py-1.5 px-2 text-zinc-700 font-mono text-[10px]">
                    <EditableCell
                      value={row.outageStart}
                      onChange={(v) => patchRow(row.id, { outageStart: v })}
                      editable={editable}
                    />
                  </td>

                  {/* Outage End */}
                  <td className="py-1.5 px-2 text-zinc-600 font-mono text-[10px]">
                    <EditableCell
                      value={row.outageEnd}
                      onChange={(v) => patchRow(row.id, { outageEnd: v })}
                      editable={editable}
                    />
                  </td>

                  {/* Outage Duration */}
                  <td className="py-1.5 px-2 font-medium text-zinc-800">
                    <EditableCell
                      value={row.outageDuration}
                      onChange={(v) => patchRow(row.id, { outageDuration: v })}
                      editable={editable}
                    />
                  </td>

                  {/* Breaker Status */}
                  <td className="py-1.5 px-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (editable) cycleBreaker(row.id);
                      }}
                      className={`font-semibold cursor-pointer ${
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
                  <td className="py-1.5 px-2 text-zinc-700">
                    <EditableCell
                      value={row.tripCause}
                      onChange={(v) => patchRow(row.id, { tripCause: v })}
                      editable={editable}
                    />
                  </td>

                  {/* Restoration Time */}
                  <td className="py-1.5 px-2 text-zinc-600 font-mono text-[10px]">
                    <EditableCell
                      value={row.restorationTime}
                      onChange={(v) => patchRow(row.id, { restorationTime: v })}
                      editable={editable}
                    />
                  </td>

                  {/* Operator Remarks */}
                  <td className="py-1.5 px-2 text-zinc-600 truncate max-w-[200px]">
                    <EditableCell
                      value={row.operatorRemarks}
                      onChange={(v) => patchRow(row.id, { operatorRemarks: v })}
                      editable={editable}
                    />
                  </td>

                  {/* Status Badge */}
                  <td className="py-1.5 px-2 text-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (editable) cycleStatus(row.id);
                      }}
                      className={`inline-flex items-center justify-center rounded px-2 py-0.5 text-[9.5px] font-bold text-white shadow-xs cursor-pointer ${
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
        className="w-full rounded border border-blue-400 bg-white px-1 outline-none text-[11px]"
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

function loadRows(key: string, fallback: OutageRow[]): OutageRow[] {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = window.localStorage.getItem(key);
    if (!stored) return fallback;
    return JSON.parse(stored);
  } catch {
    return fallback;
  }
}
