// Dummy data for the AUTRIXA Distribution SCADA / SOE dashboard template.
//
// Every visible value on the dashboard lives in this file so editing later is
// a matter of changing one constant (or, when the inline-edit layer lands,
// mutating the state that seeds from these defaults).

export interface KpiTile {
  key: string;
  value: string;
  label: string;
  icon: KpiIconKind;
}

export type KpiIconKind =
  | "doc-blue"
  | "alert-red"
  | "alert-amber"
  | "bolt-red"
  | "gear-blue"
  | "refresh-green";

export type EventPriority = "CRITICAL" | "WARNING" | "INFO";

export interface SoeRow {
  id: string;
  num: number;
  date: string;
  time: string;
  msec: string;
  pss: string;
  equipment: string;
  event: string;
  previousState: string;
  newState: string;
  priority: EventPriority;
  quality: string;
  /** true renders "Good" green, false renders "Invalid" red. */
  qualityGood: boolean;
}

export interface DetailRow {
  label: string;
  value: string;
  badge?: EventPriority;
}

export interface FirstOutStep {
  key: string;
  title: string;
  meta: string;
  timestamp: string;
  note: string;
  icon: FirstOutIcon;
  initiating?: boolean;
}

export type FirstOutIcon = "bolt-red" | "gear" | "lock" | "tower";

export type TimelineKind = "critical" | "warning" | "info" | "restoration";

export interface TimelinePoint {
  time: string;
  label: string;
  kind: TimelineKind;
  active?: boolean;
  /** Insert the "/" separator break AFTER this point (visual grouping). */
  breakAfter?: boolean;
}

export interface NavItem {
  key: string;
  label: string;
  icon: NavIcon;
  active?: boolean;
  badge?: string;
}

export type NavIcon =
  | "home"
  | "network"
  | "pss"
  | "alarms"
  | "events"
  | "reports"
  | "trends"
  | "settings";

// ── The data ─────────────────────────────────────────────────────────

export const NAV_ITEMS: NavItem[] = [
  { key: "home", label: "Home", icon: "home" },
  { key: "network", label: "Network", icon: "network" },
  { key: "pss", label: "PSS", icon: "pss" },
  { key: "alarms", label: "Alarms", icon: "alarms", badge: "12" },
  { key: "events", label: "Events", icon: "events", active: true },
  { key: "reports", label: "Reports", icon: "reports" },
  { key: "trends", label: "Trends", icon: "trends" },
  { key: "settings", label: "Settings", icon: "settings" },
];

export const KPI_TILES: KpiTile[] = [
  { key: "total", value: "1,248", label: "Total Events Today", icon: "doc-blue" },
  { key: "critical", value: "18", label: "Critical Events", icon: "alert-red" },
  { key: "comm", value: "6", label: "Communication Failures", icon: "alert-amber" },
  { key: "trips", value: "12", label: "Protection Trips", icon: "bolt-red" },
  { key: "control", value: "42", label: "Control Executions", icon: "gear-blue" },
  { key: "restored", value: "1,170", label: "Restored Events", icon: "refresh-green" },
];

export const SOE_ROWS: SoeRow[] = [
  { id: "r01", num: 1, date: "09-Sep-2026", time: "14:20:51", msec: "123", pss: "PSS-084", equipment: "Bus-1", event: "Earth Fault Start", previousState: "—", newState: "Detected", priority: "CRITICAL", quality: "Good", qualityGood: true },
  { id: "r02", num: 2, date: "09-Sep-2026", time: "14:20:51", msec: "156", pss: "PSS-084", equipment: "Relay RLY-01", event: "Protection Operation", previousState: "Normal", newState: "Operate", priority: "CRITICAL", quality: "Good", qualityGood: true },
  { id: "r03", num: 3, date: "09-Sep-2026", time: "14:20:51", msec: "189", pss: "PSS-084", equipment: "CB-202", event: "Breaker Open", previousState: "Closed", newState: "Open", priority: "CRITICAL", quality: "Good", qualityGood: true },
  { id: "r04", num: 4, date: "09-Sep-2026", time: "14:20:51", msec: "220", pss: "PSS-084", equipment: "Feeder F-03", event: "Feeder De-energized", previousState: "Energized", newState: "De-energized", priority: "CRITICAL", quality: "Good", qualityGood: true },
  { id: "r05", num: 5, date: "09-Sep-2026", time: "14:18:32", msec: "015", pss: "PSS-217", equipment: "CB-105", event: "Breaker Trip", previousState: "Closed", newState: "Open", priority: "CRITICAL", quality: "Good", qualityGood: true },
  { id: "r06", num: 6, date: "09-Sep-2026", time: "14:18:32", msec: "418", pss: "PSS-217", equipment: "Relay RLY-05", event: "Relay Alarm", previousState: "Overcurrent", newState: "—", priority: "WARNING", quality: "Good", qualityGood: true },
  { id: "r07", num: 7, date: "09-Sep-2026", time: "12:44:10", msec: "337", pss: "PSS-101", equipment: "TFR-2", event: "Transformer Alarm", previousState: "High Oil Temperature", newState: "—", priority: "WARNING", quality: "Good", qualityGood: true },
  { id: "r08", num: 8, date: "09-Sep-2026", time: "11:26:17", msec: "884", pss: "PSS-305", equipment: "RTU-03", event: "Communication Failure", previousState: "Online", newState: "Offline", priority: "WARNING", quality: "Invalid", qualityGood: false },
  { id: "r09", num: 9, date: "09-Sep-2026", time: "10:12:05", msec: "261", pss: "PSS-084", equipment: "Feeder F-01", event: "Breaker Close", previousState: "Open", newState: "Closed", priority: "INFO", quality: "Good", qualityGood: true },
  { id: "r10", num: 10, date: "09-Sep-2026", time: "09:46:28", msec: "710", pss: "PSS-133", equipment: "CB-401", event: "Control Execution", previousState: "Remote Close Command", newState: "—", priority: "INFO", quality: "Good", qualityGood: true },
  { id: "r11", num: 11, date: "09-Sep-2026", time: "08:31:14", msec: "092", pss: "PSS-217", equipment: "Bus-2", event: "Bus Fault", previousState: "Detected", newState: "Cleared", priority: "INFO", quality: "Good", qualityGood: true },
  { id: "r12", num: 12, date: "09-Sep-2026", time: "08:31:45", msec: "605", pss: "PSS-217", equipment: "Feeder F-04", event: "Restoration Event", previousState: "De-energized", newState: "Energized", priority: "INFO", quality: "Good", qualityGood: true },
];

