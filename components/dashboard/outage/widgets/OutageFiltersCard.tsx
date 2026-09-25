"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { DEFAULT_OUTAGE_FILTERS } from "../data";
import type { OutageFiltersConfig } from "../types";

export function OutageFiltersCard({
  defaultConfig = DEFAULT_OUTAGE_FILTERS,
  storageKey = "outage.filters.v1",
  editable = true,
  onApply,
  onReset,
}: {
  defaultConfig?: OutageFiltersConfig;
  storageKey?: string;
  editable?: boolean;
  onApply?: (filters: OutageFiltersConfig) => void;
  onReset?: () => void;
}) {
  const [config, setConfig] = useState<OutageFiltersConfig>(() => {
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

  function patch<K extends keyof OutageFiltersConfig>(
    key: K,
    val: OutageFiltersConfig[K]
  ) {
    setConfig((prev) => ({ ...prev, [key]: val }));
  }

  /**
   * Clears what the user selected, leaving edited labels and option lists
   * alone — each dropdown returns to its own first option, the "All …"
   * sentinel.
   */
  function handleResetSelections() {
    setConfig((prev) => ({
      ...prev,
      pssValue: prev.pssOptions[0] ?? prev.pssValue,
      feederValue: prev.feederOptions[0] ?? prev.feederValue,
      statusValue: prev.statusOptions[0] ?? prev.statusValue,
      tripCauseValue: prev.tripCauseOptions[0] ?? prev.tripCauseValue,
      dateFromValue: defaultConfig.dateFromValue,
      dateToValue: defaultConfig.dateToValue,
    }));
    onReset?.();
  }

  return (
    <section className="overflow-visible rounded-lg border border-blue-200 bg-white shadow-xs">
      <header className="flex items-center justify-between border-b border-blue-200 bg-blue-600 px-3 py-1.5 text-white">
        <EditableText
          value={config.title}
          onChange={(v) => patch("title", v)}
          editable={editable}
          className="text-[12px] font-bold tracking-tight text-white"
        />
      </header>

      <div className="p-3 text-[11px] space-y-2.5">
        {/* Date Range */}
        <div>
          <label className="block font-medium text-blue-950 mb-1 text-[10.5px]">
            <EditableText
              value={config.dateRangeLabel}
              onChange={(v) => patch("dateRangeLabel", v)}
              editable={editable}
            />
          </label>
          <div className="flex items-center gap-1.5">
            <DateInputBox
              value={config.dateFromValue}
              onChange={(v) => patch("dateFromValue", v)}
              editable={editable}
            />
            <span className="text-[10px] text-zinc-500 font-medium">to</span>
            <DateInputBox
              value={config.dateToValue}
              onChange={(v) => patch("dateToValue", v)}
              editable={editable}
            />
          </div>
        </div>

        {/* PSS */}
        <FilterRow
          label={
            <EditableText
              value={config.pssLabel}
              onChange={(v) => patch("pssLabel", v)}
              editable={editable}
            />
          }
        >
          <SelectBox
            value={config.pssValue}
            options={config.pssOptions}
            onChange={(v) => patch("pssValue", v)}
          />
        </FilterRow>

        {/* Feeder */}
        <FilterRow
          label={
            <EditableText
              value={config.feederLabel}
              onChange={(v) => patch("feederLabel", v)}
              editable={editable}
            />
          }
        >
          <SelectBox
            value={config.feederValue}
            options={config.feederOptions}
            onChange={(v) => patch("feederValue", v)}
          />
        </FilterRow>

        {/* Status */}
        <FilterRow
          label={
            <EditableText
              value={config.statusLabel}
              onChange={(v) => patch("statusLabel", v)}
              editable={editable}
            />
          }
        >
          <SelectBox
            value={config.statusValue}
            options={config.statusOptions}
            onChange={(v) => patch("statusValue", v)}
          />
        </FilterRow>

        {/* Trip Cause */}
        <FilterRow
          label={
            <EditableText
              value={config.tripCauseLabel}
              onChange={(v) => patch("tripCauseLabel", v)}
              editable={editable}
            />
          }
        >
          <SelectBox
            value={config.tripCauseValue}
            options={config.tripCauseOptions}
            onChange={(v) => patch("tripCauseValue", v)}
          />
        </FilterRow>

        {/* Action Buttons */}
        <div className="grid grid-cols-[1fr_auto] gap-2 pt-1.5">
          <button
            type="button"
            onClick={() => onApply?.(config)}
            className="flex items-center justify-center gap-1.5 rounded-md bg-blue-600 py-1.5 px-3 text-[11px] font-semibold text-white shadow-xs hover:bg-blue-700 active:scale-[0.98] cursor-pointer"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span>{config.applyButtonLabel}</span>
          </button>

          <button
            type="button"
            onClick={handleResetSelections}
            className="flex items-center justify-center gap-1 rounded-md border border-blue-200 bg-blue-50/70 py-1.5 px-3 text-[11px] font-semibold text-blue-900 shadow-xs hover:bg-blue-100 cursor-pointer"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            <span>{config.resetButtonLabel}</span>
          </button>
        </div>
      </div>
    </section>
  );
}

function FilterRow({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-18 shrink-0 text-[10.5px] font-medium text-blue-950">
        {label}
      </span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function DateInputBox({
  value,
  onChange,
  editable,
}: {
  value: string;
  onChange: (v: string) => void;
  editable: boolean;
}) {
  return (
    <div className="flex flex-1 items-center justify-between rounded-md border border-blue-200/80 bg-white px-2 py-1 shadow-xs hover:border-blue-400">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        readOnly={!editable}
        className="w-full bg-transparent text-[10.5px] text-zinc-800 outline-none"
      />
      <svg
        viewBox="0 0 24 24"
        className="h-3.5 w-3.5 text-blue-600 shrink-0 ml-1"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    </div>
  );
}

function SelectBox({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function onPointer(e: PointerEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointer, true);
    return () => document.removeEventListener("pointerdown", onPointer, true);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-md border border-blue-200/80 bg-white px-2 py-1 text-left shadow-xs hover:border-blue-400"
      >
        <span className="truncate text-[10.5px] text-zinc-800">
          {value || options[0]}
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
              className={`w-full px-2.5 py-1 text-left text-[10.5px] ${
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
