"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import type { GraphDef } from "./registry";
import type { ChartOverride } from "./types";

interface ChartSettingsProps {
  graph: GraphDef;
  config: ChartOverride;
  onChange: (patch: ChartOverride) => void;
  onClose: () => void;
}

/**
 * Live-editing panel for the axis labels, axis ranges and per-series colours
 * of a chart node. Sits above the node like the theme picker and dismisses on
 * an outside click or Escape.
 */
export function ChartSettings({
  graph,
  config,
  onChange,
  onClose,
}: ChartSettingsProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [openLeft, setOpenLeft] = useState(false);

  useEffect(() => {
    if (!rootRef.current) return;
    const rect = rootRef.current.getBoundingClientRect();
    if (rect.right > window.innerWidth - 12) {
      setOpenLeft(true);
    }
  }, []);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) onClose();
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [onClose]);

  const xLabel = config.xLabel ?? graph.defaultAxes.xLabel;
  const yLabel = config.yLabel ?? graph.defaultAxes.yLabel;
  const xMin = config.xMin ?? graph.defaultAxes.xMin;
  const xMax = config.xMax ?? graph.defaultAxes.xMax;
  const yMin = config.yMin ?? graph.defaultAxes.yMin;
  const yMax = config.yMax ?? graph.defaultAxes.yMax;

  function patch<K extends keyof ChartOverride>(
    key: K,
    value: ChartOverride[K]
  ) {
    onChange({ ...config, [key]: value });
  }

  function patchNumber(key: "xMin" | "xMax" | "yMin" | "yMax") {
    return (event: ChangeEvent<HTMLInputElement>) => {
      const parsed = Number(event.target.value);
      // Blank field or NaN reverts to the default rather than freezing zero.
      patch(key, Number.isFinite(parsed) ? parsed : undefined);
    };
  }

  function patchColor(index: number, value: string | undefined) {
    const colors = [...(config.colors ?? [])];
    colors[index] = value;
    // Trim trailing undefineds so a reset leaves the array clean.
    while (colors.length && colors[colors.length - 1] === undefined) {
      colors.pop();
    }
    onChange({ ...config, colors: colors.length ? colors : undefined });
  }

  function patchValue(index: number, val: number | undefined) {
    const values = [...(config.values ?? graph.defaultValues ?? [])];
    values[index] = val;
    while (values.length && values[values.length - 1] === undefined) {
      values.pop();
    }
    onChange({ ...config, values: values.length ? values : undefined });
  }

  function patchSeriesLabel(index: number, label: string | undefined) {
    const labels = [...(config.seriesLabels ?? graph.valueLabels ?? graph.seriesLabels ?? [])];
    labels[index] = label;
    while (labels.length && labels[labels.length - 1] === undefined) {
      labels.pop();
    }
    onChange({ ...config, seriesLabels: labels.length ? labels : undefined });
  }

  return (
    <div
      ref={rootRef}
      // nodrag/nopan: without them React Flow starts a pan when the user
      // presses a form field or a colour swatch.
      className={`nodrag nopan absolute -top-1 ${
        openLeft ? "right-full mr-2" : "left-full ml-2"
      } z-[2147483647] w-[220px] rounded-lg border border-zinc-200 bg-white p-2 text-zinc-700 shadow-2xl`}
      onClick={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
    >
      {/* Header with integrated Reset and Close */}
      <div className="mb-1.5 flex items-center justify-between border-b border-zinc-100 pb-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-700">
          Chart Settings
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onChange({})}
            title="Reset to defaults"
            className="text-[9px] font-medium text-zinc-400 transition-colors hover:text-blue-600"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="p-0.5 text-[10px] leading-none text-zinc-400 hover:text-zinc-700"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Axis table grid OR Pie/Radar Chart Title/Subtitle */}
      {graph.isPie ? (
        <div className="flex flex-col gap-1 text-[9px]">
          <div className="flex items-center gap-1.5">
            <span className="w-10 shrink-0 font-medium text-zinc-400">Title</span>
            <input
              type="text"
              value={xLabel}
              onChange={(event) => patch("xLabel", event.target.value)}
              placeholder="Chart title"
              className="h-5 w-full min-w-0 rounded border border-zinc-200 px-1 text-[10px] text-zinc-800 outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-10 shrink-0 font-medium text-zinc-400">Subtitle</span>
            <input
              type="text"
              value={yLabel}
              onChange={(event) => patch("yLabel", event.target.value)}
              placeholder="Subtitle / date"
              className="h-5 w-full min-w-0 rounded border border-zinc-200 px-1 text-[10px] text-zinc-800 outline-none focus:border-blue-500"
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-[12px_1fr_34px_34px] items-center gap-1.5 text-[9px]">
          <span />
          <span className="font-medium text-zinc-400">Label</span>
          <span className="text-center font-medium text-zinc-400">Min</span>
          <span className="text-center font-medium text-zinc-400">Max</span>

          {/* X Axis */}
          <span className="text-center font-bold text-zinc-500">X</span>
          <input
            type="text"
            value={xLabel}
            onChange={(event) => patch("xLabel", event.target.value)}
            placeholder="X label"
            className="h-5 w-full min-w-0 rounded border border-zinc-200 px-1 text-[10px] text-zinc-800 outline-none focus:border-blue-500"
          />
          <input
            type="number"
            value={xMin}
            onChange={patchNumber("xMin")}
            placeholder="Min"
            className="h-5 w-full min-w-0 rounded border border-zinc-200 px-0.5 text-center text-[10px] text-zinc-800 outline-none focus:border-blue-500 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <input
            type="number"
            value={xMax}
            onChange={patchNumber("xMax")}
            placeholder="Max"
            className="h-5 w-full min-w-0 rounded border border-zinc-200 px-0.5 text-center text-[10px] text-zinc-800 outline-none focus:border-blue-500 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />

          {/* Y Axis */}
          <span className="text-center font-bold text-zinc-500">Y</span>
          <input
            type="text"
            value={yLabel}
            onChange={(event) => patch("yLabel", event.target.value)}
            placeholder="Y label"
            className="h-5 w-full min-w-0 rounded border border-zinc-200 px-1 text-[10px] text-zinc-800 outline-none focus:border-blue-500"
          />
          <input
            type="number"
            value={yMin}
            onChange={patchNumber("yMin")}
            placeholder="Min"
            className="h-5 w-full min-w-0 rounded border border-zinc-200 px-0.5 text-center text-[10px] text-zinc-800 outline-none focus:border-blue-500 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <input
            type="number"
            value={yMax}
            onChange={patchNumber("yMax")}
            placeholder="Max"
            className="h-5 w-full min-w-0 rounded border border-zinc-200 px-0.5 text-center text-[10px] text-zinc-800 outline-none focus:border-blue-500 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        </div>
      )}

      {/* Dynamic Data Values table (for Pie, Radar, etc.) */}
      {graph.valueLabels && graph.valueLabels.length > 0 && (
        <div className="mt-1.5 border-t border-zinc-100 pt-1.5">
          <div className="mb-1 flex items-center justify-between text-[9px]">
            <span className="font-semibold uppercase tracking-wider text-zinc-400">
              Values
            </span>
            <span className="text-[8px] text-zinc-400">Data Points</span>
          </div>
          <div className="grid grid-cols-2 gap-1 max-h-36 overflow-y-auto pr-0.5">
            {graph.valueLabels.map((valLabel, index) => {
              const currentLabel =
                config.seriesLabels?.[index] ?? valLabel;
              const currentVal =
                config.values?.[index] ?? graph.defaultValues?.[index] ?? 0;
              const color = config.colors?.[index] ?? graph.defaultColors[index];
              return (
                <div
                  key={index}
                  className="flex items-center justify-between gap-1 rounded bg-zinc-50/80 px-1 py-0.5 border border-zinc-100"
                >
                  <div className="flex items-center gap-1 min-w-0 flex-1">
                    {color && (
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    )}
                    <input
                      type="text"
                      value={currentLabel}
                      onChange={(e) => patchSeriesLabel(index, e.target.value)}
                      className="h-4 w-full min-w-0 bg-transparent text-[9px] font-medium text-zinc-700 outline-none focus:border-b focus:border-blue-500"
                    />
                  </div>
                  <input
                    type="number"
                    value={currentVal}
                    onChange={(e) => {
                      const num = Number(e.target.value);
                      patchValue(index, Number.isFinite(num) ? num : undefined);
                    }}
                    className="h-4 w-9 shrink-0 rounded border border-zinc-200 bg-white px-0.5 text-center text-[9px] font-medium text-zinc-800 outline-none focus:border-blue-500 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Colors row */}
      <div className="mt-1.5 flex items-center justify-between border-t border-zinc-100 pt-1.5">
        <span className="text-[9px] font-semibold uppercase tracking-wider text-zinc-400">
          Colors
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {graph.seriesLabels.map((label, index) => {
            const color = config.colors?.[index] ?? graph.defaultColors[index];
            return (
              <label
                key={label}
                title={`Change ${label} color`}
                className="relative flex cursor-pointer items-center gap-1 text-[9px] text-zinc-600 hover:text-zinc-900"
              >
                <span
                  className="h-3.5 w-3.5 shrink-0 rounded-[3px] border border-black/15 shadow-2xs"
                  style={{ backgroundColor: color }}
                />
                <input
                  type="color"
                  value={color}
                  onChange={(event) => patchColor(index, event.target.value)}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
                <span className="max-w-[44px] truncate">{label}</span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