export const EVENT_DETAILS: DetailRow[] = [
  { label: "Date & Time (RTU Source)", value: "09-Sep-2026 14:20:51.123" },
  { label: "Date & Time (System Receive)", value: "09-Sep-2026 14:20:51.156" },
  { label: "PSS", value: "PSS-084 - KANKANPURA PSS" },
  { label: "Equipment", value: "Relay RLY-01 (Feeder F-03)" },
  { label: "Event", value: "Protection Operation" },
  { label: "Previous State", value: "Normal" },
  { label: "New State", value: "Operate" },
  { label: "Priority", value: "", badge: "CRITICAL" },
  { label: "Quality", value: "Good" },
  { label: "Fault Type", value: "Earth Fault (L-G)" },
  { label: "Trip Cause", value: "Overcurrent (50/51)" },
  { label: "Relay / IED", value: "Siemens 7SA522" },
  { label: "RTU", value: "RTU-04" },
  { label: "Remarks", value: "Protection operated for earth fault. Initiating event in the sequence." },
];

export const FIRST_OUT_STEPS: FirstOutStep[] = [
  { key: "s1", title: "Earth Fault Start", meta: "Bus-1 (PSS-084)", timestamp: "14:20:51.123", note: "Fault detected", icon: "bolt-red", initiating: true },
  { key: "s2", title: "Relay Trip", meta: "RLY-01 (F-03)", timestamp: "14:20:51.156", note: "Protection operated", icon: "gear" },
  { key: "s3", title: "Breaker Open", meta: "CB-202 (F-03)", timestamp: "14:20:51.189", note: "Breaker opened", icon: "lock" },
  { key: "s4", title: "Feeder De-energized", meta: "Feeder F-03", timestamp: "14:20:51.220", note: "Supply interrupted", icon: "tower" },
];

export const FIRST_OUT_NOTE =
  "AUTRIXA helps identify the initiating cause of cascading trips more effectively than isolated alarms.";

export const TIMELINE_POINTS: TimelinePoint[] = [
  { time: "14:20:51.123", label: "Earth Fault Start", kind: "critical", active: true },
  { time: "14:20:51.156", label: "Relay Trip", kind: "critical" },
  { time: "14:20:51.189", label: "Breaker Open", kind: "critical" },
  { time: "14:20:51.220", label: "Feeder De-energized", kind: "critical", breakAfter: true },
  { time: "14:18:32.015", label: "CB-105 Trip", kind: "critical" },
  { time: "11:26:17.884", label: "Comm. Failure", kind: "warning" },
  { time: "10:12:05.261", label: "CB Close", kind: "info" },
  { time: "08:31:45.605", label: "Restoration", kind: "restoration" },
];

// Header / meta strings pulled out so they are easy to swap later.
export const DASHBOARD_META = {
  brand: "AUTRIXA",
  brandSubtitle: "Distribution SCADA",
  dateTimeLine1: "09 Sep 2026 14:28:36",
  operator: "admin",
  partner: "RS Consultancy",
  partnerTagline: "Reliable | Scalable | Connected",
  breadcrumb: ["Home", "Events", "SEQUENCE OF EVENTS (SOE)"],
  pageTitle: "SEQUENCE OF EVENTS (SOE)",
  pageSubtitle: "High-Resolution Chronological Event Viewer",
  scopeTags: ["Distribution SCADA", "All PSS", "System Wide"],
  soeSummaryTitle: "SOE Summary (Today : 09-Sep-2026)",
  soeListTitle: "SOE Event List",
  soeListSubtitle: "(Showing 1 - 12 of 12 events)",
  filtersTitle: "Event Filters",
  detailsTitle: "Selected Event Details",
  firstOutTitle: "First-Out Analysis",
  firstOutSubtitle: "(Cascading Event Sequence)",
  firstOutBadge: "FIRST-OUT (INITIATING EVENT)",
  chronologyTitle: "Event Chronology",
  chronologySubtitle: "(Timeline View)",
  dateFromValue: "09-Sep-2026",
  dateToValue: "09-Sep-2026",
} as const;
