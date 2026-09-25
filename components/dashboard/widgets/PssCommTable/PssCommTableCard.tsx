"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import {
  ColumnResizer,
  Editable,
  EditableCell,
  Group,
  NumberField,
  PanelButton,
  PanelColumn,
  SelectField,
  SettingsShell,
  Slider,
  Swatch,
  TablePager,
  Toggle,
  TRANSITION_MS,
  TRANSITION_OPTIONS,
  fitColumnWidth,
  loadStoredConfig,
  usePaging,
  type TransitionStyle,
} from "../tableShared";
import {
  COMMAND_STYLES,
  CONNECTION_STYLES,
  DEFAULT_PSS_COMM,
  LINK_COLORS,
  QUALITY_STYLES,
  TCP_COLORS,
  generatePssData,
  pssCellKey,
  rawCellValue,
  type PssColumnConfig,
  type PssColumnId,
  type PssCommConfig,
} from "./types";

interface PssCommTableCardProps {
  defaultConfig?: PssCommConfig;
  storageKey?: string;
  editable?: boolean;
  onChange?: (config: PssCommConfig) => void;
}

/** Latency at or above this is called out in red — a link that slow is degraded. */
const LATENCY_WARN_MS = 300;

/**
 * PSS communication status / live link viewer.
 *
 * Shares the resizer, inline header editor and settings primitives with the
 * SCADA time-series table, but renders status as colour-coded badges and
 * derives its banner counts from the rows so the two can never disagree.
 */
