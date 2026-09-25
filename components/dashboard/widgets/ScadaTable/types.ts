// Config and dummy-data generation for the SCADA table widget.
//
// Every visible thing — the columns and their widths, the header text, and the
// full colour/metric styling — lives on the config so the widget can edit
// itself in place and round-trip through localStorage.

import type { TransitionStyle } from "../tableShared";

export type IntervalMinutes = 1 | 5 | 10 | 15 | 30 | 60;

export const INTERVAL_OPTIONS: { value: IntervalMinutes; label: string }[] = [
  { value: 1, label: "1 Minute" },
  { value: 5, label: "5 Minutes" },
  { value: 10, label: "10 Minutes" },
  { value: 15, label: "15 Minutes" },
  { value: 30, label: "30 Minutes" },
  { value: 60, label: "60 Minutes" },
];

/** Which generated metric a column shows. `time` is the timestamp column. */
export type MetricKey =
  | "time"
  | "windSpeed"
  | "windDirection"
  | "ghi"
  | "dni"
  | "dhi"
  | "ambientTemp"
  | "moduleTemp"
  | "humidity"
  | "rainfall";

export interface ColumnConfig {
  /** Stable id — map key, resize target and metric lookup. */
  id: MetricKey;
  /** Header text. Editable in place. */
  label: string;
  /** Rendered width in px; dragging the header edge writes here. */
  width: number;
  align: "left" | "center" | "right";
  /** Decimal places for numeric columns. */
  decimals: number;
}

export interface ScadaTableConfig {
  title: string;
  showTitle: boolean;
  columns: ColumnConfig[];

  // ── Styling ──
  headerBg: string;
  headerText: string;
  cellBg: string;
  cellText: string;
  borderColor: string;
  /** Alternate row tint; empty string disables striping. */
  stripeBg: string;
  rowHeight: number;
  fontSize: number;

  /** Per-widget fallback when the board-level filters are not in use. */
  /** This widget's own sampling window — every table owns its date and
   *  interval; there is no board-wide filter. */
  date: string;
  interval: IntervalMinutes;

