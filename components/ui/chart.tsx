"use client";

import * as React from "react";
import { ResponsiveContainer, Tooltip, type TooltipProps } from "recharts";

export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode;
    icon?: React.ComponentType;
    color?: string;
    theme?: Record<string, string>;
  }
>;

interface ChartContainerProps extends React.ComponentProps<"div"> {
  config: ChartConfig;
  children: React.ComponentProps<typeof ResponsiveContainer>["children"];
}

export const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
  ({ className = "", children, config, style, ...props }, ref) => {
    // Generate CSS variables from config
    const colorStyles = React.useMemo(() => {
      const vars: Record<string, string> = {};
      Object.entries(config).forEach(([key, item]) => {
        if (item.color) {
          vars[`--color-${key}`] = item.color;
        }
      });
      return vars;
    }, [config]);

    return (
      <div
        ref={ref}
        className={`h-full w-full ${className}`}
        style={{ ...colorStyles, ...style }}
        {...props}
      >
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    );
  }
);
ChartContainer.displayName = "ChartContainer";

export const ChartTooltip = Tooltip;

export function ChartTooltipContent({
  active,
  payload,
  nameKey,
  hideLabel = false,
}: any) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  const name = item.name ?? (nameKey ? item.payload?.[nameKey] : undefined);
  const value = item.value;
  const fill = item.payload?.fill || item.color;

  return (
    <div className="flex items-center gap-1.5 rounded border border-zinc-200 bg-white px-2 py-1 text-[10px] shadow-md">
      {fill && (
        <span
          className="h-2 w-2 rounded-full shrink-0"
          style={{ backgroundColor: fill }}
        />
      )}
      {!hideLabel && name && (
        <span className="font-medium capitalize text-zinc-700">{name}:</span>
      )}
      <span className="font-semibold text-zinc-900">{value}</span>
    </div>
  );
}
