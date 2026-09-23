"use client";

import { useMemo, useEffect, useRef, useState } from "react";
import { Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { ChartProps } from "./types";

export const description = "Power generation mix by energy source";

export const DEFAULT_PIE_COLORS = [
  "#38bdf8", // Solar - sky blue
  "#60a5fa", // Wind - light blue
  "#3b82f6", // Hydro - vibrant blue
  "#2563eb", // Thermal - royal blue
  "#1d4ed8", // Nuclear - deep blue
] as const;

const RADIAN = Math.PI / 180;

export function PieChartCustom({ config, className = "" }: ChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState({
    title: 9.5,
    subtitle: 8,
    label: 8,
    margin: 6,
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      if (width <= 0 || height <= 0) return;
      const factor = Math.min(width / 180, height / 165);
      setScale({
        title: Math.max(7.5, Math.min(16, Math.round(9.5 * factor * 10) / 10)),
        subtitle: Math.max(6.5, Math.min(13, Math.round(8 * factor * 10) / 10)),
        label: Math.max(7, Math.min(11, Math.round(8 * factor * 10) / 10)),
        margin: Math.max(3, Math.min(10, Math.round(5 * factor))),
      });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const colors = useMemo(() => [
    config?.colors?.[0] ?? DEFAULT_PIE_COLORS[0],
    config?.colors?.[1] ?? DEFAULT_PIE_COLORS[1],
    config?.colors?.[2] ?? DEFAULT_PIE_COLORS[2],
    config?.colors?.[3] ?? DEFAULT_PIE_COLORS[3],
    config?.colors?.[4] ?? DEFAULT_PIE_COLORS[4],
  ], [config?.colors]);

  const values = useMemo(() => [
    config?.values?.[0] ?? 280,
    config?.values?.[1] ?? 215,
    config?.values?.[2] ?? 190,
    config?.values?.[3] ?? 165,
    config?.values?.[4] ?? 85,
  ], [config?.values]);

  const sources = useMemo(() => [
    config?.seriesLabels?.[0] ?? "Solar",
    config?.seriesLabels?.[1] ?? "Wind",
    config?.seriesLabels?.[2] ?? "Hydro",
    config?.seriesLabels?.[3] ?? "Thermal",
    config?.seriesLabels?.[4] ?? "Nuclear",
  ], [config?.seriesLabels]);

  const chartData = useMemo(() => [
    { source: sources[0], output: values[0], fill: colors[0] },
    { source: sources[1], output: values[1], fill: colors[1] },
    { source: sources[2], output: values[2], fill: colors[2] },
    { source: sources[3], output: values[3], fill: colors[3] },
    { source: sources[4], output: values[4], fill: colors[4] },
  ], [sources, colors, values]);

  const chartConfig = useMemo(() => ({
    output: {
      label: "Output (MW)",
    },
    Solar: {
      label: sources[0],
      color: colors[0],
    },
    Wind: {
      label: sources[1],
      color: colors[1],
    },
    Hydro: {
      label: sources[2],
      color: colors[2],
    },
    Thermal: {
      label: sources[3],
      color: colors[3],
    },
    Nuclear: {
      label: sources[4],
      color: colors[4],
    },
  } satisfies ChartConfig), [sources, colors]);

  const title = config?.xLabel ?? "Generation Mix";
  const subtitle = config?.yLabel ?? "Active Output (MW)";

  return (
    <Card
      ref={containerRef}
      className={`flex flex-col h-full w-full overflow-hidden select-none bg-white ${className}`}
    >
      {/* Top Header - Left-aligned as in inspiration design */}
      <CardHeader className="items-start px-2 pt-1 pb-0 text-left">
        <CardTitle
          className="truncate max-w-full font-semibold tracking-tight text-zinc-900"
          style={{ fontSize: `${scale.title}px` }}
        >
          {title}
        </CardTitle>
        <CardDescription
          className="truncate max-w-full text-zinc-400"
          style={{ fontSize: `${scale.subtitle}px` }}
        >
          {subtitle}
        </CardDescription>
      </CardHeader>

      {/* Chart Canvas filling remaining height */}
      <CardContent className="flex-1 min-h-0 w-full p-0 flex items-center justify-center">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-full w-full outline-none focus:outline-none [&_*]:outline-none"
        >
          <PieChart
            margin={{
              top: scale.margin,
              right: scale.margin,
              bottom: scale.margin,
              left: scale.margin,
            }}
            style={{ outline: "none" }}
          >
            <ChartTooltip content={<ChartTooltipContent nameKey="source" />} />
            <Pie
              data={chartData}
              dataKey="output"
              nameKey="source"
              outerRadius="63%"
              activeShape={false}
              isAnimationActive={false}
              cursor="default"
              labelLine={false}
              label={({
                cx,
                cy,
                midAngle,
                outerRadius: oRadius,
                payload,
              }: any) => {
                const r = (typeof oRadius === "number" ? oRadius : 40) + 6;
                const x = cx + r * Math.cos(-midAngle * RADIAN);
                const y = cy + r * Math.sin(-midAngle * RADIAN);
                const textAnchor = x > cx + 4 ? "start" : x < cx - 4 ? "end" : "middle";
                const dominantBaseline = y > cy + 8 ? "hanging" : y < cy - 8 ? "auto" : "central";

                return (
                  <text
                    x={x}
                    y={y}
                    textAnchor={textAnchor}
                    dominantBaseline={dominantBaseline}
                    fontSize={scale.label}
                    className="select-none pointer-events-none"
                  >
                    <tspan fontWeight={600} fill="#1e293b">
                      {payload.source}:
                    </tspan>
                    <tspan fontWeight={700} fill={payload.fill || "#2563eb"} dx="2">
                      {payload.output}
                    </tspan>
                  </text>
                );
              }}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
