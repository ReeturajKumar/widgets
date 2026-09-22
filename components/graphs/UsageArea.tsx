import { ChartCanvas } from "./ChartCanvas";
import type { ChartProps } from "./types";

const WEEKS = [
  "W1", "W2", "W3", "W4", "W5", "W6",
  "W7", "W8", "W9", "W10", "W11", "W12",
];

/** Peak vs base power grid load trend (MW). */
export function UsageArea({ config, className }: ChartProps) {
  return (
    <ChartCanvas
      className={className}
      config={config}
      variant="area"
      series={[
        {
          label: "Peak load",
          color: "#7c3aed",
          points: [120, 135, 145, 160, 155, 170, 185, 190, 175, 165, 150, 140],
        },
        {
          label: "Base load",
          color: "#0891b2",
          points: [70, 75, 80, 85, 85, 90, 95, 95, 90, 85, 80, 75],
        },
      ]}
      xLabels={WEEKS}
      defaults={{
        x: { label: "Week", min: 0, max: 11, ticks: 12 },
        y: { label: "Grid load (MW)", min: 0, max: 200, ticks: 5 },
      }}
    />
  );
}
