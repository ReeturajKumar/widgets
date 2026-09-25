"use client";

// In-widget filtering, shared by every SCADA list widget.
//
// Each widget filters its own rows rather than listening to a separate filter
// card, so a filter always acts on exactly the data next to it and there is no
// cross-node wiring to get out of sync.
//
// The dropdown options are derived from the rows themselves rather than from a
// hand-kept list. The rows are user-editable, so any fixed option list would
// drift away from the data the moment someone edited a cell.

import { useMemo, useState, type ReactNode } from "react";

/** Sentinel for "this field is not constrained". */
export const ALL = "__all__";

export interface FilterField<T> {
  /** Stable identity for the dropdown. */
  key: string;
  /** Shown as "All {label}" in the dropdown's first entry. */
  label: string;
  /** The comparable value for one row. */
  value: (row: T) => string;
}

export interface RowFilter<T> {
  /** Rows that pass every active constraint. */
  rows: T[];
  total: number;
  /** True when at least one constraint is set — drives the Clear button. */
  active: boolean;
  search: string;
  setSearch: (value: string) => void;
  picks: Record<string, string>;
  setPick: (key: string, value: string) => void;
  /** Distinct values per field, in the order they appear in the data. */
  options: Record<string, string[]>;
  dateFrom: string;
  setDateFrom: (value: string) => void;
  dateTo: string;
  setDateTo: (value: string) => void;
  clear: () => void;
}

const MONTHS = [
  "jan", "feb", "mar", "apr", "may", "jun",
  "jul", "aug", "sep", "oct", "nov", "dec",
];

/**
 * Parses the date formats these widgets actually contain.
 *
 * Rows carry `09-Sep-2026` (sometimes with a trailing time), while the date
 * inputs hand back `2026-09-09`. Both reduce to a UTC day so a range compares
 * cleanly; anything unrecognised returns null and is treated as "no date",
 * which never excludes a row.
 */
export function parseRowDate(value: string): number | null {
  if (!value) return null;

  const named = /(\d{1,2})[-\s/]([A-Za-z]{3})[A-Za-z]*[-\s/](\d{4})/.exec(value);
  if (named) {
    const month = MONTHS.indexOf(named[2].toLowerCase());
    if (month >= 0) return Date.UTC(Number(named[3]), month, Number(named[1]));
  }

  const iso = /(\d{4})-(\d{1,2})-(\d{1,2})/.exec(value);
  if (iso) {
    return Date.UTC(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
  }
  return null;
}

/**
 * A filter panel's dropdown treats its first option as "no constraint" —
 * "All PSS", "All Statuses" and so on. The option lists are user-editable, so
 * the sentinel is defined by position rather than by matching a fixed string.
 */
export function isUnconstrained(value: string, options: string[]): boolean {
  return !value || options.length === 0 || value === options[0];
}

/**
 * Filters `rows` by a free-text search, a dropdown per field, and an optional
 * date range.
 *
 * `fields` must be a stable reference — define it at module scope, not inline
 * in the component, or the derived options recompute on every render.
 */
export function useRowFilter<T>(
  rows: T[],
  fields: FilterField<T>[],
  /** Everything the free-text box should look through, joined. */
  searchable: (row: T) => string,
  /** Supply only when the row has a date the range should apply to. */
  dateOf?: (row: T) => string
): RowFilter<T> {
  const [search, setSearch] = useState("");
  const [picks, setPicks] = useState<Record<string, string>>({});
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const options = useMemo(() => {
    const result: Record<string, string[]> = {};
    for (const field of fields) {
      const seen: string[] = [];
      for (const row of rows) {
        const value = field.value(row);
        // "—" is this data's placeholder for empty; it is not worth offering.
        if (value && value !== "—" && !seen.includes(value)) seen.push(value);
      }
      result[field.key] = seen;
    }
    return result;
  }, [rows, fields]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const from = dateFrom ? parseRowDate(dateFrom) : null;
    const to = dateTo ? parseRowDate(dateTo) : null;

    return rows.filter((row) => {
      for (const field of fields) {
        const pick = picks[field.key];
        if (pick && pick !== ALL && field.value(row) !== pick) return false;
      }

      if (query && !searchable(row).toLowerCase().includes(query)) return false;

      if (dateOf && (from !== null || to !== null)) {
        const day = parseRowDate(dateOf(row));
        // An unparseable date is not evidence the row is outside the range,
        // so it stays rather than silently vanishing.
        if (day !== null) {
          if (from !== null && day < from) return false;
          if (to !== null && day > to) return false;
        }
      }

      return true;
    });
  }, [rows, fields, picks, search, dateFrom, dateTo, searchable, dateOf]);

  const active =
    search.trim() !== "" ||
    dateFrom !== "" ||
    dateTo !== "" ||
    Object.values(picks).some((v) => v && v !== ALL);

  return {
    rows: filtered,
    total: rows.length,
    active,
    search,
    setSearch,
    picks,
    setPick: (key, value) => setPicks((prev) => ({ ...prev, [key]: value })),
    options,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    clear: () => {
      setSearch("");
      setPicks({});
      setDateFrom("");
      setDateTo("");
    },
  };
}

