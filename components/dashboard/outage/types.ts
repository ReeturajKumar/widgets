// Types and configurations for the Outage Monitoring Dashboard Template.

export type OutageStatus = "Active" | "Restored" | "Critical";
export type BreakerStatus = "Tripped" | "Open" | "Closed";

export interface OutageKpiTile {
  id: string;
  label: string;
  value: string;
  subtext?: string;
  trend?: "up" | "down";
  icon:
    | "alert-red"
    | "check-green"
    | "doc-blue"
    | "clock-blue"
    | "stopwatch-red"
    | "calendar-blue"
    | "bolt-orange"
    | "breaker-blue";
  colorScheme: "red" | "green" | "blue" | "orange";
}

export interface OutageRow {
  id: string;
  num: number;
  pss: string;
  feeder: string;
  outageStart: string;
  outageEnd: string;
  outageDuration: string;
  breakerStatus: BreakerStatus;
  tripCause: string;
  restorationTime: string;
  operatorRemarks: string;
  status: OutageStatus;
}

export interface FeederKpiRow {
  id: string;
  num: number;
  feeder: string;
  outageCount: number;
  totalDuration: string;
  avgDuration: string;
  longestOutage: string;
  lastOutage: string;
}

export interface RecentlyRestoredRow {
  id: string;
  num: number;
  feeder: string;
  restoredTime: string;
  outageDuration: string;
  remarks: string;
}

export interface TopPssRow {
  id: string;
  num: number;
  pss: string;
  outageCount: number;
  totalDuration: string;
}

export interface OutageFiltersConfig {
  title: string;
  dateRangeLabel: string;
  dateFromValue: string;
  dateToValue: string;
  pssLabel: string;
  pssValue: string;
  pssOptions: string[];
  feederLabel: string;
  feederValue: string;
  feederOptions: string[];
  statusLabel: string;
  statusValue: string;
  statusOptions: string[];
  tripCauseLabel: string;
  tripCauseValue: string;
  tripCauseOptions: string[];
  applyButtonLabel: string;
  resetButtonLabel: string;
}

export interface OutageDetailRow {
  id: string;
  label: string;
  value: string;
  isStatusBadge?: boolean;
  isBreakerStatus?: boolean;
  isDotIndicator?: boolean;
  dotColor?: "green" | "red" | "amber";
}

export interface SelectedOutageDetailsConfig {
  title: string;
  rows: OutageDetailRow[];
}
