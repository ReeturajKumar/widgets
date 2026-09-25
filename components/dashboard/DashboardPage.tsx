"use client";

import { useCallback, useMemo, useState } from "react";

import {
  DASHBOARD_META,
  NAV_ITEMS,
} from "./data";
import { NavBar } from "./widgets/NavBar/NavBar";
import type { NavBarConfig } from "./widgets/NavBar/types";
import { PageHeader as PageHeaderWidget } from "./widgets/PageHeader/PageHeader";
import type { PageHeaderConfig } from "./widgets/PageHeader/types";
import { SoeSummaryCard } from "./widgets/SoeSummaryCard/SoeSummaryCard";
import { DEFAULT_SOE_SUMMARY } from "./widgets/SoeSummaryCard/types";
import { SoeEventList } from "./widgets/SoeEventList/SoeEventList";
import { DEFAULT_SOE_EVENT_LIST } from "./widgets/SoeEventList/types";
import type {
  SoeEventListConfig,
  SoeRowConfig,
} from "./widgets/SoeEventList/types";
import { FirstOutCard } from "./widgets/FirstOutCard/FirstOutCard";
import { DEFAULT_FIRST_OUT } from "./widgets/FirstOutCard/types";
import { EventChronologyCard } from "./widgets/EventChronology/EventChronologyCard";
import { DEFAULT_EVENT_CHRONOLOGY } from "./widgets/EventChronology/types";
import { EventFiltersCard } from "./widgets/EventFilters/EventFiltersCard";
import { DEFAULT_EVENT_FILTERS } from "./widgets/EventFilters/types";
import type { EventFiltersConfig } from "./widgets/EventFilters/types";
import { matchesSoeRow } from "./widgets/EventFilters/predicate";
import {
  deriveFirstOutSteps,
  deriveSummaryValues,
  deriveTimelinePoints,
} from "./widgets/EventFilters/derive";
import { SelectedEventDetailsCard } from "./widgets/SelectedEventDetails/SelectedEventDetailsCard";
import { DEFAULT_SELECTED_EVENT_DETAILS } from "./widgets/SelectedEventDetails/types";

const DASHBOARD_PAGE_HEADER: PageHeaderConfig = {
  breadcrumb: [...DASHBOARD_META.breadcrumb],
  title: DASHBOARD_META.pageTitle,
  subtitle: DASHBOARD_META.pageSubtitle,
  scopeTags: [...DASHBOARD_META.scopeTags],
  liveDataLabel: "Live Data",
  showLiveData: true,
};

// The starting shape for the dashboard's top nav. Users can edit any value in
// place, and localStorage under "dashboard.navbar.v1" carries the changes
// across reloads — replacing DASHBOARD_META here won't wipe an edited nav.
const DASHBOARD_NAVBAR: NavBarConfig = {
  brand: DASHBOARD_META.brand,
  brandSuperscript: "TM",
  brandSubtitle: DASHBOARD_META.brandSubtitle,
  navItems: NAV_ITEMS.map(({ key, label, icon, badge }) => ({
    id: key,
    label,
    icon,
    badge,
  })),
  dateTime: DASHBOARD_META.dateTimeLine1,
  operatorLabel: "Operator",
  operatorValue: DASHBOARD_META.operator,
  logoutLabel: "Logout",
  showLogout: true,
  partnerBrand: DASHBOARD_META.partner,
  partnerTagline: DASHBOARD_META.partnerTagline,
};

/**
 * AUTRIXA Distribution SCADA / Sequence of Events dashboard template.
 *
 * Rebuilt from the reference image, section for section. Every visible value
 * lives in `data.ts` so a follow-up inline-edit layer can swap the constants
 * for state without changing the layout.
 */
export function DashboardPage() {
  // The filter panel and the lists it drives share this parent, so the applied
  // filters live here. Null means nothing has been applied yet — distinct from
  // "applied, but matching everything", which still counts as filtered.
  const [applied, setApplied] = useState<EventFiltersConfig | null>(null);

  // The summary, cascade, timeline and detail cards all describe the same
  // events as the list, so the template needs the rows themselves — not just a
  // predicate. The list reports its rows up as they are edited; the reference
  // only changes when the rows actually change, so this does not loop.
  const [rows, setRows] = useState<SoeRowConfig[]>(DEFAULT_SOE_EVENT_LIST.rows);
  const handleListChange = useCallback(
    (config: SoeEventListConfig) => setRows(config.rows),
    []
  );

  const rowFilter = useMemo(
    () => (applied ? (row: SoeRowConfig) => matchesSoeRow(row, applied) : undefined),
    [applied]
  );

  const filteredRows = useMemo(
    () => (rowFilter ? rows.filter(rowFilter) : rows),
    [rows, rowFilter]
  );

  // undefined everywhere means "not filtering", which leaves each card on its
  // own editable content.
  const summaryValues = useMemo(
    () => (applied ? deriveSummaryValues(filteredRows) : undefined),
    [applied, filteredRows]
  );
  const firstOutSteps = useMemo(
    () => (applied ? deriveFirstOutSteps(filteredRows) : undefined),
    [applied, filteredRows]
  );
  const timelinePoints = useMemo(
    () => (applied ? deriveTimelinePoints(filteredRows) : undefined),
    [applied, filteredRows]
  );
  // The details card describes the top row of the filtered list — the one a
  // user would read as selected. That is deliberately not the same as the
  // first-out card's initiating event, which is the *earliest* of the set.
  const selectedEvent = applied ? filteredRows[0] ?? null : undefined;

  const clearFilters = useCallback(() => setApplied(null), []);

  return (
    <div className="min-h-full min-w-[1280px] bg-zinc-100 text-zinc-800">
      <NavBar defaultConfig={DASHBOARD_NAVBAR} storageKey="dashboard.navbar.v1" />
      <PageHeaderWidget defaultConfig={DASHBOARD_PAGE_HEADER} storageKey="dashboard.pageheader.v1" />
      <div className="px-4 pb-4 pt-1">
        <div className="grid grid-cols-[1fr_480px] gap-3">
          <div className="flex flex-col gap-3 min-w-0">
            <SoeSummaryCard
              defaultConfig={DEFAULT_SOE_SUMMARY}
              storageKey="dashboard.soesummary.v1"
              derivedValues={summaryValues}
            />
            <SoeEventList
              defaultConfig={DEFAULT_SOE_EVENT_LIST}
              storageKey="dashboard.soeeventlist.v1"
              externalFilter={rowFilter}
              onChange={handleListChange}
              hideFilterBar
            />
            <FirstOutCard
              defaultConfig={DEFAULT_FIRST_OUT}
              storageKey="dashboard.firstout.v1"
              derivedSteps={firstOutSteps}
            />
            <EventChronologyCard
              defaultConfig={DEFAULT_EVENT_CHRONOLOGY}
              storageKey="dashboard.chronology.v1"
              derivedPoints={timelinePoints}
              hideFilterBar
            />
          </div>
          <div className="flex flex-col gap-3 min-w-0">
            <EventFiltersCard
              defaultConfig={DEFAULT_EVENT_FILTERS}
              storageKey="dashboard.eventfilters.v1"
              onApply={setApplied}
              onResetFilters={clearFilters}
            />
            <SelectedEventDetailsCard
              defaultConfig={DEFAULT_SELECTED_EVENT_DETAILS}
              storageKey="dashboard.selecteddetails.v1"
              derivedEvent={selectedEvent}
            />
          </div>
        </div>
      </div>
    </div>
  );
}