// ── UI ────────────────────────────────────────────────────────────────

const CONTROL =
  "nodrag nopan rounded border border-blue-200 bg-white px-1.5 py-[3px] text-[10px] text-zinc-700 outline-none transition-colors focus:border-blue-500";

export interface FilterBarProps<T> {
  filter: RowFilter<T>;
  fields: FilterField<T>[];
  /** Placeholder for the free-text box. */
  placeholder?: string;
  /** Show the From / To date inputs. */
  showDates?: boolean;
  /** Word used in the result count, e.g. "events" → "8 of 12 events". */
  noun?: string;
  children?: ReactNode;
}

/** Compact filter strip that sits directly under a widget's header. */
export function FilterBar<T>({
  filter,
  fields,
  placeholder = "Search…",
  showDates = false,
  noun = "rows",
  children,
}: FilterBarProps<T>) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 border-b border-blue-100 bg-blue-50/40 px-3 py-1.5">
      <label className="relative flex items-center">
        <svg
          viewBox="0 0 24 24"
          aria-hidden
          className="pointer-events-none absolute left-1.5 h-3 w-3 text-blue-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <span className="sr-only">{placeholder}</span>
        <input
          type="search"
          value={filter.search}
          onChange={(e) => filter.setSearch(e.target.value)}
          placeholder={placeholder}
          className={`${CONTROL} w-40 pl-6`}
        />
      </label>

      {fields.map((field) => (
        <label key={field.key} className="flex items-center">
          <span className="sr-only">{field.label}</span>
          <select
            value={filter.picks[field.key] ?? ALL}
            onChange={(e) => filter.setPick(field.key, e.target.value)}
            className={CONTROL}
          >
            <option value={ALL}>All {field.label}</option>
            {filter.options[field.key]?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      ))}

      {showDates && (
        <span className="flex items-center gap-1 text-[10px] text-zinc-500">
          <input
            type="date"
            aria-label="From date"
            value={filter.dateFrom}
            onChange={(e) => filter.setDateFrom(e.target.value)}
            className={CONTROL}
          />
          <span aria-hidden>→</span>
          <input
            type="date"
            aria-label="To date"
            value={filter.dateTo}
            onChange={(e) => filter.setDateTo(e.target.value)}
            className={CONTROL}
          />
        </span>
      )}

      {children}

      <span className="ml-auto flex items-center gap-2">
        <span className="text-[10px] tabular-nums text-zinc-500">
          {filter.active
            ? `${filter.rows.length} of ${filter.total} ${noun}`
            : `${filter.total} ${noun}`}
        </span>
        {filter.active && (
          <button
            type="button"
            onClick={filter.clear}
            className="nodrag nopan rounded border border-blue-200 bg-white px-1.5 py-[2px] text-[9.5px] font-semibold text-blue-700 transition-colors hover:border-blue-400 hover:bg-blue-50"
          >
            Clear
          </button>
        )}
      </span>
    </div>
  );
}

/** Shown in place of rows when a filter excludes everything. */
export function NoMatches({
  colSpan,
  onClear,
  /** Hidden when a filter panel outside this widget owns the filters — the
   *  Clear here could not reach them. */
  showClear = true,
}: {
  colSpan: number;
  onClear: () => void;
  showClear?: boolean;
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-4 text-center text-[11px] text-zinc-400">
        No rows match the current filters.{" "}
        {showClear && (
          <button
            type="button"
            onClick={onClear}
            className="font-semibold text-blue-600 underline-offset-2 hover:underline"
          >
            Clear filters
          </button>
        )}
      </td>
    </tr>
  );
}
