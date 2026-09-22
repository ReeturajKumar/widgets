import type { ShapeProps } from "./types";
import { SHAPE_DEFAULTS } from "./types";

/** Document — outline primitive that stretches to fill its host node. */
export function Document({
  stroke = SHAPE_DEFAULTS.stroke,
  fill = SHAPE_DEFAULTS.fill,
  strokeWidth = SHAPE_DEFAULTS.strokeWidth,
  ...props
}: ShapeProps) {
  return (
    <svg
      viewBox="0 0 100 80"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M 1 1 L 99 1 L 99 68 Q 74 82 50 68 T 1 68 Z" fill={fill} stroke={stroke} strokeWidth={strokeWidth} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
    </svg>
  );
}
