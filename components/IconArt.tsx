"use client";

import { themeFilter } from "../lib/widgetThemes";
import { getWidgetIcon } from "./icons/registry";
import { getGraph } from "./graphs/registry";
import { getShape } from "./shapes/registry";
import { InlineSvg } from "./InlineSvg";

interface IconArtProps {
  /** Built widget component to render; takes priority over `svg`. */
  componentKey?: string;
  /** Raw markup, for library files not built into a component. */
  svg?: string;
  /** Colour theme id from lib/widgetThemes. */
  theme?: string;
  /** Live overrides for a chart node (axes + line colours). */
  chartConfig?: import("./graphs/types").ChartOverride;
  className?: string;
}

/**
 * Renders a widget however it happens to be stored. Built widgets are React
 * components; a file dropped into public/icons is still markup, so both paths
 * stay live.
 */
export function IconArt({ componentKey, svg, theme, chartConfig, className }: IconArtProps) {
  const widget = getWidgetIcon(componentKey);
  const filter = themeFilter(theme);

  if (widget) {
    const { Component } = widget;
    return (
      <div className={className} style={filter ? { filter } : undefined}>
        <Component className="h-full w-full object-contain" />
      </div>
    );
  }

  const graph = getGraph(componentKey);
  if (graph) {
    const { Component } = graph;
    // Themes tint the whole widget — that would wash out a chart. Skip the
    // filter so the axis colours stay true, and pass the live overrides in.
    return (
      <div className={className}>
        <Component config={chartConfig} className="block h-full w-full" />
      </div>
    );
  }

  const shape = getShape(componentKey);
  if (shape) {
    const { Component } = shape;
    return (
      <div className={className} style={filter ? { filter } : undefined}>
        <Component className="block h-full w-full" />
      </div>
    );
  }

  if (svg) {
    return (
      <div className={className} style={filter ? { filter } : undefined}>
        <InlineSvg svg={svg} className="h-full w-full" />
      </div>
    );
  }

  return null;
}
