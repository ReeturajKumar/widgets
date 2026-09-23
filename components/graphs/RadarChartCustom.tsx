"use client";

import { useMemo, useEffect, useRef, useState } from "react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";

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

export const description = "Power plant subsystem efficiency radar";

export const DEFAULT_RADAR_COLOR = "#2563eb";

export function RadarChartCustom({ config, className = "" }: ChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState({
    title: 9.5,
    subtitle: 8,
    axis: 7.5,
    margin: 6,
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
        axis: Math.max(6, Math.min(11, Math.round(7.5 * factor * 10) / 10)),
        margin: Math.max(3, Math.min(14, Math.round(6 * factor))),
      });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const color = config?.colors?.[0] ?? DEFAULT_RADAR_COLOR;

  const values = useMemo(() => [
    config?.values?.[0] ?? 94,
    config?.values?.[1] ?? 88,
    config?.values?.[2] ?? 76,
    config?.values?.[3] ?? 85,
    config?.values?.[4] ?? 92,
    config?.values?.[5] ?? 90,
  ], [config?.values]);

  const subsystems = useMemo(() => [
    config?.seriesLabels?.[0] ?? "Turbine",
    config?.seriesLabels?.[1] ?? "Generator",
    config?.seriesLabels?.[2] ?? "Cooling",
    config?.seriesLabels?.[3] ?? "Boiler",
    config?.seriesLabels?.[4] ?? "Inverter",
    config?.seriesLabels?.[5] ?? "Grid",
  ], [config?.seriesLabels]);

  const chartData = useMemo(() => [
    { subsystem: subsystems[0], efficiency: values[0] },
    { subsystem: subsystems[1], efficiency: values[1] },
    { subsystem: subsystems[2], efficiency: values[2] },
    { subsystem: subsystems[3], efficiency: values[3] },
    { subsystem: subsystems[4], efficiency: values[4] },
    { subsystem: subsystems[5], efficiency: values[5] },
  ], [subsystems, values]);

  const chartConfig = useMemo(() => ({
    efficiency: {
      label: "Efficiency (%)",
      color,
    },
  } satisfies ChartConfig), [color]);

  const title = config?.xLabel ?? "Plant Efficiency";
  const subtitle = config?.yLabel ?? "Subsystem Performance (%)";

  return (
    <Card
      ref={containerRef}
      className={`flex flex-col h-full w-full overflow-hidden select-none bg-white ${className}`}
    >
      {/* Top Header - Left-aligned */}
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

      {/* Radar Chart Canvas */}
      <CardContent className="flex-1 min-h-0 w-full p-0.5 flex items-center justify-center">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-full w-full outline-none focus:outline-none [&_*]:outline-none"
        >
          <RadarChart
            data={chartData}
            margin={{
              top: scale.margin,
              right: scale.margin + 4,
              bottom: scale.margin,
              left: scale.margin + 4,
            }}
            style={{ outline: "none" }}
          >
            <ChartTooltip content={<ChartTooltipContent nameKey="subsystem" />} />
            <PolarGrid stroke="#e5e7eb" strokeDasharray="2 2" />
            <PolarAngleAxis
              dataKey="subsystem"
              tick={(props: any) => {
                const item = chartData.find((d) => d.subsystem === props.payload.value);
                const val = item ? `${item.efficiency}%` : "";
                return (
                  <text
                    x={props.x}
                    y={props.y}
                    textAnchor={props.textAnchor}
                    dominantBaseline={props.dominantBaseline}
                    fontSize={scale.axis}
                    className="select-none pointer-events-none"
                  >
                    <tspan fontWeight={600} fill="#1f2937">
                      {props.payload.value}
                    </tspan>
                    {val && (
                      <tspan fontWeight={500} fill="#6b7280" dx="2">
                        ({val})
                      </tspan>
                    )}
                  </text>
                );
              }}
            />
            <Radar
              name="Efficiency"
              dataKey="efficiency"
              stroke={color}
              fill={color}
              fillOpacity={0.5}
              strokeWidth={1.5}
              isAnimationActive={false}
              cursor="default"
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
