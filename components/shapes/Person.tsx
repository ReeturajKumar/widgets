import type { ShapeProps } from "./types";
import { SHAPE_DEFAULTS } from "./types";

/** Person — outline primitive that stretches to fill its host node. */
export function Person({
  stroke = SHAPE_DEFAULTS.stroke,
  fill = SHAPE_DEFAULTS.fill,
  strokeWidth = SHAPE_DEFAULTS.strokeWidth,
  ...props
}: ShapeProps) {
  return (
    <svg
      viewBox="0 0 60 100"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle cx="30" cy="18" r="14" fill={fill} stroke={stroke} strokeWidth={strokeWidth} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
      <path d="M 30 32 L 30 68 M 30 40 L 8 55 M 30 40 L 52 55 M 30 68 L 12 98 M 30 68 L 48 98" fill={fill} stroke={stroke} strokeWidth={strokeWidth} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
    </svg>
  );
}
