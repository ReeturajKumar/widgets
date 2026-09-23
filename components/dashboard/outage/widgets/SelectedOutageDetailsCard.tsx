"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { DEFAULT_SELECTED_OUTAGE_DETAILS } from "../data";
import type { OutageDetailRow, SelectedOutageDetailsConfig } from "../types";

export function SelectedOutageDetailsCard({
  defaultConfig = DEFAULT_SELECTED_OUTAGE_DETAILS,
  storageKey = "outage.selecteddetails.v1",
  editable = true,
}: {
  defaultConfig?: SelectedOutageDetailsConfig;
  storageKey?: string;
  editable?: boolean;
}) {
  const [config, setConfig] = useState<SelectedOutageDetailsConfig>(() => {
    if (typeof window === "undefined") return defaultConfig;
    try {
      const stored = window.localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : defaultConfig;
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

  function patchRow(id: string, changes: Partial<OutageDetailRow>) {
    setConfig((prev) => ({
      ...prev,
      rows: prev.rows.map((r) => (r.id === id ? { ...r, ...changes } : r)),
    }));
  }

  function addRow() {
    const id = `s-${Date.now().toString(36)}`;
    setConfig((prev) => ({
      ...prev,
      rows: [...prev.rows, { id, label: "New Property", value: "Value" }],
    }));
  }

  function removeRow(id: string) {
    setConfig((prev) => ({
      ...prev,
      rows: prev.rows.filter((r) => r.id !== id),
    }));
  }

  return (
    <section className="overflow-visible rounded-lg border border-blue-200 bg-white shadow-xs">
      <header className="group/header relative flex items-center justify-between border-b border-blue-200 bg-blue-600 px-3 py-1.5 text-white">
        <EditableBlock
          value={config.title}
          onChange={(v) => setConfig((prev) => ({ ...prev, title: v }))}
          editable={editable}
          className="text-[12px] font-bold tracking-tight text-white"
        />
        {editable && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setConfig(defaultConfig)}
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

      <div className="divide-y divide-blue-100/70 text-[11px]">
        {config.rows.map((row) => (
          <div
            key={row.id}
            className="group/row relative flex items-center gap-2 px-3 py-1.5 transition-colors hover:bg-blue-50/40"
          >
            {/* Label */}
            <span className="w-[42%] shrink-0 font-medium text-blue-950">
              <EditableBlock
                value={row.label}
                onChange={(v) => patchRow(row.id, { label: v })}
                editable={editable}
                className="font-medium text-blue-950"
              />
            </span>

            {/* Value */}
            <div className="min-w-0 flex-1">
              {row.isStatusBadge ? (
                <span className="inline-flex items-center rounded bg-red-600 px-2 py-0.5 text-[9.5px] font-bold text-white shadow-xs">
                  {row.value}
                </span>
              ) : row.isBreakerStatus ? (
                <span className="font-bold text-red-600">
                  {row.value}
                </span>
              ) : row.isDotIndicator ? (
                <div className="flex items-center gap-1 text-zinc-800 font-medium">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-xs" />
                  <EditableBlock
                    value={row.value}
                    onChange={(v) => patchRow(row.id, { value: v })}
                    editable={editable}
                    className="text-zinc-800 font-medium"
                  />
                </div>
              ) : (
                <EditableBlock
                  value={row.value}
                  onChange={(v) => patchRow(row.id, { value: v })}
                  editable={editable}
                  className="text-zinc-800"
                />
              )}
            </div>

            {/* Remove button */}
            {editable && (
              <button
                type="button"
                onClick={() => removeRow(row.id)}
                title="Remove row"
                className="absolute right-1 top-1.5 hidden h-3.5 w-3.5 items-center justify-center rounded-full bg-red-600 text-white shadow hover:bg-red-700 group-hover/row:flex text-[8px]"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function EditableBlock({
  value,
  onChange,
  editable,
  className,
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
        className={`${className} w-full rounded border border-blue-400 bg-white px-1 outline-none text-[11px]`}
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
      {value || "—"}
    </div>
  );
}
