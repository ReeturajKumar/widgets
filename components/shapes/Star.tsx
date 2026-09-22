import type { ShapeProps } from "./types";
import { SHAPE_DEFAULTS } from "./types";

/** Star — outline primitive that stretches to fill its host node. */
export function Star({
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
      <polygon points="50,3 61,38 98,38 68,60 79,95 50,73 21,95 32,60 2,38 39,38" fill={fill} stroke={stroke} strokeWidth={strokeWidth} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
    </svg>
  );
}
