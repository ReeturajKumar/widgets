// Turns the outage filter panel's config into a predicate the outage list can
// run. Mirrors the SOE side — see widgets/EventFilters/predicate.ts.

import { isUnconstrained, parseRowDate } from "../filterShared";
import type { OutageFiltersConfig } from "./types";

/**
 * Only the fields the panel constrains.
 *
 * Typed structurally rather than against a concrete row type because there are
 * two outage row shapes in the codebase — `OutageRow` (numeric `num`) and
 * `OutageRowConfig` (string `num`) — and this predicate is valid for both.
 */
export interface OutageFilterableRow {
  pss: string;
  feeder: string;
  status: string;
  tripCause: string;
  outageStart: string;
}

export function matchesOutageRow(
  row: OutageFilterableRow,
  filters: OutageFiltersConfig
): boolean {
  if (
    !isUnconstrained(filters.pssValue, filters.pssOptions) &&
    row.pss !== filters.pssValue
  ) {
    return false;
  }
  if (
    !isUnconstrained(filters.feederValue, filters.feederOptions) &&
    row.feeder !== filters.feederValue
  ) {
    return false;
  }
  if (
    !isUnconstrained(filters.statusValue, filters.statusOptions) &&
    row.status.toLowerCase() !== filters.statusValue.toLowerCase()
  ) {
    return false;
  }
  if (
    !isUnconstrained(filters.tripCauseValue, filters.tripCauseOptions) &&
    row.tripCause !== filters.tripCauseValue
  ) {
    return false;
  }

  const from = parseRowDate(filters.dateFromValue);
  const to = parseRowDate(filters.dateToValue);
  if (from !== null || to !== null) {
    const day = parseRowDate(row.outageStart);
    // An unparseable date is not evidence the row is outside the range, so the
    // row stays rather than silently disappearing.
    if (day !== null) {
      if (from !== null && day < from) return false;
      if (to !== null && day > to) return false;
    }
  }

  return true;
}
