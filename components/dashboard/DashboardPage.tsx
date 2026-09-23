"use client";

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
import { FirstOutCard } from "./widgets/FirstOutCard/FirstOutCard";
import { DEFAULT_FIRST_OUT } from "./widgets/FirstOutCard/types";
import { EventChronologyCard } from "./widgets/EventChronology/EventChronologyCard";
import { DEFAULT_EVENT_CHRONOLOGY } from "./widgets/EventChronology/types";
import { EventFiltersCard } from "./widgets/EventFilters/EventFiltersCard";
import { DEFAULT_EVENT_FILTERS } from "./widgets/EventFilters/types";
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
            />
            <SoeEventList
              defaultConfig={DEFAULT_SOE_EVENT_LIST}
              storageKey="dashboard.soeeventlist.v1"
            />
            <FirstOutCard
              defaultConfig={DEFAULT_FIRST_OUT}
              storageKey="dashboard.firstout.v1"
            />
            <EventChronologyCard
              defaultConfig={DEFAULT_EVENT_CHRONOLOGY}
              storageKey="dashboard.chronology.v1"
            />
          </div>
          <div className="flex flex-col gap-3 min-w-0">
            <EventFiltersCard
              defaultConfig={DEFAULT_EVENT_FILTERS}
              storageKey="dashboard.eventfilters.v1"
            />
            <SelectedEventDetailsCard
              defaultConfig={DEFAULT_SELECTED_EVENT_DETAILS}
              storageKey="dashboard.selecteddetails.v1"
            />
          </div>
        </div>
      </div>
    </div>
  );
}





