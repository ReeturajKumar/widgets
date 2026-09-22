import type { ShapeProps } from "./types";
import { SHAPE_DEFAULTS } from "./types";

/** Cloud — outline primitive that stretches to fill its host node. */
export function Cloud({
  stroke = SHAPE_DEFAULTS.stroke,
  fill = SHAPE_DEFAULTS.fill,
  strokeWidth = SHAPE_DEFAULTS.strokeWidth,
  ...props
}: ShapeProps) {
  return (
    <svg
      viewBox="0 0 120 80"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M 32 62 C 8 62 8 34 30 32 C 30 12 62 6 68 22 C 84 12 108 22 106 40 C 122 44 118 66 100 64 Z" fill={fill} stroke={stroke} strokeWidth={strokeWidth} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
    </svg>
  );
}
