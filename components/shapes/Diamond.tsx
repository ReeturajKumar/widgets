import type { ShapeProps } from "./types";
import { SHAPE_DEFAULTS } from "./types";

/** Diamond — outline primitive that stretches to fill its host node. */
export function Diamond({
  stroke = SHAPE_DEFAULTS.stroke,
  fill = SHAPE_DEFAULTS.fill,
  strokeWidth = SHAPE_DEFAULTS.strokeWidth,
  ...props
}: ShapeProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <polygon points="50,2 98,50 50,98 2,50" fill={fill} stroke={stroke} strokeWidth={strokeWidth} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
    </svg>
  );
}
