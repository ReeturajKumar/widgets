"use client";

import type { ComponentType, ReactNode } from "react";

// Outage Monitoring widgets
import { OutageKpiSummaryCard } from "./outage/widgets/OutageKpiSummaryCard";
import { OutageListCard } from "./outage/widgets/OutageList/OutageListCard";
import { DEFAULT_OUTAGE_LIST } from "./outage/widgets/OutageList/types";
import { FeederKpiSummaryCard } from "./outage/widgets/FeederKpiSummaryCard";
import { RecentlyRestoredCard } from "./outage/widgets/RecentlyRestoredCard";
import { TopPssCard } from "./outage/widgets/TopPssCard";
import { OutageFiltersCard } from "./outage/widgets/OutageFiltersCard";
import { SelectedOutageDetailsCard } from "./outage/widgets/SelectedOutageDetailsCard";

// SOE (Sequence of Events) widgets
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

// Common Header & Navbar widgets
import { NavBar } from "./widgets/NavBar/NavBar";
import { PageHeader as PageHeaderWidget } from "./widgets/PageHeader/PageHeader";
import { DASHBOARD_META, NAV_ITEMS } from "./data";
import type { NavBarConfig } from "./widgets/NavBar/types";
import type { PageHeaderConfig } from "./widgets/PageHeader/types";

const COMMON_PAGE_HEADER: PageHeaderConfig = {
  breadcrumb: [...DASHBOARD_META.breadcrumb],
  title: DASHBOARD_META.pageTitle,
  subtitle: DASHBOARD_META.pageSubtitle,
  scopeTags: [...DASHBOARD_META.scopeTags],
  liveDataLabel: "Live Data",
  showLiveData: true,
};

