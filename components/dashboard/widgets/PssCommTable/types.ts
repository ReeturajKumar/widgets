// Config and dummy data for the PSS communication-status table.
//
// Unlike the weather table this is a *status* view: a fixed roster of remote
// terminal units whose link health, latency and command response are shown as
// colour-coded badges rather than numbers on a curve.

import type { TransitionStyle } from "../tableShared";

export type CommStatus = "Connected" | "Disconnected" | "Partial";
export type LinkStatus = "Established" | "Not Connected";
export type TcpStatus = "Healthy" | "Down" | "Intermittent";
export type QualityStatus =
  | "Good"
  | "Not Connected"
  | "Stale Data"
  | "Out of Date"
  | "Invalid";
export type CommandStatus = "Normal" | "Failed" | "Delayed";

export type PssColumnId =
  | "index"
  | "pss"
  | "rtuId"
  | "gatewayId"
  | "connectionStatus"
  | "iecLink"
  | "tcpStatus"
  | "lastUpdate"
  | "dataRefresh"
  | "latency"
  | "failedAttempts"
  | "dataQuality"
  | "commandResponse"
  | "remarks";

export interface PssColumnConfig {
  id: PssColumnId;
  label: string;
  width: number;
  align: "left" | "center" | "right";
}

export interface PssCommConfig {
  title: string;
  subtitle: string;
  showTitle: boolean;
  /** How many RTUs to render; the roster repeats with suffixes past its length. */
  rowCount: number;
  autoRefreshSeconds: number;
  showAutoRefresh: boolean;
  columns: PssColumnConfig[];

  /** This widget's own snapshot date — every table owns its date; there is
   *  no board-wide filter. */
  date: string;

  /**
   * Hand-edited body cells, keyed by {@link pssCellKey}.
   *
   * The roster is generated, so an edit cannot be written back into the data —
   * it is stored as an override and applied on top at render time. The key
   * carries the date because another day is a different snapshot.
   */
  cellOverrides: Record<string, string>;

  /**
   * Scale the columns to fit the card instead of scrolling sideways.
   *
   * Column widths become ratios rather than fixed pixels, so the table
   * reflows as the node is resized.
   */
  fitToWidth: boolean;

  // ── Paging ──
  paginate: boolean;
  pageSize: number;
  transition: TransitionStyle;

  // ── Styling ──
  bannerBg: string;
  bannerText: string;
  headerBg: string;
  headerText: string;
  cellBg: string;
  cellText: string;
  borderColor: string;
  stripeBg: string;
  rowHeight: number;
  fontSize: number;
}

export function todayIso(): string {
  const now = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`;
}

export const DEFAULT_PSS_COMM: PssCommConfig = {
  title: "PSS Communication Status / Live Link Viewer",
  subtitle: "(Latest First)",
  showTitle: true,
  rowCount: 10,
  autoRefreshSeconds: 30,
  showAutoRefresh: true,
  date: todayIso(),
  cellOverrides: {},
  fitToWidth: true,
  paginate: true,
  pageSize: 8,
  transition: "slide",
  columns: [
    { id: "index", label: "#", width: 40, align: "center" },
    { id: "pss", label: "PSS", width: 148, align: "left" },
    { id: "rtuId", label: "RTU ID", width: 76, align: "center" },
    { id: "gatewayId", label: "Gateway ID", width: 96, align: "center" },
    { id: "connectionStatus", label: "Connection Status", width: 132, align: "center" },
    { id: "iecLink", label: "IEC-104 Link", width: 118, align: "center" },
    { id: "tcpStatus", label: "TCP/IP Status", width: 112, align: "center" },
    { id: "lastUpdate", label: "Last Update", width: 150, align: "center" },
    { id: "dataRefresh", label: "Data Refresh", width: 100, align: "center" },
    { id: "latency", label: "Latency (ms)", width: 100, align: "center" },
    { id: "failedAttempts", label: "Failed Attempts", width: 112, align: "center" },
    { id: "dataQuality", label: "Data Quality", width: 116, align: "center" },
    { id: "commandResponse", label: "Command Response", width: 140, align: "center" },
    { id: "remarks", label: "Remarks", width: 150, align: "left" },
  ],
  bannerBg: "#1e40af",
  bannerText: "#ffffff",
  headerBg: "#eff3f9",
  headerText: "#1e293b",
  cellBg: "#ffffff",
  cellText: "#334155",
  borderColor: "#dbe3ed",
  stripeBg: "",
  rowHeight: 30,
  fontSize: 11,
};

export interface PssRow {
  index: number;
  pss: string;
  rtuId: string;
  gatewayId: string;
  connectionStatus: CommStatus;
  iecLink: LinkStatus;
  tcpStatus: TcpStatus;
  lastUpdate: string;
  dataRefresh: string;
  latency: string;
  failedAttempts: number;
  dataQuality: QualityStatus;
  commandResponse: CommandStatus;
  remarks: string;
}

export interface PssCommData {
  rows: PssRow[];
  connected: number;
  disconnected: number;
  partial: number;
}

const STATIONS = [
  "KANKANPURA PSS",
  "BILASPUR PSS",
  "RAIPUR PSS",
  "DURG PSS",
  "BHILAI PSS",
];

// Seeded, not random: the same date must produce the same snapshot, or every
// keystroke while renaming a header would reshuffle the whole table.
function hashString(input: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Formats an ISO date plus a time-of-day into the banner's display form. */
function stamp(date: string, rand: () => number): string {
  const [y, m, d] = date.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const hh = 8 + Math.floor(rand() * 10);
  const mm = Math.floor(rand() * 60);
  const ss = Math.floor(rand() * 60);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d}-${months[Number(m) - 1]}-${y} ${p(hh)}:${p(mm)}:${p(ss)}`;
}

