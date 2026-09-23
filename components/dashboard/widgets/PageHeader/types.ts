// Config for the PageHeader widget — breadcrumb + title row + scope tags +
// Live-Data button. Everything visible is a field on this shape so the whole
// section can be swapped or edited without touching the widget JSX.

export interface PageHeaderConfig {
  breadcrumb: string[];
  title: string;
  subtitle: string;
  scopeTags: string[];
  liveDataLabel: string;
  showLiveData: boolean;
}

export const DEFAULT_PAGE_HEADER: PageHeaderConfig = {
  breadcrumb: ["Home", "Events", "SEQUENCE OF EVENTS (SOE)"],
  title: "SEQUENCE OF EVENTS (SOE)",
  subtitle: "High-Resolution Chronological Event Viewer",
  scopeTags: ["Distribution SCADA", "All PSS", "System Wide"],
  liveDataLabel: "Live Data",
  showLiveData: true,
};
