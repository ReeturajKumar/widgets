"use client";

import { useCallback, useMemo, useState } from "react";

import { NavBar } from "../widgets/NavBar/NavBar";
import { PageHeader as PageHeaderWidget } from "../widgets/PageHeader/PageHeader";
import { OUTAGE_NAVBAR, OUTAGE_PAGE_HEADER } from "./data";
import { OutageKpiSummaryCard } from "./widgets/OutageKpiSummaryCard";
import { OutageListCard } from "./widgets/OutageList/OutageListCard";
import { DEFAULT_OUTAGE_LIST } from "./widgets/OutageList/types";
import type {
  OutageListConfig,
  OutageRowConfig,
} from "./widgets/OutageList/types";
import { FeederKpiSummaryCard } from "./widgets/FeederKpiSummaryCard";
import { RecentlyRestoredCard } from "./widgets/RecentlyRestoredCard";
import { TopPssCard } from "./widgets/TopPssCard";
import { OutageFiltersCard } from "./widgets/OutageFiltersCard";
import { matchesOutageRow } from "./filterPredicate";
import {
  applyOutageDetails,
  deriveFeederKpiRows,
  deriveOutageKpis,
  deriveRestoredRows,
  deriveTopPssRows,
} from "./derive";
import { DEFAULT_SELECTED_OUTAGE_DETAILS } from "./data";
import type { OutageFiltersConfig } from "./types";
import { SelectedOutageDetailsCard } from "./widgets/SelectedOutageDetailsCard";

/**
 * AUTRIXA Distribution SCADA / Outage Monitoring dashboard template.
 *
 * Rebuilt from the reference image, pixel for pixel.
 * Fully editable, fully customizable with persistent localStorage state.
 */
export function OutageDashboardPage() {
  // The filter panel and the outage list share this parent, so the applied
  // filters live here. Null means nothing has been applied yet.
  const [applied, setApplied] = useState<OutageFiltersConfig | null>(null);

  // The KPI banner and the three summary cards describe the same outages as
  // the table, so the template needs the rows themselves. The list reports
  // them up as they are edited; the reference only changes when the rows
  // actually change, so this does not loop.
  const [rows, setRows] = useState<OutageRowConfig[]>(DEFAULT_OUTAGE_LIST.rows);
  const handleListChange = useCallback(
    (config: OutageListConfig) => setRows(config.rows),
    []
  );

  const rowFilter = useMemo(
    () =>
      applied ? (row: OutageRowConfig) => matchesOutageRow(row, applied) : undefined,
    [applied]
  );

  const filteredRows = useMemo(
    () => (rowFilter ? rows.filter(rowFilter) : rows),
    [rows, rowFilter]
  );

  // undefined everywhere means "not filtering", which leaves each card on its
  // own editable content.
  const kpiValues = useMemo(
    () => (applied ? deriveOutageKpis(filteredRows) : undefined),
    [applied, filteredRows]
  );
  const feederRows = useMemo(
    () => (applied ? deriveFeederKpiRows(filteredRows) : undefined),
    [applied, filteredRows]
  );
  const restoredRows = useMemo(
    () => (applied ? deriveRestoredRows(filteredRows) : undefined),
    [applied, filteredRows]
  );
  const topPssRows = useMemo(
    () => (applied ? deriveTopPssRows(filteredRows) : undefined),
    [applied, filteredRows]
  );
  // The details card describes the top row of the filtered list; an empty
  // array tells it to say so rather than leave the previous outage on screen.
  const detailRows = useMemo(() => {
    if (!applied) return undefined;
    const first = filteredRows[0];
    return first
      ? applyOutageDetails(DEFAULT_SELECTED_OUTAGE_DETAILS.rows, first)
      : [];
  }, [applied, filteredRows]);

  const clearFilters = useCallback(() => setApplied(null), []);

  return (
    <div className="min-h-full min-w-[1280px] bg-zinc-100 text-zinc-800">
      <NavBar defaultConfig={OUTAGE_NAVBAR} storageKey="outage.navbar.v1" />
      <PageHeaderWidget
        defaultConfig={OUTAGE_PAGE_HEADER}
        storageKey="outage.pageheader.v1"
      />

      <div className="px-4 pb-4 pt-1 space-y-3">
        {/* Top KPI Summary Banner */}
        <OutageKpiSummaryCard
          storageKey="outage.kpisummary.v1"
          derivedValues={kpiValues}
        />

        {/* Main Grid: Left Wide Column + Right Filters/Details Column */}
        <div className="grid grid-cols-[1fr_380px] gap-3">
          {/* Left Column: Outage Table + Bottom 3-Card Summary Grid */}
          <div className="flex flex-col gap-3 min-w-0">
            <OutageListCard
              defaultConfig={DEFAULT_OUTAGE_LIST}
              storageKey="outage.list.v2"
              externalFilter={rowFilter}
              onChange={handleListChange}
            />

            {/* Bottom 3 Summary Cards */}
            <div className="grid grid-cols-3 gap-3">
              <FeederKpiSummaryCard
                storageKey="outage.feederkpi.v1"
                derivedRows={feederRows}
              />
              <RecentlyRestoredCard
                storageKey="outage.recentlyrestored.v1"
                derivedRows={restoredRows}
              />
              <TopPssCard
                storageKey="outage.toppss.v1"
                derivedRows={topPssRows}
              />
            </div>
          </div>

          {/* Right Column: Filters + Selected Outage Details */}
          <div className="flex flex-col gap-3 min-w-0">
            <OutageFiltersCard
              storageKey="outage.filters.v1"
              onApply={setApplied}
              onReset={clearFilters}
            />
            <SelectedOutageDetailsCard
              storageKey="outage.selecteddetails.v1"
              derivedRows={detailRows}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
