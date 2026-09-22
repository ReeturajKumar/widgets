import { ChartCanvas } from "./ChartCanvas";
import type { ChartProps } from "./types";

const QUARTERS = ["Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7", "Q8"];

/** Three-unit quarterly power load comparison. */
export function RegionalTrend({ config, className }: ChartProps) {
  return (
    <ChartCanvas
      className={className}
      config={config}
      series={[
        {
          label: "Unit 1",
          color: "#2563eb",
          points: [65, 72, 78, 82, 88, 85, 90, 94],
        },
        {
          label: "Unit 2",
          color: "#16a34a",
          points: [48, 52, 58, 64, 62, 70, 75, 78],
        },
        {
          label: "Unit 3",
          color: "#d97706",
          points: [32, 38, 44, 50, 56, 60, 64, 68],
        },
      ]}
      xLabels={QUARTERS}
      defaults={{
        x: { label: "Quarter", min: 0, max: 7, ticks: 8 },
        y: { label: "Load (MW)", min: 0, max: 100, ticks: 6 },
      }}
    />
  );
}