/**
 * Builds a roster of RTU link states for `date`.
 *
 * The summary counts are derived from the rows rather than being fixed
 * numbers, so the banner can never contradict the table beneath it.
 */
export function generatePssData(date: string, rowCount: number): PssCommData {
  const rand = mulberry32(hashString(`pss|${date}|${rowCount}`));
  const rows: PssRow[] = [];

  for (let i = 0; i < rowCount; i += 1) {
    const cycle = Math.floor(i / STATIONS.length);
    const station = STATIONS[i % STATIONS.length];
    const name = cycle === 0 ? station : `${station} ${cycle + 1}`;

    // Mostly healthy, with a scatter of degraded and dead links.
    const roll = rand();
    const status: CommStatus =
      roll > 0.85 ? "Disconnected" : roll > 0.7 ? "Partial" : "Connected";

    const connected = status === "Connected";
    const partial = status === "Partial";
    const down = status === "Disconnected";

    const latencyMs = connected
      ? Math.floor(30 + rand() * 100)
      : partial
        ? Math.floor(380 + rand() * 520)
        : 0;

    rows.push({
      index: i + 1,
      pss: name,
      rtuId: `RTU-${String(i + 1).padStart(2, "0")}`,
      gatewayId: `GW-${String(Math.floor(i / 2) + 1).padStart(2, "0")}`,
      connectionStatus: status,
      iecLink: down ? "Not Connected" : "Established",
      tcpStatus: down ? "Down" : partial ? "Intermittent" : "Healthy",
      lastUpdate: stamp(date, rand),
      dataRefresh: down ? "-" : partial ? "30 s" : rand() > 0.6 ? "10 s" : "5 s",
      latency: down ? "-" : String(latencyMs),
      failedAttempts: down
        ? Math.floor(6 + rand() * 8)
        : partial
          ? Math.floor(2 + rand() * 4)
          : rand() > 0.75
            ? 1
            : 0,
      dataQuality: down
        ? rand() > 0.5
          ? "Not Connected"
          : "Invalid"
        : partial
          ? rand() > 0.5
            ? "Stale Data"
            : "Out of Date"
          : "Good",
      commandResponse: down ? "Failed" : partial ? "Delayed" : "Normal",
      remarks: down
        ? rand() > 0.5
          ? "Comm. link down"
          : "No response"
        : partial
          ? rand() > 0.5
            ? "High latency"
            : "Some points stale"
          : "-",
    });
  }

  return {
    rows,
    connected: rows.filter((r) => r.connectionStatus === "Connected").length,
    disconnected: rows.filter((r) => r.connectionStatus === "Disconnected").length,
    partial: rows.filter((r) => r.connectionStatus === "Partial").length,
  };
}

/** Stable identity for one generated cell. Uses the row's ordinal rather than
 *  its RTU ID, so editing the RTU ID column does not orphan that row's other
 *  edits. */
export function pssCellKey(
  date: string,
  rowIndex: number,
  columnId: string
): string {
  return `${date}|${rowIndex}|${columnId}`;
}

/** The raw text a cell shows before any override is applied. */
export function rawCellValue(row: PssRow, columnId: PssColumnId): string {
  return String(row[columnId]);
}

// ── Badge palettes ───────────────────────────────────────────────────

export const CONNECTION_STYLES: Record<CommStatus, { bg: string; fg: string }> = {
  Connected: { bg: "#16a34a", fg: "#ffffff" },
  Disconnected: { bg: "#dc2626", fg: "#ffffff" },
  Partial: { bg: "#f59e0b", fg: "#ffffff" },
};

export const QUALITY_STYLES: Record<QualityStatus, { bg: string; fg: string }> = {
  Good: { bg: "#16a34a", fg: "#ffffff" },
  "Not Connected": { bg: "#64748b", fg: "#ffffff" },
  "Stale Data": { bg: "#f97316", fg: "#ffffff" },
  "Out of Date": { bg: "#f97316", fg: "#ffffff" },
  Invalid: { bg: "#dc2626", fg: "#ffffff" },
};

export const COMMAND_STYLES: Record<CommandStatus, { bg: string; fg: string }> = {
  Normal: { bg: "#16a34a", fg: "#ffffff" },
  Failed: { bg: "#dc2626", fg: "#ffffff" },
  Delayed: { bg: "#f59e0b", fg: "#ffffff" },
};

/** Plain-text status colours (not badges) for the TCP/IP and link columns. */
export const TCP_COLORS: Record<TcpStatus, string> = {
  Healthy: "#16a34a",
  Down: "#dc2626",
  Intermittent: "#f59e0b",
};

export const LINK_COLORS: Record<LinkStatus, string> = {
  Established: "#334155",
  "Not Connected": "#dc2626",
};
