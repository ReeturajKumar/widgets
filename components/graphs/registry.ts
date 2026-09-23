"use client";

import type { ComponentType } from "react";
import { RegionalTrend } from "./RegionalTrend";
import { RevenueTrend } from "./RevenueTrend";
import { UsageArea } from "./UsageArea";
import { PieChartCustom, DEFAULT_PIE_COLORS } from "./PieChartCustom";
import { RadarChartCustom, DEFAULT_RADAR_COLOR } from "./RadarChartCustom";
import type { ChartProps } from "./types";

// Trend-chart primitives shown in the Graphs sidebar tab.
//
// Each chart declares its own dummy data and default axes; the user's overrides
// live on the node under `data.chartConfig` and reach the component as its
// `config` prop. `seriesLabels` and `defaultColors` are what the settings
// popover uses to build the colour-picker rows.

export interface GraphAxisDefaults {
  xLabel: string;
  xMin: number;
  xMax: number;
  yLabel: string;
  yMin: number;
  yMax: number;
}

export interface GraphDef {
  key: string;
  label: string;
  description: string;
  Component: ComponentType<ChartProps>;
  defaultSize: { width: number; height: number };
  seriesLabels: string[];
  defaultColors: string[];
  defaultAxes: GraphAxisDefaults;
  isPie?: boolean;
  valueLabels?: string[];
  defaultValues?: number[];
}

const SIZE = { width: 240, height: 150 } as const;

export const GRAPHS: readonly GraphDef[] = [
  {
    key: "graph-radar-chart",
    label: "Plant efficiency",
    description: "Subsystem performance radar (%)",
    Component: RadarChartCustom,
    defaultSize: { width: 190, height: 175 },
    seriesLabels: ["Efficiency"],
    defaultColors: [DEFAULT_RADAR_COLOR],
    isPie: true,
    valueLabels: ["Turbine", "Generator", "Cooling", "Boiler", "Inverter", "Grid"],
    defaultValues: [94, 88, 76, 85, 92, 90],
    defaultAxes: {
      xLabel: "Plant Efficiency",
      xMin: 0,
      xMax: 0,
      yLabel: "Subsystem Performance (%)",
      yMin: 0,
      yMax: 0,
    },
  },
  {
    key: "graph-pie-chart",
    label: "Generation mix",
    description: "Active energy source mix (MW)",
    Component: PieChartCustom,
    defaultSize: { width: 190, height: 175 },
    seriesLabels: ["Solar", "Wind", "Hydro", "Thermal", "Nuclear"],
    defaultColors: [...DEFAULT_PIE_COLORS],
    isPie: true,
    valueLabels: ["Solar", "Wind", "Hydro", "Thermal", "Nuclear"],
    defaultValues: [280, 215, 190, 165, 85],
    defaultAxes: {
      xLabel: "Generation Mix",
      xMin: 0,
      xMax: 0,
      yLabel: "Active Output (MW)",
      yMin: 0,
      yMax: 0,
    },
  },
  {
    key: "graph-revenue-trend",
    label: "Power generation",
    description: "Monthly plant output (GWh)",
    Component: RevenueTrend,
    defaultSize: SIZE,
    seriesLabels: ["Generation"],
    defaultColors: ["#2563eb"],
    defaultAxes: {
      xLabel: "Month",
      xMin: 0,
      xMax: 11,
      yLabel: "Output (GWh)",
      yMin: 0,
      yMax: 150,
    },
  },
  {
    key: "graph-regional-trend",
    label: "Unit load",
    description: "Multi-unit quarterly load (MW)",
    Component: RegionalTrend,
    defaultSize: SIZE,
    seriesLabels: ["Unit 1", "Unit 2", "Unit 3"],
    defaultColors: ["#2563eb", "#16a34a", "#d97706"],
    defaultAxes: {
      xLabel: "Quarter",
      xMin: 0,
      xMax: 7,
      yLabel: "Load (MW)",
      yMin: 0,
      yMax: 100,
    },
  },
  {
    key: "graph-usage-area",
    label: "Grid power load",
    description: "Weekly peak and base power load (MW)",
    Component: UsageArea,
    defaultSize: SIZE,
    seriesLabels: ["Peak load", "Base load"],
    defaultColors: ["#7c3aed", "#0891b2"],
    defaultAxes: {
      xLabel: "Week",
      xMin: 0,
      xMax: 11,
      yLabel: "Grid load (MW)",
      yMin: 0,
      yMax: 200,
    },
  },
];

const BY_KEY = new Map(GRAPHS.map((g) => [g.key, g]));

export function getGraph(key: string | undefined): GraphDef | undefined {
  return key ? BY_KEY.get(key) : undefined;
}
