"use client";

import { themeFilter } from "../lib/widgetThemes";
import { getWidgetIcon } from "./icons/registry";
import { InlineSvg } from "./InlineSvg";

interface IconArtProps {
  /** Built widget component to render; takes priority over `svg`. */
  componentKey?: string;
  /** Raw markup, for uploaded icons and widgets not yet converted. */
  svg?: string;
  /** Colour theme id from lib/widgetThemes. */
  theme?: string;
  className?: string;
}

/**
 * Renders a widget however it happens to be stored. Converted widgets are React
 * components; everything else is still markup, so both paths stay live until
 * the whole library is converted.
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
