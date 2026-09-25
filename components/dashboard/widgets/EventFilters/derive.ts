// Derives the SOE dashboard's companion cards from the filtered event rows.
//
// The summary tiles, the first-out cascade, the chronology timeline and the
// selected-event details all describe the same event set as the event list, so
// once a filter narrows that set they have to follow — otherwise the dashboard
// shows a filtered table beside totals for everything.
//
// Every derivation falls back to the card's own configured content when there
// is no rule for a field (a user-added KPI tile, "Relay / IED", and so on), so
// editing still works for anything the event rows cannot supply.

import type { FirstOutStepConfig, FirstOutIconKind } from "../FirstOutCard/types";
import type { KpiTileConfig } from "../SoeSummaryCard/types";
import type { DetailFieldRow } from "../SelectedEventDetails/types";
import type { TimelineKind, TimelinePointConfig } from "../EventChronology/types";
import type { SoeRowConfig } from "../SoeEventList/types";

/** Full timestamp for one row: the row splits seconds and milliseconds. */
function stamp(row: SoeRowConfig): string {
  return `${row.time}.${row.msec}`;
}

/** Sorted oldest-first — a cascade only reads correctly in time order. */
function chronological(rows: SoeRowConfig[]): SoeRowConfig[] {
  return [...rows].sort((a, b) => stamp(a).localeCompare(stamp(b)));
}

// ── Summary tiles ─────────────────────────────────────────────────────

/**
 * Live values for the KPI tiles, keyed by tile id.
 *
 * Only the ids the seed config ships with have a counting rule; a tile the
 * user added has no defined meaning, so it keeps whatever value they typed.
 */
export function deriveSummaryValues(
  rows: SoeRowConfig[]
): Record<string, string> {
  const count = (test: (row: SoeRowConfig) => boolean) =>
    rows.filter(test).length.toLocaleString();

  return {
    total: rows.length.toLocaleString(),
    critical: count((r) => r.priority === "CRITICAL"),
    comm: count((r) => /communicat/i.test(r.event)),
    trips: count((r) => /trip|protection/i.test(r.event)),
    control: count((r) => /control/i.test(r.event)),
    restored: count((r) => /restor|energized/i.test(r.event) && !/de-energized/i.test(r.event)),
  };
}

export function applySummaryValues(
  tiles: KpiTileConfig[],
  values: Record<string, string>
): KpiTileConfig[] {
  return tiles.map((tile) =>
    values[tile.id] === undefined ? tile : { ...tile, value: values[tile.id] }
  );
}

// ── First-out cascade ─────────────────────────────────────────────────

function stepIcon(event: string): FirstOutIconKind {
  if (/relay|protection/i.test(event)) return "relay";
  if (/breaker/i.test(event)) return "breaker";
  if (/feeder/i.test(event)) return "feeder";
  if (/transformer/i.test(event)) return "transformer";
  if (/restor/i.test(event)) return "restoration";
  if (/communicat/i.test(event)) return "alert";
  return "bolt-red";
}

/**
 * The earliest filtered events, read as a cascade.
 *
 * The first one carries the initiating badge, since first-out means exactly
 * "the earliest event in the set".
 */
export function deriveFirstOutSteps(
  rows: SoeRowConfig[],
  limit = 4
): FirstOutStepConfig[] {
  return chronological(rows)
    .slice(0, limit)
    .map((row, index) => ({
      id: row.id,
      title: row.event,
      meta: `${row.equipment} (${row.pss})`,
      timestamp: stamp(row),
      note: row.newState && row.newState !== "—" ? row.newState : row.previousState,
      icon: stepIcon(row.event),
      initiating: index === 0,
    }));
}

// ── Chronology timeline ───────────────────────────────────────────────

function pointKind(row: SoeRowConfig): TimelineKind {
  if (/restor/i.test(row.event)) return "restoration";
  if (row.priority === "CRITICAL") return "critical";
  if (row.priority === "WARNING") return "warning";
  return "info";
}

export function deriveTimelinePoints(
  rows: SoeRowConfig[]
): TimelinePointConfig[] {
  const ordered = chronological(rows);
  return ordered.map((row, index) => ({
    id: row.id,
    time: stamp(row),
    label: row.event,
    kind: pointKind(row),
    // Highlight the initiating event, matching the first-out card.
    active: index === 0,
  }));
}

// ── Selected event details ────────────────────────────────────────────

/**
 * Fills the detail rows the event actually carries.
 *
 * Matched by the label rather than by id so a reordered or re-added row still
 * resolves. Fields the event row has no source for — Fault Type, Trip Cause,
 * Relay / IED, RTU, Remarks — are left as configured.
 */
export function applyEventDetails(
  detailRows: DetailFieldRow[],
  row: SoeRowConfig | undefined
): DetailFieldRow[] {
  if (!row) return detailRows;

  const byLabel: Record<string, string> = {
    "date & time (rtu source)": `${row.date} ${stamp(row)}`,
    "date & time (system receive)": `${row.date} ${stamp(row)}`,
    pss: row.pss,
    equipment: row.equipment,
    event: row.event,
    "previous state": row.previousState,
    "new state": row.newState,
    priority: row.priority,
    quality: row.quality,
  };

  return detailRows.map((detail) => {
    const next = byLabel[detail.label.trim().toLowerCase()];
    if (next === undefined) return detail;
    return {
      ...detail,
      value: next,
      // The priority badge has to track the value or the colour lies.
      badge: detail.badge ? row.priority : detail.badge,
    };
  });
}
