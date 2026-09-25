// Config shape for the OutageList widget.

import type { TransitionStyle } from "../../../widgets/tableShared";

export type OutageStatus = "Active" | "Restored" | "Critical";
export type BreakerStatus = "Tripped" | "Open" | "Closed";

export interface OutageColumnConfig {
  key: string;
  label: string;
  hidden?: boolean;
}

export interface OutageRowConfig {
  id: string;
  num: string;
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

export interface OutageListConfig {
  title: string;
  subtitle: string;
  columns: OutageColumnConfig[];
  rows: OutageRowConfig[];

  // ── Presentation ──
  // Defaults reproduce the table's original hard-coded styling, so adding
  // these changed nothing on screen until someone edits them.
  headerBg: string;
  headerText: string;
  cellBg: string;
  cellText: string;
  borderColor: string;
  stripeBg: string;
  rowHeight: number;
  fontSize: number;

  // ── Paging ──
  paginate: boolean;
  pageSize: number;
  transition: TransitionStyle;
}

export const DEFAULT_OUTAGE_COLUMNS: OutageColumnConfig[] = [
  { key: "num", label: "#" },
  { key: "pss", label: "PSS" },
  { key: "feeder", label: "Feeder" },
  { key: "outageStart", label: "Outage Start" },
  { key: "outageEnd", label: "Outage End" },
  { key: "outageDuration", label: "Outage Duration" },
  { key: "breakerStatus", label: "Breaker Status" },
  { key: "tripCause", label: "Trip Cause" },
  { key: "restorationTime", label: "Restoration Time" },
  { key: "operatorRemarks", label: "Operator Remarks" },
  { key: "status", label: "Status" },
];

export const DEFAULT_OUTAGE_LIST: OutageListConfig = {
  title: "Outage List / Active & Recent Outages",
  subtitle: "(Latest First)",
  columns: DEFAULT_OUTAGE_COLUMNS,
  headerBg: "#eff6ff",
  headerText: "#172554",
  cellBg: "#ffffff",
  cellText: "#27272a",
  borderColor: "#e4e4e7",
  stripeBg: "",
  rowHeight: 24,
  fontSize: 10.5,
  paginate: true,
  pageSize: 8,
  transition: "fade",
  rows: [
    {
      id: "out-1",
      num: "1",
      pss: "KANKANPURA PSS",
      feeder: "Feeder 03",
      outageStart: "09-Sep-2026 14:12",
      outageEnd: "—",
      outageDuration: "0 h 16 m",
      breakerStatus: "Tripped",
      tripCause: "Overcurrent",
      restorationTime: "—",
      operatorRemarks: "Auto trip - under investigation",
      status: "Active",
    },
    {
      id: "out-2",
      num: "2",
      pss: "BILASPUR PSS",
      feeder: "Feeder 01",
      outageStart: "09-Sep-2026 13:46",
      outageEnd: "—",
      outageDuration: "0 h 42 m",
      breakerStatus: "Open",
      tripCause: "Earth Fault",
      restorationTime: "—",
      operatorRemarks: "Patrolling team dispatched",
      status: "Active",
    },
    {
      id: "out-3",
      num: "3",
      pss: "RAIPUR PSS",
      feeder: "Feeder 05",
      outageStart: "09-Sep-2026 12:21",
      outageEnd: "09-Sep-2026 13:58",
      outageDuration: "1 h 37 m",
      breakerStatus: "Closed",
      tripCause: "Overcurrent",
      restorationTime: "09-Sep-2026 13:58",
      operatorRemarks: "Fault cleared, supply restored",
      status: "Restored",
    },
    {
      id: "out-4",
      num: "4",
      pss: "DURG PSS",
      feeder: "Feeder 02",
      outageStart: "09-Sep-2026 11:05",
      outageEnd: "09-Sep-2026 12:10",
      outageDuration: "1 h 05 m",
      breakerStatus: "Closed",
      tripCause: "Unknown",
      restorationTime: "09-Sep-2026 12:10",
      operatorRemarks: "Manual close after patrolling",
      status: "Restored",
    },
    {
      id: "out-5",
      num: "5",
      pss: "BHILAI PSS",
      feeder: "Feeder 04",
      outageStart: "09-Sep-2026 10:32",
      outageEnd: "—",
      outageDuration: "3 h 56 m",
      breakerStatus: "Open",
      tripCause: "Line Fault",
      restorationTime: "—",
      operatorRemarks: "Line under repair",
      status: "Critical",
    },
    {
      id: "out-6",
      num: "6",
      pss: "KANKANPURA PSS",
      feeder: "Feeder 01",
      outageStart: "09-Sep-2026 09:18",
      outageEnd: "09-Sep-2026 10:05",
      outageDuration: "0 h 47 m",
      breakerStatus: "Closed",
      tripCause: "Overcurrent",
      restorationTime: "09-Sep-2026 10:05",
      operatorRemarks: "Reclosed successfully",
      status: "Restored",
    },
    {
      id: "out-7",
      num: "7",
      pss: "BILASPUR PSS",
      feeder: "Feeder 03",
      outageStart: "09-Sep-2026 08:55",
      outageEnd: "09-Sep-2026 09:40",
      outageDuration: "0 h 45 m",
      breakerStatus: "Closed",
      tripCause: "Equipment Fault",
      restorationTime: "09-Sep-2026 09:40",
      operatorRemarks: "Transformer side issue",
      status: "Restored",
    },
    {
      id: "out-8",
      num: "8",
      pss: "RAIPUR PSS",
      feeder: "Feeder 02",
      outageStart: "09-Sep-2026 07:12",
      outageEnd: "—",
      outageDuration: "7 h 16 m",
      breakerStatus: "Tripped",
      tripCause: "Overcurrent",
      restorationTime: "—",
      operatorRemarks: "High fault current - critical",
      status: "Critical",
    },
    {
      id: "out-9",
      num: "9",
      pss: "DURG PSS",
      feeder: "Feeder 06",
      outageStart: "09-Sep-2026 05:48",
      outageEnd: "09-Sep-2026 06:32",
      outageDuration: "0 h 44 m",
      breakerStatus: "Closed",
      tripCause: "Earth Fault",
      restorationTime: "09-Sep-2026 06:32",
      operatorRemarks: "Patrolling completed",
      status: "Restored",
    },
    {
      id: "out-10",
      num: "10",
      pss: "BHILAI PSS",
      feeder: "Feeder 01",
      outageStart: "09-Sep-2026 03:21",
      outageEnd: "09-Sep-2026 04:15",
      outageDuration: "0 h 54 m",
      breakerStatus: "Closed",
      tripCause: "Scheduled",
      restorationTime: "09-Sep-2026 04:15",
      operatorRemarks: "Maintenance completed",
      status: "Restored",
    },
  ],
};
