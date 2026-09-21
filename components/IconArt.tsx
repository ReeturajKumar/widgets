"use client";

import { getWidgetIcon } from "./icons/registry";
import { InlineSvg } from "./InlineSvg";

interface IconArtProps {
  /** Built widget component to render; takes priority over `svg`. */
  componentKey?: string;
  /** Raw markup, for uploaded icons and widgets not yet converted. */
  svg?: string;
  className?: string;
}

/**
 * Renders a widget however it happens to be stored. Converted widgets are React
 * components; everything else is still markup, so both paths stay live until
 * the whole library is converted.
 */
export function IconArt({ componentKey, svg, className }: IconArtProps) {
  const widget = getWidgetIcon(componentKey);

  if (widget) {
    const { Component } = widget;
    return (
      <div className={className}>
        <Component className="h-full w-full object-contain" />
      </div>
    );
  }

  if (svg) return <InlineSvg svg={svg} className={className} />;

  return null;
}