  /**
   * Hand-edited body cells, keyed by {@link cellKey}.
   *
   * The rows themselves are generated, so an edit cannot be written back into
   * the data — it is stored as an override and applied on top at render time.
   * The key carries the date and interval because a different sampling window
   * is different data: an edit made to 06:05 at 5-minute spacing should not
   * silently reappear on another day's row.
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
}

/** Stable identity for one generated cell. Uses the row's ordinal rather than
 *  its timestamp, so editing the TIME column does not orphan the row's other
 *  edits. */
export function cellKey(
  date: string,
  interval: IntervalMinutes,
  rowIndex: number,
  columnId: string
): string {
  return `${date}|${interval}|${rowIndex}|${columnId}`;
}

export const DEFAULT_SCADA_TABLE: ScadaTableConfig = {
  title: "Weather Report",
  showTitle: true,
  columns: [
    { id: "time", label: "TIME", width: 92, align: "center", decimals: 0 },
    { id: "windSpeed", label: "WIND SPEED (M/S)", width: 138, align: "center", decimals: 2 },
    { id: "windDirection", label: "WIND DIRECTION (°)", width: 150, align: "center", decimals: 2 },
    { id: "ghi", label: "GHI (W/M²)", width: 112, align: "center", decimals: 2 },
    { id: "dni", label: "DNI (W/M²)", width: 112, align: "center", decimals: 2 },
    { id: "dhi", label: "DHI (W/M²)", width: 112, align: "center", decimals: 2 },
    { id: "ambientTemp", label: "AMBIENT TEMP (°C)", width: 148, align: "center", decimals: 2 },
    { id: "moduleTemp", label: "MODULE TEMP (°C)", width: 146, align: "center", decimals: 2 },
    { id: "humidity", label: "HUMIDITY (%)", width: 120, align: "center", decimals: 2 },
    { id: "rainfall", label: "RAINFALL (MM)", width: 126, align: "center", decimals: 0 },
  ],
  headerBg: "#0f2740",
  headerText: "#e2e8f0",
  cellBg: "#132f4c",
  cellText: "#cbd5e1",
  borderColor: "#1e4a6d",
  stripeBg: "#0e2438",
  rowHeight: 34,
  fontSize: 12,
  date: "2026-09-25",
  interval: 5,
  cellOverrides: {},
  fitToWidth: true,
  paginate: true,
  pageSize: 12,
  transition: "fade",
};

export const COLUMN_MIN_WIDTH = 64;

/** Daylight window the generator samples across. */
const START_HOUR = 6;
const END_HOUR = 18;

/**
 * Row cap. A full 06:00–18:00 day at 1-minute resolution is 720 rows, and
 * every row is ten cells — enough DOM to make scrolling stutter. Past this we
 * truncate and surface the real total in the header, rather than silently
 * rendering a slow table.
 */
export const MAX_ROWS = 300;

export interface TableRow {
  time: string;
  windSpeed: number;
  windDirection: number;
  ghi: number;
  dni: number;
  dhi: number;
  ambientTemp: number;
  moduleTemp: number;
  humidity: number;
  rainfall: number;
}

// ── Deterministic noise ──────────────────────────────────────────────
//
// Seeded rather than random: the same date and interval must produce the same
// table every render, otherwise every keystroke while editing a header would
// reshuffle all the readings underneath.

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

function round(value: number, decimals: number): number {
  const f = 10 ** decimals;
  return Math.round(value * f) / f;
}

export interface GeneratedTable {
  rows: TableRow[];
  /** How many rows the window actually holds, before the MAX_ROWS cap. */
  totalRows: number;
  truncated: boolean;
}

/**
 * Builds a day of plausible plant readings for `date` at `interval` minutes.
 *
 * Irradiance follows a bell over solar noon, temperature a lagging sine, and
 * humidity runs inverse to temperature — so the numbers read like a real site
 * rather than noise. The seeded jitter on top varies by date.
 */
export function generateTableData(
  date: string,
  interval: IntervalMinutes
): GeneratedTable {
  const rand = mulberry32(hashString(`${date}|${interval}`));
  const totalMinutes = (END_HOUR - START_HOUR) * 60;
  const totalRows = Math.floor(totalMinutes / interval) + 1;
  const count = Math.min(totalRows, MAX_ROWS);

  const rows: TableRow[] = [];
  for (let i = 0; i < count; i += 1) {
    const minutes = START_HOUR * 60 + i * interval;
    const hh = Math.floor(minutes / 60);
    const mm = minutes % 60;
    const time = `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;

    // 0 at the window edges, 1 at solar noon.
    const dayFraction = (minutes - START_HOUR * 60) / totalMinutes;
    const solar = Math.max(0, Math.sin(Math.PI * dayFraction));

    const cloud = 0.75 + rand() * 0.25;
    const ghi = solar * 980 * cloud;
    const dni = ghi * (0.86 + rand() * 0.12);
    const dhi = ghi * (0.08 + rand() * 0.07);

    // Temperature lags the sun, so it peaks after noon.
    const ambientTemp =
      23.5 + Math.sin(Math.PI * Math.min(1, dayFraction + 0.12)) * 11 + rand() * 0.8;
    const moduleTemp = ambientTemp + (ghi / 1000) * 18 + rand() * 1.2;
    const humidity = Math.min(98, Math.max(38, 96 - (ambientTemp - 23.5) * 4.2 + rand() * 3));

    rows.push({
      time,
      windSpeed: round(rand() * 19 + 0.4, 2),
      windDirection: round(70 + rand() * 120, 2),
      ghi: round(ghi, 2),
      dni: round(dni, 2),
      dhi: round(dhi, 2),
      ambientTemp: round(ambientTemp, 2),
      moduleTemp: round(moduleTemp, 2),
      humidity: round(humidity, 2),
      rainfall: rand() > 0.96 ? round(rand() * 2.4, 1) : 0,
    });
  }

  return { rows, totalRows, truncated: totalRows > count };
}

/** Today's date as the yyyy-mm-dd a date input expects. */
export function todayIso(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
