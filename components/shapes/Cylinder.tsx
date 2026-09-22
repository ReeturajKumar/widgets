import type { ShapeProps } from "./types";
import { SHAPE_DEFAULTS } from "./types";

/** Cylinder — outline primitive that stretches to fill its host node. */
export function Cylinder({
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
      <path d="M 1 15 A 49 12 0 0 1 99 15 L 99 85 A 49 12 0 0 1 1 85 Z" fill={fill} stroke={stroke} strokeWidth={strokeWidth} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
      <path d="M 1 15 A 49 12 0 0 0 99 15" fill={fill} stroke={stroke} strokeWidth={strokeWidth} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
    </svg>
  );
}