const COMMON_NAVBAR: NavBarConfig = {
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

export interface DashboardWidgetEntry {
  key: string;
  label: string;
  category: "Outage Monitoring" | "Sequence of Events (SOE)" | "Headers & Navigation";
  description: string;
  badge?: string;
  defaultSize: { width: number; height: number };
  Component: ComponentType<{ storageKey?: string; editable?: boolean }>;
}

export const DASHBOARD_WIDGETS: readonly DashboardWidgetEntry[] = [
  // ── Outage Monitoring Widgets ──
  {
    key: "outage-kpi-summary",
    label: "Outage KPI Summary",
    category: "Outage Monitoring",
    description: "8 Real-time Outage & Restoration KPI summary tiles",
    badge: "KPIs",
    defaultSize: { width: 1100, height: 110 },
    Component: ({ storageKey = "outage.kpisummary.standalone", editable = true }) => (
      <OutageKpiSummaryCard storageKey={storageKey} editable={editable} />
    ),
  },
  {
    key: "outage-list",
    label: "Outage List Table",
    category: "Outage Monitoring",
    description: "Live outage table with inline edits, search & status cycling",
    badge: "Table",
    defaultSize: { width: 880, height: 380 },
    Component: ({ storageKey = "outage.list.standalone", editable = true }) => (
      <OutageListCard
        defaultConfig={DEFAULT_OUTAGE_LIST}
        storageKey={storageKey}
        editable={editable}
      />
    ),
  },
  {
    key: "outage-feeder-kpi",
    label: "Feeder KPI Summary",
    category: "Outage Monitoring",
    description: "Feeder outage counts, total & average duration table",
    badge: "Summary",
    defaultSize: { width: 500, height: 260 },
    Component: ({ storageKey = "outage.feederkpi.standalone", editable = true }) => (
      <FeederKpiSummaryCard storageKey={storageKey} editable={editable} />
    ),
  },
  {
    key: "outage-recently-restored",
    label: "Recently Restored Feeders",
    category: "Outage Monitoring",
    description: "Last restored feeders with timestamps & remarks",
    badge: "Summary",
    defaultSize: { width: 500, height: 260 },
    Component: ({ storageKey = "outage.recentlyrestored.standalone", editable = true }) => (
      <RecentlyRestoredCard storageKey={storageKey} editable={editable} />
    ),
  },
  {
    key: "outage-top-pss",
    label: "Top PSS by Outages",
    category: "Outage Monitoring",
    description: "Top PSS substations ranked by outage count & duration",
    badge: "Summary",
    defaultSize: { width: 440, height: 260 },
    Component: ({ storageKey = "outage.toppss.standalone", editable = true }) => (
      <TopPssCard storageKey={storageKey} editable={editable} />
    ),
  },
  {
    key: "outage-filters",
    label: "Outage Filters Panel",
    category: "Outage Monitoring",
    description: "Date range, PSS, Feeder, Status, and Trip Cause filter panel",
    badge: "Filter",
    defaultSize: { width: 380, height: 330 },
    Component: ({ storageKey = "outage.filters.standalone", editable = true }) => (
      <OutageFiltersCard storageKey={storageKey} editable={editable} />
    ),
  },
  {
    key: "outage-selected-details",
    label: "Selected Outage Details",
    category: "Outage Monitoring",
    description: "Selected feeder inspector, Breaker status & telemetry indicator",
    badge: "Details",
    defaultSize: { width: 380, height: 330 },
    Component: ({ storageKey = "outage.selecteddetails.standalone", editable = true }) => (
      <SelectedOutageDetailsCard storageKey={storageKey} editable={editable} />
    ),
  },

  // ── Sequence of Events (SOE) Widgets ──
  {
    key: "soe-summary",
    label: "SOE KPI Summary",
    category: "Sequence of Events (SOE)",
    description: "Active alarms & SOE event statistics banner",
    badge: "KPIs",
    defaultSize: { width: 880, height: 110 },
    Component: ({ storageKey = "dashboard.soesummary.standalone", editable = true }) => (
      <SoeSummaryCard
        defaultConfig={DEFAULT_SOE_SUMMARY}
        storageKey={storageKey}
        editable={editable}
      />
    ),
  },
  {
    key: "soe-event-list",
    label: "SOE Event List",
    category: "Sequence of Events (SOE)",
    description: "Sequence of Events live log table with timestamp sorting",
    badge: "Table",
    defaultSize: { width: 880, height: 380 },
    Component: ({ storageKey = "dashboard.soeeventlist.standalone", editable = true }) => (
      <SoeEventList
        defaultConfig={DEFAULT_SOE_EVENT_LIST}
        storageKey={storageKey}
        editable={editable}
      />
    ),
  },
  {
    key: "soe-first-out",
    label: "SOE First Out Card",
    category: "Sequence of Events (SOE)",
    description: "First Out trip alarm cause & trigger timestamp inspector",
    badge: "Alarm",
    defaultSize: { width: 880, height: 140 },
    Component: ({ storageKey = "dashboard.firstout.standalone", editable = true }) => (
      <FirstOutCard
        defaultConfig={DEFAULT_FIRST_OUT}
        storageKey={storageKey}
        editable={editable}
      />
    ),
  },
  {
    key: "soe-chronology",
    label: "Event Chronology Card",
    category: "Sequence of Events (SOE)",
    description: "Trip chronology & millisecond sequence table with search",
    badge: "Table",
    defaultSize: { width: 880, height: 340 },
    Component: ({ storageKey = "dashboard.chronology.standalone", editable = true }) => (
      <EventChronologyCard
        defaultConfig={DEFAULT_EVENT_CHRONOLOGY}
        storageKey={storageKey}
        editable={editable}
      />
    ),
  },
  {
    key: "soe-filters",
    label: "SOE Event Filters",
    category: "Sequence of Events (SOE)",
    description: "Filter SOE events by substation, bay, severity & date",
    badge: "Filter",
    defaultSize: { width: 380, height: 330 },
    Component: ({ storageKey = "dashboard.eventfilters.standalone", editable = true }) => (
      <EventFiltersCard
        defaultConfig={DEFAULT_EVENT_FILTERS}
        storageKey={storageKey}
        editable={editable}
      />
    ),
  },
  {
    key: "soe-selected-details",
    label: "SOE Selected Event Details",
    category: "Sequence of Events (SOE)",
    description: "Telemetry diagnostics & relay details for selected event",
    badge: "Details",
    defaultSize: { width: 380, height: 350 },
    Component: ({ storageKey = "dashboard.selecteddetails.standalone", editable = true }) => (
      <SelectedEventDetailsCard
        defaultConfig={DEFAULT_SELECTED_EVENT_DETAILS}
        storageKey={storageKey}
        editable={editable}
      />
    ),
  },

  // ── Headers & Navigation ──
  {
    key: "scada-navbar",
    label: "SCADA Navigation Bar",
    category: "Headers & Navigation",
    description: "Top bar with brand, system navigation, live clock & status",
    badge: "Nav",
    defaultSize: { width: 1200, height: 56 },
    Component: ({ storageKey = "dashboard.navbar.standalone", editable = true }) => (
      <NavBar
        defaultConfig={COMMON_NAVBAR}
        storageKey={storageKey}
        editable={editable}
      />
    ),
  },
  {
    key: "scada-page-header",
    label: "SCADA Page Header",
    category: "Headers & Navigation",
    description: "Breadcrumbs, title, scope tags & live data indicator",
    badge: "Header",
    defaultSize: { width: 1200, height: 60 },
    Component: ({ storageKey = "dashboard.pageheader.standalone", editable = true }) => (
      <PageHeaderWidget
        defaultConfig={COMMON_PAGE_HEADER}
        storageKey={storageKey}
        editable={editable}
      />
    ),
  },
];

export function getDashboardWidget(key?: string): DashboardWidgetEntry | undefined {
  if (!key) return undefined;
  return DASHBOARD_WIDGETS.find((w) => w.key === key);
}
