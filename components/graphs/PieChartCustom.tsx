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

export function PieChartCustom({ config, className = "" }: ChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState({
    title: 9.5,
    subtitle: 8,
    label: 9,
    margin: 10,
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      if (width <= 0 || height <= 0) return;
      const factor = Math.min(width / 160, height / 155);
      setScale({
        title: Math.max(7, Math.min(16, Math.round(9.5 * factor * 10) / 10)),
        subtitle: Math.max(6, Math.min(13, Math.round(8 * factor * 10) / 10)),
        label: Math.max(7, Math.min(14, Math.round(9 * factor * 10) / 10)),
        margin: Math.max(6, Math.min(18, Math.round(10 * factor))),
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

  const chartData = useMemo(() => [
    { source: "Solar", output: values[0], fill: colors[0] },
    { source: "Wind", output: values[1], fill: colors[1] },
    { source: "Hydro", output: values[2], fill: colors[2] },
    { source: "Thermal", output: values[3], fill: colors[3] },
    { source: "Nuclear", output: values[4], fill: colors[4] },
  ], [colors, values]);

  const chartConfig = useMemo(() => ({
    output: {
      label: "Output (MW)",
    },
    Solar: {
      label: "Solar",
      color: colors[0],
    },
    Wind: {
      label: "Wind",
      color: colors[1],
    },
    Hydro: {
      label: "Hydro",
      color: colors[2],
    },
    Thermal: {
      label: "Thermal",
      color: colors[3],
    },
    Nuclear: {
      label: "Nuclear",
      color: colors[4],
    },
  } satisfies ChartConfig), [colors]);

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

      {/* Chart Canvas filling remaining height (no footer) */}
      <CardContent className="flex-1 min-h-0 w-full p-0.5 flex items-center justify-center">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-full w-full outline-none focus:outline-none [&_*]:outline-none"
        >
          <PieChart
            margin={{
              top: scale.margin,
              right: scale.margin + 2,
              bottom: scale.margin,
              left: scale.margin + 2,
            }}
            style={{ outline: "none" }}
          >
            <Pie
              data={chartData}
              dataKey="output"
              nameKey="source"
              outerRadius="68%"
              activeShape={false}
              isAnimationActive={false}
              cursor="default"
              labelLine={false}
              label={({ payload, ...props }) => (
                <text
                  cx={props.cx}
                  cy={props.cy}
                  x={props.x}
                  y={props.y}
                  textAnchor={props.textAnchor}
                  dominantBaseline={props.dominantBaseline}
                  fill="#374151"
                  fontSize={scale.label}
                  fontWeight={600}
                >
                  {payload.output}
                </text>
              )}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
