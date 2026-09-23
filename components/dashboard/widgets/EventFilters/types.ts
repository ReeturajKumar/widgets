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
  pssOptions: ["All PSS", "PSS-084", "PSS-085", "PSS-102", "PSS-118"],
  equipmentLabel: "Equipment",
  equipmentValue: "All Equipment",
  equipmentOptions: ["All Equipment", "Bus-1", "Feeder F-03", "CB-202", "RLY-01", "TR-01"],
  eventTypeLabel: "Event Type",
  eventTypeValue: "All Events",
  eventTypeOptions: ["All Events", "Trip", "Alarm", "Switching", "Diagnostic", "Restoration"],
  priorityLabel: "Priority",
  priorityValue: "All Priorities",
  priorityOptions: ["All Priorities", "CRITICAL", "WARNING", "INFO"],
  qualityLabel: "Quality",
  qualityValue: "All",
  qualityOptions: ["All", "Good", "Suspect", "Inhibited", "Manual"],
  searchLabel: "Search (Equipment / Event / Text)",
  searchPlaceholder: "Type to search...",
  searchValue: "",
  applyButtonLabel: "Apply Filters",
  resetButtonLabel: "Reset",
  exportButtonLabel: "Export",
};
