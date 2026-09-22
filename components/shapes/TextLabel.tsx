"use client";

import type { ShapeProps } from "./types";
import { SHAPE_DEFAULTS } from "./types";

/**
 * Text label — an underlined caption that scales with its host node.
 *
 * The word is drawn as SVG so it stretches the same way every other shape does;
 * a future edit-in-place could swap this for a contenteditable field.
 */
export function TextLabel({
  stroke = SHAPE_DEFAULTS.stroke,
  strokeWidth = SHAPE_DEFAULTS.strokeWidth,
  ...props
}: ShapeProps) {
  return (
    <svg
      viewBox="0 0 100 60"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <text
        x="50"
        y="38"
        textAnchor="middle"
        fontFamily="system-ui, sans-serif"
        fontSize="24"
        fill={stroke}
      >
        Text
      </text>
      <line
        x1="20"
        y1="48"
        x2="80"
        y2="48"
        stroke={stroke}
        strokeWidth={strokeWidth}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
