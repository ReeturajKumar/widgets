"use client";

import { themeFilter } from "../lib/widgetThemes";
import { getWidgetIcon } from "./icons/registry";
import { InlineSvg } from "./InlineSvg";

interface IconArtProps {
  /** Built widget component to render; takes priority over `svg`. */
  componentKey?: string;
  /** Raw markup, for library files not built into a component. */
  svg?: string;
  /** Colour theme id from lib/widgetThemes. */
  theme?: string;
  className?: string;
}

/**
 * Renders a widget however it happens to be stored. Built widgets are React
 * components; a file dropped into public/icons is still markup, so both paths
 * stay live.
 */
export function IconArt({ componentKey, svg, theme, className }: IconArtProps) {
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

  if (svg) {
    return (
      <div className={className} style={filter ? { filter } : undefined}>
        <InlineSvg svg={svg} className="h-full w-full" />
      </div>
    );
  }

  return null;
}
