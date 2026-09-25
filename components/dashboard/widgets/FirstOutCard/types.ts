// Config shape for the FirstOutCard widget.

export type FirstOutIconKind =
  | "bolt-red"
  | "bolt-amber"
  | "gear"
  | "lock"
  | "tower"
  | "alert"
  | "relay"
  | "breaker"
  | "feeder"
  | "transformer"
  | "restoration";

export const FIRST_OUT_ICON_KINDS: FirstOutIconKind[] = [
  "bolt-red",
  "bolt-amber",
  "gear",
  "lock",
  "tower",
  "alert",
  "relay",
  "breaker",
  "feeder",
  "transformer",
  "restoration",
];

export interface FirstOutStepConfig {
  id: string;
  title: string;
  meta: string;
  timestamp: string;
  note: string;
  icon: FirstOutIconKind;
  /**
   * A custom image used instead of `icon` — an uploaded data URL or a remote
   * image URL. When unset, the built-in `icon` kind renders as before.
   */
  iconImage?: string;
  /** If true this step renders with the red "initiating event" badge. */
  initiating?: boolean;
}

export interface FirstOutConfig {
  title: string;
  subtitle: string;
  initiatingBadge: string;
  footerNote: string;
  steps: FirstOutStepConfig[];
}

export const DEFAULT_FIRST_OUT: FirstOutConfig = {
  title: "First-Out Analysis",
  subtitle: "(Cascading Event Sequence)",
  initiatingBadge: "FIRST-OUT (INITIATING EVENT)",
  footerNote:
    "AUTRIXA helps identify the initiating cause of cascading trips more effectively than isolated alarms.",
  steps: [
    { id: "s1", title: "Earth Fault Start",    meta: "Bus-1 (PSS-084)",  timestamp: "14:20:51.123", note: "Fault detected",       icon: "bolt-red",   initiating: true },
    { id: "s2", title: "Relay Trip",           meta: "RLY-01 (F-03)",   timestamp: "14:20:51.156", note: "Protection operated",  icon: "relay"                      },
    { id: "s3", title: "Breaker Open",         meta: "CB-202 (F-03)",   timestamp: "14:20:51.189", note: "Breaker opened",       icon: "breaker"                    },
    { id: "s4", title: "Feeder De-energized",  meta: "Feeder F-03",     timestamp: "14:20:51.220", note: "Supply interrupted",   icon: "feeder"                     },
  ],
};

