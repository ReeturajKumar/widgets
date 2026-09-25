// Derives the outage dashboard's companion cards from the filtered rows.
//
// The KPI banner, the per-feeder and per-PSS summaries, the restored list and
// the selected-outage details all describe the same outages as the main table,
// so once a filter narrows that set they have to follow — otherwise the
// dashboard shows an empty table beside totals for everything.
//
// Anything the outage rows cannot supply keeps whatever the card has
// configured, so inline editing still works for those fields.

import type {
  FeederKpiRow,
  OutageDetailRow,
  OutageKpiTile,
  RecentlyRestoredRow,
  TopPssRow,
} from "./types";
import type { OutageRowConfig } from "./widgets/OutageList/types";

// ── Duration & time helpers ───────────────────────────────────────────

/** Minutes in a "1 h 24 m" duration, or null when it is a placeholder. */
export function parseDuration(value: string): number | null {
  if (!value) return null;
  const hours = /(\d+)\s*h/i.exec(value);
  const minutes = /(\d+)\s*m/i.exec(value);
  if (!hours && !minutes) return null;
  return (hours ? Number(hours[1]) * 60 : 0) + (minutes ? Number(minutes[1]) : 0);
}

/** Renders minutes back in the dashboard's own "1 h 24 m" style. */
export function formatDuration(minutes: number): string {
  const whole = Math.max(0, Math.round(minutes));
  return `${Math.floor(whole / 60)} h ${whole % 60} m`;
}

/** The clock part of "09-Sep-2026 14:12:36", trimmed to hours and minutes. */
function timeOfDay(value: string): string {
  const match = /(\d{2}:\d{2})(:\d{2})?/.exec(value);
  return match ? match[1] : "—";
}

function durationsOf(rows: OutageRowConfig[]): number[] {
  return rows
    .map((row) => parseDuration(row.outageDuration))
    .filter((minutes): minutes is number => minutes !== null);
}

// ── KPI banner ────────────────────────────────────────────────────────

/**
 * Live values for the banner tiles, keyed by tile id.
 *
 * Only the ids the seed config ships with have a rule; a tile the user added
 * has no defined meaning and keeps its typed value.
 */
export function deriveOutageKpis(
  rows: OutageRowConfig[]
): Record<string, string> {
  const durations = durationsOf(rows);
  const total = durations.reduce((sum, value) => sum + value, 0);

  // Latest by start time, so "Last Outage Time" tracks the filtered set.
  const latest = [...rows].sort((a, b) =>
    b.outageStart.localeCompare(a.outageStart)
  )[0];

  return {
    "kpi-active": String(
      rows.filter((r) => r.status === "Active" || r.status === "Critical").length
    ),
    "kpi-restored": String(rows.filter((r) => r.status === "Restored").length),
    "kpi-total": String(rows.length),
    "kpi-avg-duration": durations.length
      ? formatDuration(total / durations.length)
      : "—",
    "kpi-longest": durations.length
      ? formatDuration(Math.max(...durations))
      : "—",
    "kpi-last-time": latest ? timeOfDay(latest.outageStart) : "—",
    "kpi-tripped": String(
      rows.filter((r) => r.breakerStatus === "Tripped").length
    ),
    "kpi-open": String(rows.filter((r) => r.breakerStatus === "Open").length),
  };
}

export function applyOutageKpis(
  tiles: OutageKpiTile[],
  values: Record<string, string>
): OutageKpiTile[] {
  return tiles.map((tile) =>
    values[tile.id] === undefined ? tile : { ...tile, value: values[tile.id] }
  );
}

// ── Per-feeder summary ────────────────────────────────────────────────

/** One row per feeder in the filtered set, busiest first. */
export function deriveFeederKpiRows(rows: OutageRowConfig[]): FeederKpiRow[] {
  const groups = new Map<string, OutageRowConfig[]>();
  for (const row of rows) {
    const list = groups.get(row.feeder);
    if (list) list.push(row);
    else groups.set(row.feeder, [row]);
  }

  return [...groups.entries()]
    .map(([feeder, group]) => {
      const durations = durationsOf(group);
      const total = durations.reduce((sum, value) => sum + value, 0);
      const latest = [...group].sort((a, b) =>
        b.outageStart.localeCompare(a.outageStart)
      )[0];

      return {
        feeder,
        outageCount: group.length,
        totalDuration: durations.length ? formatDuration(total) : "—",
        avgDuration: durations.length
          ? formatDuration(total / durations.length)
          : "—",
        longestOutage: durations.length
          ? formatDuration(Math.max(...durations))
          : "—",
        lastOutage: latest ? timeOfDay(latest.outageStart) : "—",
      };
    })
    .sort((a, b) => b.outageCount - a.outageCount)
    .map((row, index) => ({ ...row, id: `feeder-${row.feeder}`, num: index + 1 }));
}

// ── Recently restored ─────────────────────────────────────────────────

/** Restored outages, most recently restored first. */
export function deriveRestoredRows(
  rows: OutageRowConfig[],
  limit = 10
): RecentlyRestoredRow[] {
  return rows
    .filter((row) => row.status === "Restored")
    .sort((a, b) =>
      (b.restorationTime || b.outageEnd).localeCompare(
        a.restorationTime || a.outageEnd
      )
    )
    .slice(0, limit)
    .map((row, index) => ({
      id: row.id,
      num: index + 1,
      feeder: row.feeder,
      restoredTime: row.restorationTime || row.outageEnd || "—",
      outageDuration: row.outageDuration || "—",
      remarks: row.operatorRemarks || "—",
    }));
}

// ── Top PSS ───────────────────────────────────────────────────────────

/** One row per PSS in the filtered set, most outages first. */
export function deriveTopPssRows(rows: OutageRowConfig[]): TopPssRow[] {
  const groups = new Map<string, OutageRowConfig[]>();
  for (const row of rows) {
    const list = groups.get(row.pss);
    if (list) list.push(row);
    else groups.set(row.pss, [row]);
  }

  return [...groups.entries()]
    .map(([pss, group]) => {
      const total = durationsOf(group).reduce((sum, value) => sum + value, 0);
      return {
        pss,
        outageCount: group.length,
        totalDuration: total > 0 ? formatDuration(total) : "—",
      };
    })
    .sort((a, b) => b.outageCount - a.outageCount)
    .map((row, index) => ({ ...row, id: `pss-${row.pss}`, num: index + 1 }));
}

// ── Selected outage details ───────────────────────────────────────────

/**
 * Fills the detail rows the outage actually carries.
 *
 * Matched by label rather than id so a reordered or re-added row still
 * resolves. Communication and Data Quality have no source in an outage row and
 * are left as configured.
 */
export function applyOutageDetails(
  detailRows: OutageDetailRow[],
  row: OutageRowConfig | undefined
): OutageDetailRow[] {
  if (!row) return detailRows;

  const byLabel: Record<string, string> = {
    pss: row.pss,
    feeder: row.feeder,
    "outage start": row.outageStart,
    "outage end": row.outageEnd,
    "outage duration": row.outageDuration,
    "breaker status": row.breakerStatus,
    "trip cause": row.tripCause,
    "restoration time": row.restorationTime,
    "operator remarks": row.operatorRemarks,
    status: row.status,
  };

  return detailRows.map((detail) => {
    const next = byLabel[detail.label.trim().toLowerCase()];
    return next === undefined ? detail : { ...detail, value: next };
  });
}
