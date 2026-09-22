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
 * series lines. Each concrete chart supplies its own dummy data and defaults;
 * the settings popover only ever writes to `config`, never to the source file.
 */
export function ChartCanvas({
  series,
  xLabels,
  defaults,
  config,
  variant = "line",
  className,
}: ChartCanvasProps) {
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

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      style={{ fontFamily: "system-ui, sans-serif", fontSize: 9 }}
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
