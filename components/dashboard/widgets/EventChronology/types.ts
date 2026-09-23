// Config shape for the EventChronology widget.

export type TimelineKind = "critical" | "warning" | "info" | "restoration";

export interface TimelinePointConfig {
  id: string;
  time: string;
  label: string;
  kind: TimelineKind;
  active?: boolean;
  breakAfter?: boolean;
}

export interface EventChronologyConfig {
  title: string;
  subtitle: string;
  criticalLabel: string;
  warningLabel: string;
  infoLabel: string;
  restorationLabel: string;
  olderEventsLabel: string;
  newerEventsLabel: string;
  points: TimelinePointConfig[];
}

export const DEFAULT_EVENT_CHRONOLOGY: EventChronologyConfig = {
  title: "Event Chronology",
  subtitle: "(Timeline View)",
  criticalLabel: "Critical",
  warningLabel: "Warning",
  infoLabel: "Info",
  restorationLabel: "Restoration",
  olderEventsLabel: "← Older Events",
  newerEventsLabel: "Newer Events →",
  points: [
    { id: "p1", time: "14:20:51.123", label: "Earth Fault Start", kind: "critical", active: true },
    { id: "p2", time: "14:20:51.156", label: "Relay Trip", kind: "critical" },
    { id: "p3", time: "14:20:51.189", label: "Breaker Open", kind: "critical" },
    { id: "p4", time: "14:20:51.220", label: "Feeder De-energized", kind: "critical", breakAfter: true },
    { id: "p5", time: "14:18:32.015", label: "CB-105 Trip", kind: "critical" },
    { id: "p6", time: "11:26:17.884", label: "Comm. Failure", kind: "warning" },
    { id: "p7", time: "10:12:05.261", label: "CB Close", kind: "info" },
    { id: "p8", time: "08:31:45.605", label: "Restoration", kind: "restoration" },
  ],
};
