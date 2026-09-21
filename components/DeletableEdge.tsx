"use client";

import { useState } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  getSmoothStepPath,
  getStraightPath,
  useReactFlow,
  type EdgeProps,
} from "@xyflow/react";
import type { EdgeStyle } from "../lib/types";

export const DELETABLE_EDGE_TYPE = "deletable";

/**
 * A connection that can be removed from the board.
 *
 * React Flow's built-in edge types draw a line and nothing else, so the only
 * way to remove one was to select it and hit a key — undiscoverable. This draws
 * the same three shapes itself and puts a delete button at the midpoint,
 * revealed on hover or selection.
 *
 * The shape lives in `data.variant` rather than the edge `type`, because the
 * type slot is what routes to this component.
 *
 * Removal is deliberate — the button, or select and press Delete. Clicking the
 * line itself only selects it: there is no undo on this board, and a stray
 * click while reaching for a node should not silently drop a connection.
 */
export function DeletableEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  style,
  data,
  selected,
}: EdgeProps) {
  const { setEdges } = useReactFlow();
  const [hovered, setHovered] = useState(false);

  const variant = (data?.variant as EdgeStyle | undefined) ?? "bezier";
  const geometry = {
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  };
  const [path, labelX, labelY] =
    variant === "straight"
      ? getStraightPath({ sourceX, sourceY, targetX, targetY })
      : variant === "step"
        ? getSmoothStepPath(geometry)
        : getBezierPath(geometry);

  const active = hovered || selected;

  function remove() {
    setEdges((eds) => eds.filter((edge) => edge.id !== id));
  }

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: active ? "#ef4444" : style?.stroke,
          strokeWidth: active ? 2.5 : (style?.strokeWidth ?? 1.5),
        }}
      />

      {/* A line is only a couple of pixels wide, which is a hard target. This
          invisible band widens it so hovering anywhere near works. */}
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        style={{ pointerEvents: "stroke", cursor: "pointer" }}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      />

      {active && (
        <EdgeLabelRenderer>
          <button
            type="button"
            title="Delete connection"
            aria-label="Delete connection"
            // nodrag/nopan: this sits over the canvas, and without them a press
            // starts a pan and the click never lands.
            className="nodrag nopan flex h-4 w-4 items-center justify-center rounded-full border border-red-300 bg-white text-[10px] font-bold leading-none text-red-500 shadow-sm hover:bg-red-500 hover:text-white"
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: "all",
            }}
            onPointerEnter={() => setHovered(true)}
            onPointerLeave={() => setHovered(false)}
            onClick={(event) => {
              event.stopPropagation();
              remove();
            }}
          >
            ×
          </button>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
