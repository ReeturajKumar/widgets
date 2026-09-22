import type { ShapeProps } from "./types";
import { SHAPE_DEFAULTS } from "./types";

/** Speech bubble — outline primitive that stretches to fill its host node. */
export function SpeechBubble({
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
      <path d="M 8 2 L 92 2 Q 98 2 98 8 L 98 52 Q 98 58 92 58 L 42 58 L 28 74 L 32 58 L 8 58 Q 2 58 2 52 L 2 8 Q 2 2 8 2 Z" fill={fill} stroke={stroke} strokeWidth={strokeWidth} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
    </svg>
  );
}
