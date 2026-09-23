"use client";

import { useRef, useState } from "react";
import type {
  ChartAxisDefaults,
  ChartOverride,
  ChartProps,
  ChartSeries,
} from "./types";

interface ChartCanvasProps extends ChartProps {
  series: ChartSeries[];
  xLabels?: string[];
  defaults: {
    x: ChartAxisDefaults;
    y: ChartAxisDefaults;
  };
  variant?: "line" | "area";
}

/**
 * Draws the shared parts of every trend chart: axes, gridlines, ticks and the
 * series lines, plus interactive hover tooltips and crosshairs.
 */
export function ChartCanvas({
  series,
  xLabels,
  defaults,
  config,
  variant = "line",
  className,
}: ChartCanvasProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const xAxis = {
    label: config?.xLabel ?? defaults.x.label,
    min: config?.xMin ?? defaults.x.min,
    max: config?.xMax ?? defaults.x.max,
    ticks: defaults.x.ticks,
  };
  const yAxis = {
    label: config?.yLabel ?? defaults.y.label,
    min: config?.yMin ?? defaults.y.min,
    max: config?.yMax ?? defaults.y.max,
    ticks: defaults.y.ticks,
  };

  const W = 320;
  const H = 200;
  const P = { top: 14, right: 14, bottom: 36, left: 46 };
  const cw = W - P.left - P.right;
  const ch = H - P.top - P.bottom;

  const xRange = xAxis.max - xAxis.min || 1;
  const yRange = yAxis.max - yAxis.min || 1;
  const xToPx = (i: number) => P.left + (cw * (i - xAxis.min)) / xRange;
  const yToPx = (v: number) =>
    P.top + ch - (ch * (v - yAxis.min)) / yRange;

  const xTicks = tickValues(xAxis.min, xAxis.max, xAxis.ticks);
  const yTicks = tickValues(yAxis.min, yAxis.max, yAxis.ticks);

  const maxPts = Math.max(...series.map((s) => s.points.length), 1);

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    if (rect.width <= 0) return;
    const clientX = e.clientX - rect.left;
    const svgX = (clientX / rect.width) * W;

    if (svgX >= P.left - 8 && svgX <= P.left + cw + 8) {
      const normalized = (svgX - P.left) / cw;
      const index = Math.round(normalized * (maxPts - 1));
      const clamped = Math.max(0, Math.min(maxPts - 1, index));
      setHoverIndex(clamped);
    } else {
      setHoverIndex(null);
    }
  };

  const handlePointerLeave = () => {
    setHoverIndex(null);
  };

  const tooltipW = series.length > 1 ? 92 : 72;
  const tooltipH = 17 + series.length * 13;
  const targetX = hoverIndex !== null ? xToPx(hoverIndex) : 0;
  const tooltipX = targetX > P.left + cw - tooltipW - 8 ? targetX - tooltipW - 8 : targetX + 8;
  const tooltipY = Math.max(P.top + 4, Math.min(P.top + ch - tooltipH - 4, P.top + 10));

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      className={`cursor-crosshair ${className ?? ""}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ fontFamily: "system-ui, sans-serif", fontSize: 9 }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {/* Chart background */}
      <rect
        x={P.left}
        y={P.top}
        width={cw}
        height={ch}
        fill="#ffffff"
        stroke="#e5e7eb"
      />

      {/* Y gridlines and tick labels */}
      {yTicks.map((t, i) => (
        <g key={`y${i}`}>
          <line
            x1={P.left}
            y1={yToPx(t)}
            x2={P.left + cw}
            y2={yToPx(t)}
            stroke="#f3f4f6"
          />
          <text
            x={P.left - 5}
            y={yToPx(t) + 3}
            textAnchor="end"
            fill="#6b7280"
          >
            {formatTick(t)}
          </text>
        </g>
      ))}

      {/* X gridlines and tick labels */}
      {xTicks.map((t, i) => (
        <g key={`x${i}`}>
          <line
            x1={xToPx(t)}
            y1={P.top}
            x2={xToPx(t)}
            y2={P.top + ch}
            stroke="#f3f4f6"
          />
          <text
            x={xToPx(t)}
            y={P.top + ch + 13}
            textAnchor="middle"
            fill="#6b7280"
          >
            {xLabels?.[Math.round(t)] ?? formatTick(t)}
          </text>
        </g>
      ))}

      {/* Axis titles */}
      <text
        x={P.left + cw / 2}
        y={H - 3}
        textAnchor="middle"
        fill="#374151"
        fontSize={10}
        fontWeight={600}
      >
        {xAxis.label}
      </text>
      <text
        x={11}
        y={P.top + ch / 2}
        textAnchor="middle"
        fill="#374151"
        fontSize={10}
        fontWeight={600}
        transform={`rotate(-90 11 ${P.top + ch / 2})`}
      >
        {yAxis.label}
      </text>

      {/* Series */}
      {series.map((s, si) => {
        const color = config?.colors?.[si] ?? s.color;
        const path = seriesPath(s.points, xToPx, yToPx);
        if (variant === "area") {
          const bottom = yToPx(yAxis.min);
          const areaPath = `${path} L ${xToPx(s.points.length - 1)} ${bottom} L ${xToPx(0)} ${bottom} Z`;
          return (
            <g key={si}>
              <path d={areaPath} fill={color} fillOpacity="0.22" />
              <path
                d={path}
                fill="none"
                stroke={color}
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </g>
          );
        }
        return (
          <g key={si}>
            <path
              d={path}
              fill="none"
              stroke={color}
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            {s.points.map((y, i) => (
              <circle
                key={i}
                cx={xToPx(i)}
                cy={yToPx(y)}
                r="2"
                fill={color}
              />
            ))}
          </g>
        );
      })}

      {/* Legend (only when there is more than one series) */}
      {series.length > 1 && (
        <g transform={`translate(${P.left + 6}, ${P.top + 6})`}>
          {series.map((s, si) => {
            const color = config?.colors?.[si] ?? s.color;
            return (
              <g key={si} transform={`translate(0, ${si * 11})`}>
                <rect y={-4} width="10" height="3" fill={color} />
                <text x={14} y={0} fill="#374151" fontSize={8.5}>
                  {s.label}
                </text>
              </g>
            );
          })}
        </g>
      )}

      {/* Interactive Hover Guide & Tooltip */}
      {hoverIndex !== null && (
        <g className="pointer-events-none select-none">
          {/* Vertical guideline crosshair */}
          <line
            x1={xToPx(hoverIndex)}
            y1={P.top}
            x2={xToPx(hoverIndex)}
            y2={P.top + ch}
            stroke="#64748b"
            strokeWidth="1"
            strokeDasharray="2 2"
          />

          {/* Highlighted circles on each series line */}
          {series.map((s, si) => {
            const val = s.points[hoverIndex];
            if (val === undefined) return null;
            const color = config?.colors?.[si] ?? s.color;
            return (
              <g key={`hl-${si}`}>
                <circle
                  cx={xToPx(hoverIndex)}
                  cy={yToPx(val)}
                  r="5"
                  fill={color}
                  fillOpacity="0.3"
                />
                <circle
                  cx={xToPx(hoverIndex)}
                  cy={yToPx(val)}
                  r="3.5"
                  fill="#ffffff"
                  stroke={color}
                  strokeWidth="2"
                />
              </g>
            );
          })}

          {/* Floating Tooltip Box */}
          <g transform={`translate(${tooltipX}, ${tooltipY})`}>
            <rect
              width={tooltipW}
              height={tooltipH}
              rx="4"
              ry="4"
              fill="#0f172a"
              fillOpacity="0.95"
              stroke="#334155"
              strokeWidth="0.8"
            />
            {/* Header label */}
            <text
              x="6"
              y="11"
              fill="#94a3b8"
              fontSize="8"
              fontWeight="600"
            >
              {xLabels?.[hoverIndex] ?? `${xAxis.label}: ${hoverIndex + 1}`}
            </text>
            {/* Series rows with colors and exact values */}
            {series.map((s, si) => {
              const val = s.points[hoverIndex];
              const color = config?.colors?.[si] ?? s.color;
              const rowY = 23 + si * 12;
              return (
                <g key={`row-${si}`}>
                  <circle cx="9" cy={rowY - 2.5} r="2.5" fill={color} />
                  <text x="16" y={rowY} fill="#cbd5e1" fontSize="8" fontWeight="500">
                    {series.length > 1 ? `${s.label}: ` : ""}
                    <tspan fontWeight="700" fill="#ffffff">
                      {val}
                    </tspan>
                  </text>
                </g>
              );
            })}
          </g>
        </g>
      )}
    </svg>
  );
}

function seriesPath(
  points: number[],
  xToPx: (i: number) => number,
  yToPx: (v: number) => number
): string {
  return points
    .map((y, i) => `${i === 0 ? "M" : "L"} ${xToPx(i).toFixed(2)} ${yToPx(y).toFixed(2)}`)
    .join(" ");
}

function tickValues(min: number, max: number, count: number): number[] {
  if (count <= 1) return [min];
  const step = (max - min) / (count - 1);
  return Array.from({ length: count }, (_, i) => min + step * i);
}

function formatTick(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export type { ChartOverride };
