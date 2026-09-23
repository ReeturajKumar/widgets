// Config shape for the SelectedEventDetails widget.

export type EventPriority = "CRITICAL" | "WARNING" | "INFO";

export interface DetailFieldRow {
  id: string;
  label: string;
  value: string;
  badge?: EventPriority;
  isQuality?: boolean;
}

export interface SelectedEventDetailsConfig {
  title: string;
  rows: DetailFieldRow[];
}

export const DEFAULT_SELECTED_EVENT_DETAILS: SelectedEventDetailsConfig = {
  title: "Selected Event Details",
  rows: [
    { id: "d1", label: "Date & Time (RTU Source)", value: "09-Sep-2026 14:20:51.123" },
    { id: "d2", label: "Date & Time (System Receive)", value: "09-Sep-2026 14:20:51.156" },
    { id: "d3", label: "PSS", value: "PSS-084 - KANKANPURA PSS" },
    { id: "d4", label: "Equipment", value: "Relay RLY-01 (Feeder F-03)" },
    { id: "d5", label: "Event", value: "Protection Operation" },
    { id: "d6", label: "Previous State", value: "Normal" },
    { id: "d7", label: "New State", value: "Operate" },
    { id: "d8", label: "Priority", value: "CRITICAL", badge: "CRITICAL" },
    { id: "d9", label: "Quality", value: "Good", isQuality: true },
    { id: "d10", label: "Fault Type", value: "Earth Fault (L-G)" },
    { id: "d11", label: "Trip Cause", value: "Overcurrent (50/51)" },
    { id: "d12", label: "Relay / IED", value: "Siemens 7SA522" },
    { id: "d13", label: "RTU", value: "RTU-04" },
    {
      id: "d14",
      label: "Remarks",
      value: "Protection operated for earth fault.\nInitiating event in the sequence.",
    },
  ],
};
