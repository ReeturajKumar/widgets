// Shared contract for every shape primitive.
//
// Shapes stretch to fill their host node — `<svg preserveAspectRatio="none">`
// plus `vectorEffect="non-scaling-stroke"` on the geometry keeps the stroke
// width constant while the geometry deforms, so a rectangle stays a rectangle
// with a 1.5 px outline whether it is 60 px wide or 600.

import type { SVGProps } from "react";

export interface ShapeProps extends Omit<SVGProps<SVGSVGElement>, "fill" | "stroke"> {
  /** Outline colour. Defaults to a neutral dark grey that reads on any board. */
  stroke?: string;
  /** Interior colour; defaults to transparent so the shape sits on the board. */
  fill?: string;
  /** Stroke width in CSS pixels (kept constant while the shape stretches). */
  strokeWidth?: number;
}

export const SHAPE_DEFAULTS = {
  stroke: "#3f3f46",
  fill: "transparent",
  strokeWidth: 1.5,
} as const;
