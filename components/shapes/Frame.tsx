import type { ShapeProps } from "./types";
import { SHAPE_DEFAULTS } from "./types";

/** Frame — outline primitive that stretches to fill its host node. */
export function Frame({
  stroke = SHAPE_DEFAULTS.stroke,
  fill = SHAPE_DEFAULTS.fill,
  strokeWidth = SHAPE_DEFAULTS.strokeWidth,
  ...props
}: ShapeProps) {
  return (
    <svg
      viewBox="0 0 100 70"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect x="1" y="1" width="98" height="68" fill={fill} stroke={stroke} strokeWidth={strokeWidth} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
      <line x1="1" y1="16" x2="99" y2="16" fill={fill} stroke={stroke} strokeWidth={strokeWidth} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
    </svg>
  );
}
