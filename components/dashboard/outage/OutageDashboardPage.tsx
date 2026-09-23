"use client";

import { NavBar } from "../widgets/NavBar/NavBar";
import { PageHeader as PageHeaderWidget } from "../widgets/PageHeader/PageHeader";
import { OUTAGE_NAVBAR, OUTAGE_PAGE_HEADER } from "./data";
import { OutageKpiSummaryCard } from "./widgets/OutageKpiSummaryCard";
import { OutageListCard } from "./widgets/OutageList/OutageListCard";
import { DEFAULT_OUTAGE_LIST } from "./widgets/OutageList/types";
import { FeederKpiSummaryCard } from "./widgets/FeederKpiSummaryCard";
import { RecentlyRestoredCard } from "./widgets/RecentlyRestoredCard";
import { TopPssCard } from "./widgets/TopPssCard";
import { OutageFiltersCard } from "./widgets/OutageFiltersCard";
import { SelectedOutageDetailsCard } from "./widgets/SelectedOutageDetailsCard";

/**
 * AUTRIXA Distribution SCADA / Outage Monitoring dashboard template.
 *
 * Rebuilt from the reference image, pixel for pixel.
 * Fully editable, fully customizable with persistent localStorage state.
 */
export function OutageDashboardPage() {
  return (
    <div className="min-h-full min-w-[1280px] bg-zinc-100 text-zinc-800">
      <NavBar defaultConfig={OUTAGE_NAVBAR} storageKey="outage.navbar.v1" />
      <PageHeaderWidget
        defaultConfig={OUTAGE_PAGE_HEADER}
        storageKey="outage.pageheader.v1"
      />

      <div className="px-4 pb-4 pt-1 space-y-3">
        {/* Top KPI Summary Banner */}
        <OutageKpiSummaryCard storageKey="outage.kpisummary.v1" />

        {/* Main Grid: Left Wide Column + Right Filters/Details Column */}
        <div className="grid grid-cols-[1fr_380px] gap-3">
          {/* Left Column: Outage Table + Bottom 3-Card Summary Grid */}
          <div className="flex flex-col gap-3 min-w-0">
            <OutageListCard
              defaultConfig={DEFAULT_OUTAGE_LIST}
              storageKey="outage.list.v2"
            />

            {/* Bottom 3 Summary Cards */}
            <div className="grid grid-cols-3 gap-3">
              <FeederKpiSummaryCard storageKey="outage.feederkpi.v1" />
              <RecentlyRestoredCard storageKey="outage.recentlyrestored.v1" />
              <TopPssCard storageKey="outage.toppss.v1" />
            </div>
          </div>

          {/* Right Column: Filters + Selected Outage Details */}
          <div className="flex flex-col gap-3 min-w-0">
            <OutageFiltersCard storageKey="outage.filters.v1" />
            <SelectedOutageDetailsCard storageKey="outage.selecteddetails.v1" />
          </div>
        </div>
      </div>
    </div>
  );
}
