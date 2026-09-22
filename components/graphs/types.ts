// Shared contract for trend-chart components.
//
// A chart's shape is baked into its file (data points, default colours, axis
// defaults); the user can override the axis labels, ranges and per-series
// colours through the settings popover, and those overrides live on the node
// as `chartConfig`.

export interface ChartOverride {
  xLabel?: string;
  xMin?: number;
  xMax?: number;
  yLabel?: string;
  yMin?: number;
  yMax?: number;
  /** One entry per series; undefined means "use the default". */
  colors?: (string | undefined)[];
  /** Custom data values for slices / data points. */
  values?: (number | undefined)[];
}

export interface ChartProps {
  config?: ChartOverride;
  className?: string;
}

export interface ChartSeries {
  label: string;
  color: string;
  points: number[];
}

export interface ChartAxisDefaults {
  label: string;
  min: number;
  max: number;
  ticks: number;
}
