"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { RECENTLY_RESTORED_ROWS } from "../data";
import type { RecentlyRestoredRow } from "../types";

export interface RecentlyRestoredCardConfig {
  title: string;
  columns: {
    num: string;
    feeder: string;
    restoredTime: string;
    outageDuration: string;
    remarks: string;
  };
  rows: RecentlyRestoredRow[];
}

const DEFAULT_CONFIG: RecentlyRestoredCardConfig = {
  title: "Recently Restored Feeders (Last 10)",
  columns: {
    num: "#",
    feeder: "Feeder",
    restoredTime: "Restored Time",
    outageDuration: "Outage Duration",
    remarks: "Remarks",
  },
  rows: RECENTLY_RESTORED_ROWS,
};

export function RecentlyRestoredCard({
  defaultConfig = DEFAULT_CONFIG,
  storageKey = "outage.recentlyrestored.v2",
  editable = true,
  derivedRows,
}: {
  defaultConfig?: RecentlyRestoredCardConfig;
  storageKey?: string;
  editable?: boolean;
  /** Rows rebuilt from the filtered outages by a dashboard template. */
  derivedRows?: RecentlyRestoredRow[];
}) {
  const [config, setConfig] = useState<RecentlyRestoredCardConfig>(() => {
    if (typeof window === "undefined") return defaultConfig;
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (!stored) return defaultConfig;
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return { ...defaultConfig, rows: parsed };
      }
      return { ...defaultConfig, ...parsed };
    } catch {
      return defaultConfig;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(config));
    } catch {
      // ignore
    }
  }, [config, storageKey]);

  function patchTitle(title: string) {
    setConfig((prev) => ({ ...prev, title }));
  }

  function patchColumn(colKey: keyof RecentlyRestoredCardConfig["columns"], val: string) {
    setConfig((prev) => ({
      ...prev,
      columns: { ...prev.columns, [colKey]: val },
    }));
  }

  function patchRow(id: string, changes: Partial<RecentlyRestoredRow>) {
    setConfig((prev) => ({
      ...prev,
      rows: prev.rows.map((r) => (r.id === id ? { ...r, ...changes } : r)),
    }));
  }

  function addRow() {
    const id = `rec-${Date.now().toString(36)}`;
    setConfig((prev) => ({
      ...prev,
      rows: [
        ...prev.rows,
        {
          id,
          num: prev.rows.length + 1,
          feeder: `Feeder 0${prev.rows.length + 1}`,
          restoredTime: "09-Sep-2026 05:15",
          outageDuration: "0 h 35 m",
          remarks: "Supply restored",
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

  function resetToDefault() {
    setConfig(defaultConfig);
  }

  const displayRows = derivedRows ?? config.rows;

  return (
    <section className="flex flex-col overflow-hidden rounded-lg border border-blue-200 bg-white shadow-xs">
      <header className="group/header flex items-center justify-between border-b border-blue-200 bg-blue-600 px-2.5 py-1.5 text-white">
        <div className="flex items-center gap-1.5 min-w-0">
          <EditableText
            value={config.title}
            onChange={patchTitle}
            editable={editable}
            className="text-[11.5px] font-bold tracking-tight text-white whitespace-nowrap"
          />
        </div>
        {editable && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={resetToDefault}
              title="Reset to default"
              className="rounded px-1 py-0.5 text-[9px] text-white/80 hover:bg-white/15 hover:text-white"
            >
              ↻
            </button>
            <button
              type="button"
              onClick={addRow}
              className="rounded border border-white/50 px-1.5 py-0.5 text-[9.5px] font-medium text-white hover:bg-white/20 active:scale-95"
            >
              + Row
            </button>
          </div>
        )}
      </header>

      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-left text-[10.5px] border-collapse whitespace-nowrap">
          <thead>
            <tr className="border-b border-blue-100 bg-blue-50/70 font-semibold text-blue-950 text-[10px] whitespace-nowrap">
              <th className="py-1 px-1.5 w-6 text-center whitespace-nowrap">
                <EditableText
                  value={config.columns.num}
                  onChange={(v) => patchColumn("num", v)}
                  editable={editable}
                />
              </th>
              <th className="py-1 px-2 whitespace-nowrap">
                <EditableText
                  value={config.columns.feeder}
                  onChange={(v) => patchColumn("feeder", v)}
                  editable={editable}
                />
              </th>
              <th className="py-1 px-2 whitespace-nowrap">
                <EditableText
                  value={config.columns.restoredTime}
                  onChange={(v) => patchColumn("restoredTime", v)}
                  editable={editable}
                />
              </th>
              <th className="py-1 px-2 text-center whitespace-nowrap">
                <EditableText
                  value={config.columns.outageDuration}
                  onChange={(v) => patchColumn("outageDuration", v)}
                  editable={editable}
                />
              </th>
              <th className="py-1 px-2 whitespace-nowrap">
                <EditableText
                  value={config.columns.remarks}
                  onChange={(v) => patchColumn("remarks", v)}
                  editable={editable}
                />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-zinc-800">
            {derivedRows && derivedRows.length === 0 && (
              <tr>
                <td colSpan={12} className="py-5 text-center text-[11px] text-zinc-400">
                  No outages match the current filters.
                </td>
              </tr>
            )}
            {displayRows.map((row, idx) => (
              <tr
                key={row.id}
                className="group/row hover:bg-blue-50/40 transition-colors whitespace-nowrap"
              >
                <td className="py-1 px-1.5 text-center text-zinc-400 relative whitespace-nowrap">
                  {idx + 1}
                  {editable && (
                    <button
                      type="button"
                      onClick={() => removeRow(row.id)}
                      title="Remove row"
                      className="absolute -left-1 top-1 hidden h-3.5 w-3.5 items-center justify-center rounded-full bg-red-600 text-white shadow group-hover/row:flex text-[8px] z-10"
                    >
                      ×
                    </button>
                  )}
                </td>
                <td className="py-1 px-2 font-semibold text-blue-950 whitespace-nowrap">
                  <EditableText
                    value={row.feeder}
                    onChange={(v) => patchRow(row.id, { feeder: v })}
                    editable={editable}
                  />
                </td>
                <td className="py-1 px-2 text-zinc-700 font-mono text-[9.5px] whitespace-nowrap">
                  <EditableText
                    value={row.restoredTime}
                    onChange={(v) => patchRow(row.id, { restoredTime: v })}
                    editable={editable}
                  />
                </td>
                <td className="py-1 px-2 text-center font-medium text-zinc-800 whitespace-nowrap">
                  <EditableText
                    value={row.outageDuration}
                    onChange={(v) => patchRow(row.id, { outageDuration: v })}
                    editable={editable}
                  />
                </td>
                <td className="py-1 px-2 text-zinc-600 whitespace-nowrap">
                  <EditableText
                    value={row.remarks}
                    onChange={(v) => patchRow(row.id, { remarks: v })}
                    editable={editable}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function EditableText({
  value,
  onChange,
  editable,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  editable: boolean;
  className?: string;
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
        className={`rounded border border-blue-400 bg-white px-1 outline-none text-[10.5px] text-zinc-900 shadow-xs ${className}`}
      />
    );
  }

  return (
    <span
      onClick={startEdit}
      title={editable ? "Double-click to edit" : undefined}
      className={`inline-block rounded px-0.5 select-none ${
        editable ? "cursor-text hover:bg-blue-100/60" : ""
      } ${className}`}
    >
      {value || "—"}
    </span>
  );
}
