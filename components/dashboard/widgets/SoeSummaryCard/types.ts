// Config shape for the SoeSummaryCard widget.
//
// Every visible string / icon / flag lives here so a parent template can pass a
// specific configuration in and the widget edits itself in place —
// the same object round-trips through localStorage between edits.

export type KpiIconKind =
  | "doc-blue"
  | "alert-red"
  | "alert-amber"
  | "bolt-red"
  | "gear-blue"
  | "refresh-green"
  | "bolt-amber"
  | "bolt-green"
  | "check-green"
  | "wave-blue"
  | "zap-purple"
  | "thermometer-red";

export const KPI_ICON_KINDS: KpiIconKind[] = [
  "doc-blue",
  "alert-red",
  "alert-amber",
  "bolt-red",
  "gear-blue",
  "refresh-green",
  "bolt-amber",
  "bolt-green",
  "check-green",
  "wave-blue",
  "zap-purple",
  "thermometer-red",
];

export interface KpiTileConfig {
  /** Stable id — used as the map key and delete handle. */
  id: string;
  value: string;
  label: string;
  icon: KpiIconKind;
}

export interface SoeSummaryConfig {
  title: string;
  tiles: KpiTileConfig[];
}

export const DEFAULT_SOE_SUMMARY: SoeSummaryConfig = {
  title: "SOE Summary (Today : 09-Sep-2026)",
  tiles: [
    { id: "total",    value: "1,248", label: "Total Events Today",     icon: "doc-blue"      },
    { id: "critical", value: "18",    label: "Critical Events",        icon: "alert-red"     },
    { id: "comm",     value: "6",     label: "Communication Failures", icon: "alert-amber"   },
    { id: "trips",    value: "12",    label: "Protection Trips",       icon: "bolt-red"      },
    { id: "control",  value: "42",    label: "Control Executions",     icon: "gear-blue"     },
    { id: "restored", value: "1,170", label: "Restored Events",        icon: "refresh-green" },
  ],
};

