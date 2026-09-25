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
  TRANSITION_OPTIONS,
  TRANSITION_MS,
  fitColumnWidth,
  loadStoredConfig,
  usePaging,
  type TransitionStyle,
} from "../tableShared";
import {
  DEFAULT_SCADA_TABLE,
  INTERVAL_OPTIONS,
  cellKey,
  generateTableData,
  type ColumnConfig,
  type IntervalMinutes,
  type ScadaTableConfig,
  type TableRow,
} from "./types";

interface ScadaTableCardProps {
  defaultConfig?: ScadaTableConfig;
  storageKey?: string;
  editable?: boolean;
  onChange?: (config: ScadaTableConfig) => void;
}

/**
 * Resizable SCADA time-series table.
 *
 * - The node itself resizes via the board's NodeResizer; the table fills it
 *   and scrolls, with the header pinned.
 * - Each column resizes by dragging the divider on its header's right edge.
 * - Header text is editable in place (double-click).
 * - The ⚙ panel covers colours, row height, font size and the data window.
 * - Data is regenerated whenever the date or interval changes — from the board
 *   toolbar by default, or from the widget's own pickers when it opts out.
 */
export function ScadaTableCard({
  defaultConfig = DEFAULT_SCADA_TABLE,
  storageKey = "widget.scadatable.v1",
  editable = true,
  onChange,
}: ScadaTableCardProps) {
  const [config, setConfig] = useState<ScadaTableConfig>(() =>
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

  function patch<K extends keyof ScadaTableConfig>(
    key: K,
    value: ScadaTableConfig[K]
  ) {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }

  function patchColumn(id: string, changes: Partial<ColumnConfig>) {
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

  // Each table samples its own window — the controls live in this card.
  const activeDate = config.date;
  const activeInterval = config.interval;

  // Regenerated only when the window changes — not on every keystroke while a
  // header is being edited.
  const { rows, totalRows, truncated } = useMemo(
    () => generateTableData(activeDate, activeInterval),
    [activeDate, activeInterval]
  );

  const paging = usePaging(
    rows,
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
      {/* Sampling-window controls. They ride in the title bar so they cost no
          extra vertical space; when the title bar is hidden they fall back to
          a row of their own, so the date can always be reached. */}
      {config.showTitle ? (
        <div
          className="flex shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-1 px-3 py-1.5"
          style={{
            backgroundColor: config.headerBg,
            borderBottom: `1px solid ${config.borderColor}`,
          }}
        >
          <div
            className="flex min-w-0 items-center gap-2 text-[13px] font-semibold"
            style={{ color: config.headerText }}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="#2dd4bf" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.5 19a4.5 4.5 0 0 0 0-9 6 6 0 0 0-11.6-1.6A4 4 0 0 0 6.5 19Z" />
            </svg>
            <Editable
              value={config.title}
              onChange={(v) => patch("title", v || "Table")}
              editable={editable}
              color={config.headerText}
            />
          </div>

          <div
            className="flex shrink-0 items-center gap-2.5 text-[10px]"
            style={{ color: config.headerText }}
          >
            <Filters config={config} patch={patch} />
            <span className="tabular-nums opacity-70">
              {truncated ? `${rows.length} of ${totalRows}` : `${rows.length}`}{" "}
              rows
            </span>
          </div>
        </div>
      ) : (
        <div
          className="flex shrink-0 items-center gap-2.5 px-3 py-1.5 text-[10px]"
          style={{
            backgroundColor: config.headerBg,
            color: config.headerText,
            borderBottom: `1px solid ${config.borderColor}`,
          }}
        >
          <Filters config={config} patch={patch} />
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
                  className="group/col relative px-2 font-semibold"
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
              // Absolute position in the full list: cell overrides and React
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
                  const key = cellKey(activeDate, activeInterval, index, col.id);
                  const text = config.cellOverrides[key] ?? formatCell(row, col);
                  return (
                    <td
                      key={col.id}
                      className="truncate px-2 tabular-nums"
                      style={{
                        height: config.rowHeight,
                        color: config.cellText,
                        border: `1px solid ${config.borderColor}`,
                        textAlign: col.align,
                      }}
                    >
                      <EditableCell
                        value={text}
                        onChange={(v) => setCell(key, v)}
                        editable={editable}
                        color={config.cellText}
                        align={col.align}
                      >
                        {text}
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

      {/* Settings */}
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

// ── Sampling window controls ──────────────────────────────────────────

function Filters({
  config,
  patch,
}: {
  config: ScadaTableConfig;
  patch: <K extends keyof ScadaTableConfig>(
    key: K,
    value: ScadaTableConfig[K]
  ) => void;
}) {
  // Body colours, not header colours: guarantees the controls stay legible
  // whatever the user sets the header to.
  const control: CSSProperties = {
    backgroundColor: config.cellBg,
    color: config.cellText,
    borderColor: config.borderColor,
  };
  const className =
    "nodrag nopan rounded border px-1 py-[1px] text-[10px] leading-4";

  return (
    <>
      <label className="flex items-center gap-1 whitespace-nowrap">
        Date
        <input
          type="date"
          value={config.date}
          onChange={(e) => patch("date", e.target.value)}
          className={className}
          style={control}
        />
      </label>
      <label className="flex items-center gap-1 whitespace-nowrap">
        Interval
        <select
          value={config.interval}
          onChange={(e) =>
            patch("interval", Number(e.target.value) as IntervalMinutes)
          }
          className={className}
          style={control}
        >
          {INTERVAL_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
    </>
  );
}

function formatCell(row: TableRow, col: ColumnConfig): string {
  const value = row[col.id];
  if (typeof value === "string") return value;
  return value.toFixed(col.decimals);
}

// ── Settings panel ────────────────────────────────────────────────────

interface SettingsPanelProps {
  config: ScadaTableConfig;
  patch: <K extends keyof ScadaTableConfig>(
    key: K,
    value: ScadaTableConfig[K]
  ) => void;
  onClearCells: () => void;
  onReset: () => void;
  onClose: () => void;
}

/**
 * Three columns of roughly equal height: colour on the left, sizing in the
 * middle, paging on the right. Grouping by *kind* rather than by where the
 * setting happens to live in the config is what keeps the columns balanced.
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

        <Group label="Data">
          <PanelButton disabled={editedCells === 0} onClick={onClearCells}>
            Clear cell edits{editedCells > 0 ? ` (${editedCells})` : ""}
          </PanelButton>
        </Group>
      </PanelColumn>
    </SettingsShell>
  );
}
