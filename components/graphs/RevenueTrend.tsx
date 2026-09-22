import { ChartCanvas } from "./ChartCanvas";
import type { ChartProps } from "./types";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** Single-line monthly power generation trend. */
export function RevenueTrend({ config, className }: ChartProps) {
  return (
    <ChartCanvas
      className={className}
      config={config}
      series={[
        {
          label: "Generation",
          color: "#2563eb",
          points: [62, 75, 84, 98, 112, 128, 142, 138, 120, 105, 88, 72],
        },
      ]}
      xLabels={MONTHS}
      defaults={{
        x: { label: "Month", min: 0, max: 11, ticks: 12 },
        y: { label: "Output (GWh)", min: 0, max: 150, ticks: 6 },
      }}
    />
  );
}