export function PssCommTableCard({
  defaultConfig = DEFAULT_PSS_COMM,
  storageKey = "widget.psscomm.v1",
  editable = true,
  onChange,
}: PssCommTableCardProps) {
  const [config, setConfig] = useState<PssCommConfig>(() =>
    loadStoredConfig(storageKey, defaultConfig)
  );
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(config));
    } catch {
      // storage full / disabled — silently skip
    }
    onChange?.(config);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, storageKey]);

  function patch<K extends keyof PssCommConfig>(key: K, value: PssCommConfig[K]) {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }

  function patchColumn(id: string, changes: Partial<PssColumnConfig>) {
    setConfig((prev) => ({
      ...prev,
      columns: prev.columns.map((c) => (c.id === id ? { ...c, ...changes } : c)),
    }));
  }

  /** Records a hand-edited body cell. */
  function setCell(key: string, value: string) {
    setConfig((prev) => ({
      ...prev,
      cellOverrides: { ...prev.cellOverrides, [key]: value },
    }));
  }

  // Each table samples its own window — the control lives in this card.
  const activeDate = config.date;

  // Regenerated only when the date or row count changes — not on every
  // keystroke while a header is being renamed.
  const data = useMemo(
    () => generatePssData(activeDate, config.rowCount),
    [activeDate, config.rowCount]
  );

  const paging = usePaging(
    data.rows,
    config.pageSize,
    config.transition,
    config.paginate
  );

  const totalWidth = config.columns.reduce((sum, c) => sum + c.width, 0);


  return (
    <div
      className="relative flex h-full w-full flex-col overflow-hidden rounded-lg"
      style={{ backgroundColor: config.cellBg }}
    >
      {config.showTitle && (
        <div
          className="flex shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-1 px-3 py-2"
          style={{ backgroundColor: config.bannerBg, color: config.bannerText }}
        >
          <div className="flex min-w-0 items-center gap-1.5 text-[13px] font-semibold">
            <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12.55a11 11 0 0 1 14.08 0" />
              <path d="M1.42 9a16 16 0 0 1 21.16 0" />
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
              <line x1="12" y1="20" x2="12.01" y2="20" />
            </svg>
            <Editable
              value={config.title}
              onChange={(v) => patch("title", v || "Communication Status")}
              editable={editable}
              color={config.bannerText}
            />
            <span className="shrink-0 text-[11px] font-normal opacity-80">
              <Editable
                value={config.subtitle}
                onChange={(v) => patch("subtitle", v)}
                editable={editable}
                color={config.bannerText}
              />
            </span>
            <span className="shrink-0 pl-1 text-[10px] font-normal">
              <DateFilter config={config} patch={patch} />
            </span>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] tabular-nums">
            <span>Total Records: {data.rows.length}</span>
            <span aria-hidden className="opacity-40">|</span>
            <span>Connected: {data.connected}</span>
            <span aria-hidden className="opacity-40">|</span>
            <span>Disconnected: {data.disconnected}</span>
            <span aria-hidden className="opacity-40">|</span>
            <span>Partial: {data.partial}</span>
            {config.showAutoRefresh && (
              <>
                <span aria-hidden className="opacity-40">|</span>
                <span>Auto Refresh: ON ({config.autoRefreshSeconds} s)</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Fallback placement: with the banner hidden the date would otherwise
          have nowhere to live. */}
      {!config.showTitle && (
        <div
          className="flex shrink-0 items-center gap-2 px-3 py-1.5 text-[10px]"
          style={{
            backgroundColor: config.headerBg,
            color: config.headerText,
            borderBottom: `1px solid ${config.borderColor}`,
          }}
        >
          <DateFilter config={config} patch={patch} />
        </div>
      )}

      {/* Fitting means no sideways scroll by design — hiding overflow-x also
          swallows the sub-pixel rounding left over from percentage columns,
          which would otherwise show a scrollbar for a few stray pixels. */}
      <div
        className={`min-h-0 flex-1 overflow-y-auto ${
          config.fitToWidth ? "overflow-x-hidden" : "overflow-x-auto"
        }`}
      >
        <table
          className="border-collapse"
          style={
            {
              // Fixed layout so a dragged column width is honoured exactly
              // instead of being renegotiated by content.
              tableLayout: "fixed",
              width: config.fitToWidth ? "100%" : Math.max(totalWidth, 0),
              minWidth: "100%",
              fontSize: config.fontSize,
              "--tbl-dir": paging.direction,
              "--tbl-ms": `${TRANSITION_MS}ms`,
            } as CSSProperties
          }
        >
          <colgroup>
            {config.columns.map((c) => (
              <col
                key={c.id}
                style={{
                  width: fitColumnWidth(c.width, totalWidth, config.fitToWidth),
                }}
              />
            ))}
          </colgroup>

          <thead className="sticky top-0 z-10">
            <tr>
              {config.columns.map((col) => (
                <th
                  key={col.id}
                  className="relative px-2 font-semibold"
                  style={{
                    height: config.rowHeight,
                    backgroundColor: config.headerBg,
                    color: config.headerText,
                    border: `1px solid ${config.borderColor}`,
                    textAlign: col.align,
                  }}
                >
                  <Editable
                    value={col.label}
                    onChange={(v) => patchColumn(col.id, { label: v || col.id })}
                    editable={editable}
                    color={config.headerText}
                  />
                  {editable && (
                    <ColumnResizer
                      width={col.width}
                      onResize={(w) => patchColumn(col.id, { width: w })}
                      color={config.borderColor}
                    />
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {paging.pageRows.map((row, indexInPage) => {
              // Absolute position in the full roster: cell overrides and React
              // keys must not shift when the page changes.
              const index = paging.offset + indexInPage;
              return (
              <tr
                key={index}
                className={paging.rowClass}
                style={{
                  backgroundColor:
                    config.stripeBg && index % 2 === 1
                      ? config.stripeBg
                      : config.cellBg,
                  animationDelay: `${paging.rowDelay(indexInPage)}ms`,
                }}
              >
                {config.columns.map((col) => {
                  const key = pssCellKey(activeDate, index, col.id);
                  const value = config.cellOverrides[key] ?? rawCellValue(row, col.id);
                  return (
                    <td
                      key={col.id}
                      className="truncate px-2"
                      style={{
                        height: config.rowHeight,
                        color: config.cellText,
                        border: `1px solid ${config.borderColor}`,
                        textAlign: col.align,
                      }}
                    >
                      <EditableCell
                        value={value}
                        onChange={(v) => setCell(key, v)}
                        editable={editable}
                        color={config.cellText}
                        align={col.align}
                      >
                        <Cell value={value} col={col} />
                      </EditableCell>
                    </td>
                  );
                })}
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {config.paginate && (
        <TablePager
          paging={paging}
          background={config.headerBg}
          color={config.headerText}
          borderColor={config.borderColor}
        />
      )}

      {editable && (
        <button
          type="button"
          onClick={() => setPanelOpen((v) => !v)}
          title="Table settings"
          aria-label="Table settings"
          className={`nodrag nopan absolute bottom-2 right-2 z-20 flex h-6 w-6 items-center justify-center rounded-full shadow transition-colors ${
            panelOpen ? "bg-blue-500 text-white" : "bg-white/90 text-zinc-600 hover:bg-white"
          }`}
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
          </svg>
        </button>
      )}

      {editable && panelOpen && (
        <SettingsPanel
          config={config}
          patch={patch}
          onClearCells={() => patch("cellOverrides", {})}
          onReset={() => {
            setConfig(defaultConfig);
            try {
              window.localStorage.removeItem(storageKey);
            } catch {
              // ignore
            }
          }}
          onClose={() => setPanelOpen(false)}
        />
      )}
    </div>
  );
}

// ── Snapshot date control ─────────────────────────────────────────────

function DateFilter({
  config,
  patch,
}: {
  config: PssCommConfig;
  patch: <K extends keyof PssCommConfig>(key: K, value: PssCommConfig[K]) => void;
}) {
  return (
    <label className="flex items-center gap-1 whitespace-nowrap">
      Date
      <input
        type="date"
        value={config.date}
        onChange={(e) => patch("date", e.target.value)}
        className="nodrag nopan rounded border px-1 py-[1px] text-[10px] leading-4"
        // Body colours, not banner colours: keeps the control legible
        // whatever the user sets the banner to.
        style={{
          backgroundColor: config.cellBg,
          color: config.cellText,
          borderColor: config.borderColor,
        }}
      />
    </label>
  );
}

// ── Cell rendering ────────────────────────────────────────────────────

function Badge({ text, bg, fg }: { text: string; bg: string; fg: string }) {
  return (
    <span
      className="inline-block max-w-full truncate rounded px-1.5 py-[1px] text-[0.9em] font-semibold leading-tight"
      style={{ backgroundColor: bg, color: fg }}
    >
      {text}
    </span>
  );
}

/**
 * Renders one body cell from its *current* text.
 *
 * It works off a string rather than the typed row because any cell can be
 * hand-edited. A status that still matches a known value keeps its badge or
 * colour; anything else falls back to plain text rather than rendering a
 * badge with an undefined palette.
 */
function Cell({ value, col }: { value: string; col: PssColumnConfig }) {
  const badge = BADGE_PALETTES[col.id]?.[value];
  if (badge) return <Badge text={value} bg={badge.bg} fg={badge.fg} />;

  const textColor = TEXT_PALETTES[col.id]?.[value];
  if (textColor) {
    return <span style={{ color: textColor, fontWeight: 600 }}>{value}</span>;
  }

  if (col.id === "latency") {
    // Flag slow links in red; "-" (no link at all) stays neutral.
    const ms = Number(value);
    const slow = value.trim() !== "" && Number.isFinite(ms) && ms >= LATENCY_WARN_MS;
    return (
      <span
        className="tabular-nums"
        style={slow ? { color: "#dc2626", fontWeight: 700 } : undefined}
      >
        {value}
      </span>
    );
  }

  if (col.id === "failedAttempts") {
    const count = Number(value);
    const failing = Number.isFinite(count) && count > 0;
    return (
      <span
        className="tabular-nums"
        style={failing ? { color: "#dc2626", fontWeight: 700 } : undefined}
      >
        {value}
      </span>
    );
  }

  if (col.id === "index") return <span className="tabular-nums">{value}</span>;

  return <>{value}</>;
}

/** Columns whose known values render as a filled badge. */
const BADGE_PALETTES: Partial<
  Record<PssColumnId, Record<string, { bg: string; fg: string }>>
> = {
  connectionStatus: CONNECTION_STYLES,
  dataQuality: QUALITY_STYLES,
  commandResponse: COMMAND_STYLES,
};

/** Columns whose known values render as coloured text instead. */
const TEXT_PALETTES: Partial<Record<PssColumnId, Record<string, string>>> = {
  iecLink: LINK_COLORS,
  tcpStatus: TCP_COLORS,
};

// ── Settings panel ────────────────────────────────────────────────────

interface SettingsPanelProps {
  config: PssCommConfig;
  patch: <K extends keyof PssCommConfig>(key: K, value: PssCommConfig[K]) => void;
  onClearCells: () => void;
  onReset: () => void;
  onClose: () => void;
}

/**
 * Same three-column shape as the SCADA table's panel — colour, sizing, paging.
 * This table has more colours (it has a banner as well as a header), so the
 * feed settings move across to keep the columns level.
 */
function SettingsPanel({
  config,
  patch,
  onClearCells,
  onReset,
  onClose,
}: SettingsPanelProps) {
  const editedCells = Object.keys(config.cellOverrides).length;

  return (
    <SettingsShell
      title="Table settings"
      onReset={onReset}
      onClose={onClose}
      hint={
        <>
          Double-click any header or cell to edit it · drag a header&apos;s
          right edge to resize that column · Previous / Next turn the page.
        </>
      }
    >
      <PanelColumn>
        <Group label="Colours">
          <Swatch
            label="Banner bg"
            value={config.bannerBg}
            onChange={(v) => patch("bannerBg", v)}
          />
          <Swatch
            label="Banner text"
            value={config.bannerText}
            onChange={(v) => patch("bannerText", v)}
          />
          <Swatch
            label="Header bg"
            value={config.headerBg}
            onChange={(v) => patch("headerBg", v)}
          />
          <Swatch
            label="Header text"
            value={config.headerText}
            onChange={(v) => patch("headerText", v)}
          />
          <Swatch
            label="Cell bg"
            value={config.cellBg}
            onChange={(v) => patch("cellBg", v)}
          />
          <Swatch
            label="Cell text"
            value={config.cellText}
            onChange={(v) => patch("cellText", v)}
          />
          <Swatch
            label="Stripe"
            value={config.stripeBg}
            onChange={(v) => patch("stripeBg", v)}
          />
          <Swatch
            label="Border"
            value={config.borderColor}
            onChange={(v) => patch("borderColor", v)}
          />
        </Group>
      </PanelColumn>

      <PanelColumn>
        <Group label="Size">
          <Slider
            label="Row height"
            value={config.rowHeight}
            suffix="px"
            min={22}
            max={64}
            onChange={(v) => patch("rowHeight", v)}
          />
          <Slider
            label="Font size"
            value={config.fontSize}
            suffix="px"
            min={9}
            max={20}
            onChange={(v) => patch("fontSize", v)}
          />
        </Group>

        <Group label="Feed">
          <NumberField
            label="Total rows"
            value={config.rowCount}
            min={1}
            max={200}
            onChange={(v) => patch("rowCount", v)}
          />
          <Toggle
            label="Show auto refresh"
            checked={config.showAutoRefresh}
            onChange={(v) => patch("showAutoRefresh", v)}
          />
          <NumberField
            label="Auto refresh (s)"
            value={config.autoRefreshSeconds}
            min={5}
            max={600}
            disabled={!config.showAutoRefresh}
            onChange={(v) => patch("autoRefreshSeconds", v)}
          />
        </Group>
      </PanelColumn>

      <PanelColumn>
        <Group label="Paging">
          <Toggle
            label="Paginate rows"
            checked={config.paginate}
            onChange={(v) => patch("paginate", v)}
          />
          <NumberField
            label="Rows per page"
            value={config.pageSize}
            min={1}
            max={100}
            disabled={!config.paginate}
            onChange={(v) => patch("pageSize", v)}
          />
          <SelectField
            label="Transition"
            value={config.transition}
            options={TRANSITION_OPTIONS}
            disabled={!config.paginate}
            onChange={(v) => patch("transition", v as TransitionStyle)}
          />
        </Group>

        <Group label="Options">
          <Toggle
            label="Fit columns to width"
            checked={config.fitToWidth}
            onChange={(v) => patch("fitToWidth", v)}
          />
          <Toggle
            label="Show title bar"
            checked={config.showTitle}
            onChange={(v) => patch("showTitle", v)}
          />
          <PanelButton disabled={editedCells === 0} onClick={onClearCells}>
            Clear cell edits{editedCells > 0 ? ` (${editedCells})` : ""}
          </PanelButton>
        </Group>
      </PanelColumn>
    </SettingsShell>
  );
}
