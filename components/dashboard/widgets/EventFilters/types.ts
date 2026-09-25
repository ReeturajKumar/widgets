// Config shape for the EventFilters widget.

export interface EventFiltersConfig {
  title: string;
  dateFromLabel: string;
  dateFromValue: string;
  dateToLabel: string;
  dateToValue: string;
  pssLabel: string;
  pssValue: string;
  pssOptions: string[];
  equipmentLabel: string;
  equipmentValue: string;
  equipmentOptions: string[];
  eventTypeLabel: string;
  eventTypeValue: string;
  eventTypeOptions: string[];
  priorityLabel: string;
  priorityValue: string;
  priorityOptions: string[];
  qualityLabel: string;
  qualityValue: string;
  qualityOptions: string[];
  searchLabel: string;
  searchPlaceholder: string;
  searchValue: string;
  applyButtonLabel: string;
  resetButtonLabel: string;
  exportButtonLabel: string;
}

export const DEFAULT_EVENT_FILTERS: EventFiltersConfig = {
  title: "Event Filters",
  dateFromLabel: "Date From",
  dateFromValue: "09-Sep-2026",
  dateToLabel: "Date To",
  dateToValue: "09-Sep-2026",
  pssLabel: "PSS",
  pssValue: "All PSS",
  // These lists must name values that actually occur in the event rows, or a
  // selection filters everything away. They mirror DEFAULT_SOE_EVENT_LIST.
  pssOptions: ["All PSS", "PSS-084", "PSS-101", "PSS-133", "PSS-217", "PSS-305"],
  equipmentLabel: "Equipment",
  equipmentValue: "All Equipment",
  equipmentOptions: [
    "All Equipment", "Bus-1", "Bus-2", "CB-105", "CB-202", "CB-401",
    "Feeder F-01", "Feeder F-03", "Feeder F-04", "Relay RLY-01",
    "Relay RLY-05", "RTU-03", "TFR-2",
  ],
  eventTypeLabel: "Event Type",
  eventTypeValue: "All Events",
  eventTypeOptions: [
    "All Events", "Breaker Close", "Breaker Open", "Breaker Trip", "Bus Fault",
    "Communication Failure", "Control Execution", "Earth Fault Start",
    "Feeder De-energized", "Protection Operation", "Relay Alarm",
    "Restoration Event", "Transformer Alarm",
  ],
  priorityLabel: "Priority",
  priorityValue: "All Priorities",
  priorityOptions: ["All Priorities", "CRITICAL", "WARNING", "INFO"],
  qualityLabel: "Quality",
  qualityValue: "All",
  qualityOptions: ["All", "Good", "Invalid"],
  searchLabel: "Search (Equipment / Event / Text)",
  searchPlaceholder: "Type to search...",
  searchValue: "",
  applyButtonLabel: "Apply Filters",
  resetButtonLabel: "Reset",
  exportButtonLabel: "Export",
};
