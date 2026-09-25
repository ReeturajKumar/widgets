// Config shape for the SoeEventList widget.
//
// The entire table — title, subtitle, column headers, and every row — lives
// here so it round-trips through localStorage and the parent can seed it with
// any data it wants.

import type { TransitionStyle } from "../tableShared";

export type EventPriority = "CRITICAL" | "WARNING" | "INFO";

export interface SoeColumnConfig {
  /** Stable key — used for column identity. */
  key: string;
  /** Header label shown in the <th>. */
  label: string;
  /** If true the column is hidden. */
  hidden?: boolean;
}

export interface SoeRowConfig {
  id: string;
  num: string;
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
  qualityGood: boolean;
}

export interface SoeEventListConfig {
  title: string;
  subtitle: string;
  columns: SoeColumnConfig[];
  rows: SoeRowConfig[];

  // ── Presentation ──
  // Defaults reproduce the table's original hard-coded styling exactly, so
  // adding these changed nothing on screen until someone edits them.
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

export const DEFAULT_COLUMNS: SoeColumnConfig[] = [
  { key: "num",           label: "#"              },
  { key: "date",          label: "Date"           },
  { key: "time",          label: "Time"           },
  { key: "msec",          label: "msec"           },
  { key: "pss",           label: "PSS"            },
  { key: "equipment",     label: "Equipment"      },
  { key: "event",         label: "Event"          },
  { key: "previousState", label: "Previous State" },
  { key: "newState",      label: "New State"      },
  { key: "priority",      label: "Priority"       },
  { key: "quality",       label: "Quality"        },
];

export const DEFAULT_SOE_EVENT_LIST: SoeEventListConfig = {
  title: "SOE Event List",
  subtitle: "(Showing 1 - 12 of 12 events)",
  columns: DEFAULT_COLUMNS,
  headerBg: "#eff6ff",
  headerText: "#3f3f46",
  cellBg: "#ffffff",
  cellText: "#3f3f46",
  borderColor: "#f4f4f5",
  stripeBg: "",
  rowHeight: 22,
  fontSize: 10,
  paginate: true,
  pageSize: 10,
  transition: "fade",
  rows: [
    { id: "r01", num: "1",  date: "09-Sep-2026", time: "14:20:51", msec: "123", pss: "PSS-084", equipment: "Bus-1",        event: "Earth Fault Start",      previousState: "—",                    newState: "Detected",     priority: "CRITICAL", quality: "Good",    qualityGood: true  },
    { id: "r02", num: "2",  date: "09-Sep-2026", time: "14:20:51", msec: "156", pss: "PSS-084", equipment: "Relay RLY-01", event: "Protection Operation",   previousState: "Normal",               newState: "Operate",      priority: "CRITICAL", quality: "Good",    qualityGood: true  },
    { id: "r03", num: "3",  date: "09-Sep-2026", time: "14:20:51", msec: "189", pss: "PSS-084", equipment: "CB-202",       event: "Breaker Open",           previousState: "Closed",               newState: "Open",         priority: "CRITICAL", quality: "Good",    qualityGood: true  },
    { id: "r04", num: "4",  date: "09-Sep-2026", time: "14:20:51", msec: "220", pss: "PSS-084", equipment: "Feeder F-03",  event: "Feeder De-energized",    previousState: "Energized",            newState: "De-energized", priority: "CRITICAL", quality: "Good",    qualityGood: true  },
    { id: "r05", num: "5",  date: "09-Sep-2026", time: "14:18:32", msec: "015", pss: "PSS-217", equipment: "CB-105",       event: "Breaker Trip",           previousState: "Closed",               newState: "Open",         priority: "CRITICAL", quality: "Good",    qualityGood: true  },
    { id: "r06", num: "6",  date: "09-Sep-2026", time: "14:18:32", msec: "418", pss: "PSS-217", equipment: "Relay RLY-05", event: "Relay Alarm",            previousState: "Overcurrent",          newState: "—",            priority: "WARNING",  quality: "Good",    qualityGood: true  },
    { id: "r07", num: "7",  date: "09-Sep-2026", time: "12:44:10", msec: "337", pss: "PSS-101", equipment: "TFR-2",        event: "Transformer Alarm",      previousState: "High Oil Temperature", newState: "—",            priority: "WARNING",  quality: "Good",    qualityGood: true  },
    { id: "r08", num: "8",  date: "09-Sep-2026", time: "11:26:17", msec: "884", pss: "PSS-305", equipment: "RTU-03",       event: "Communication Failure",  previousState: "Online",               newState: "Offline",      priority: "WARNING",  quality: "Invalid", qualityGood: false },
    { id: "r09", num: "9",  date: "09-Sep-2026", time: "10:12:05", msec: "261", pss: "PSS-084", equipment: "Feeder F-01",  event: "Breaker Close",          previousState: "Open",                 newState: "Closed",       priority: "INFO",     quality: "Good",    qualityGood: true  },
    { id: "r10", num: "10", date: "09-Sep-2026", time: "09:46:28", msec: "710", pss: "PSS-133", equipment: "CB-401",       event: "Control Execution",      previousState: "Remote Close Command", newState: "—",            priority: "INFO",     quality: "Good",    qualityGood: true  },
    { id: "r11", num: "11", date: "09-Sep-2026", time: "08:31:14", msec: "092", pss: "PSS-217", equipment: "Bus-2",        event: "Bus Fault",              previousState: "Detected",             newState: "Cleared",      priority: "INFO",     quality: "Good",    qualityGood: true  },
    { id: "r12", num: "12", date: "09-Sep-2026", time: "08:31:45", msec: "605", pss: "PSS-217", equipment: "Feeder F-04",  event: "Restoration Event",      previousState: "De-energized",         newState: "Energized",    priority: "INFO",     quality: "Good",    qualityGood: true  },
  ],
};

