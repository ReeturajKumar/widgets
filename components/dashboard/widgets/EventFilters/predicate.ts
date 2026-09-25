// Turns the SOE filter panel's config into predicates the list widgets can run.
//
// The panel and the widgets it drives sit side by side in the dashboard
// template, so the template owns the applied filters and hands a predicate
// down. Keeping the matching here means the panel stays a pure input and the
// widgets stay unaware of where a filter came from.

import { isUnconstrained, parseRowDate } from "../../filterShared";
import type { TimelinePointConfig } from "../EventChronology/types";
import type { SoeRowConfig } from "../SoeEventList/types";
import type { EventFiltersConfig } from "./types";

/** True when the row falls inside the panel's From / To dates. */
function withinDates(rowDate: string, filters: EventFiltersConfig): boolean {
  const from = parseRowDate(filters.dateFromValue);
  const to = parseRowDate(filters.dateToValue);
  if (from === null && to === null) return true;

  const day = parseRowDate(rowDate);
  // An unparseable date is not evidence the row is outside the range, so it
  // stays rather than silently disappearing.
  if (day === null) return true;
  if (from !== null && day < from) return false;
  if (to !== null && day > to) return false;
  return true;
}

function searchableRow(row: SoeRowConfig): string {
  return [
    row.num, row.date, row.time, row.msec, row.pss, row.equipment,
    row.event, row.previousState, row.newState, row.priority, row.quality,
  ]
    .join(" ")
    .toLowerCase();
}

export function matchesSoeRow(
  row: SoeRowConfig,
  filters: EventFiltersConfig
): boolean {
  if (
    !isUnconstrained(filters.pssValue, filters.pssOptions) &&
    row.pss !== filters.pssValue
  ) {
    return false;
  }
  if (
    !isUnconstrained(filters.equipmentValue, filters.equipmentOptions) &&
    row.equipment !== filters.equipmentValue
  ) {
    return false;
  }
  if (
    !isUnconstrained(filters.eventTypeValue, filters.eventTypeOptions) &&
    row.event !== filters.eventTypeValue
  ) {
    return false;
  }
  // Priority is compared case-insensitively: the rows store CRITICAL while the
  // panel's options are written as Critical.
  if (
    !isUnconstrained(filters.priorityValue, filters.priorityOptions) &&
    row.priority.toLowerCase() !== filters.priorityValue.toLowerCase()
  ) {
    return false;
  }
  if (
    !isUnconstrained(filters.qualityValue, filters.qualityOptions) &&
    row.quality.toLowerCase() !== filters.qualityValue.toLowerCase()
  ) {
    return false;
  }

  const query = filters.searchValue.trim().toLowerCase();
  if (query && !searchableRow(row).includes(query)) return false;

  return withinDates(row.date, filters);
}

/**
 * The chronology holds timeline points, not event rows, so only the fields it
 * actually has can be constrained: severity and the free-text search. A panel
 * filter for PSS or equipment cannot apply here and is ignored rather than
 * emptying the timeline.
 */
export function matchesTimelinePoint(
  point: TimelinePointConfig,
  filters: EventFiltersConfig
): boolean {
  if (!isUnconstrained(filters.priorityValue, filters.priorityOptions)) {
    if (point.kind.toLowerCase() !== filters.priorityValue.toLowerCase()) {
      return false;
    }
  }

  const query = filters.searchValue.trim().toLowerCase();
  if (query) {
    const text = `${point.time} ${point.label} ${point.kind}`.toLowerCase();
    if (!text.includes(query)) return false;
  }

  return true;
}
