"use client";

import { Handle, NodeResizer, Position, type NodeProps } from "@xyflow/react";
import { useRef } from "react";
import { getDashboardWidget } from "./dashboard/widgetRegistry";
import { useNodeActions } from "./NodeActionsContext";

const handleClass = "!h-2.5 !w-2.5 !border-2 !border-white !bg-blue-500";

export interface DashboardWidgetNodeData extends Record<string, unknown> {
  name: string;
  widgetKey: string;
  storageKey?: string;
}

export function DashboardWidgetNode({ id, selected, data }: NodeProps) {
  const { deleteNode, bringToFront } = useNodeActions();
  const rootRef = useRef<HTMLDivElement | null>(null);

  const nodeData = data as DashboardWidgetNodeData;
  const widgetEntry = getDashboardWidget(nodeData.widgetKey);

  if (!widgetEntry) {
    return (
      <div className="rounded border border-red-300 bg-red-50 p-3 text-xs text-red-700">
        Unknown widget: {nodeData.widgetKey}
      </div>
    );
  }

  const { Component } = widgetEntry;
  // Use node-specific storage key so instances maintain their own state or fall back to shared
  const storageKey = nodeData.storageKey || `${nodeData.widgetKey}.${id}`;

  return (
    <div
      ref={rootRef}
      onPointerDown={() => bringToFront(id)}
      className={`group relative flex h-full w-full flex-col overflow-visible rounded-lg border-2 bg-white shadow-md transition-shadow ${
        selected ? "border-blue-500 ring-2 ring-blue-200 z-50" : "border-zinc-300/80 hover:border-blue-400"
      }`}
    >
      <NodeResizer
        minWidth={280}
        minHeight={80}
        isVisible={!!selected}
        handleClassName="!h-2 !w-2 !rounded-sm !border-white !bg-blue-500"
        lineClassName="!border-blue-400"
      />

      {/* 4 Connection handles */}
      <Handle type="source" position={Position.Top} id="top" className={handleClass} />
      <Handle type="source" position={Position.Right} id="right" className={handleClass} />
      <Handle type="source" position={Position.Bottom} id="bottom" className={handleClass} />
      <Handle type="source" position={Position.Left} id="left" className={handleClass} />

      {/* Floated clear of the card, not overlapping its corner.
          At -right-2 -top-2 more than half the button sat on the card, covering
          whatever control the widget puts in its own top-right corner.

          Always rendered rather than shown on hover: sitting outside the card
          means reaching for it takes the cursor across the gap between the two,
          which fired the card's mouseleave and unmounted the button mid-reach.
          The offset also clears the top-right resize handle, which straddles
          the corner when the node is selected. */}
      <button
        type="button"
        title="Remove from board"
        aria-label="Remove widget from board"
        onClick={(e) => {
          e.stopPropagation();
          deleteNode(id);
        }}
        className="nodrag nopan absolute -top-7 right-0 z-30 flex h-5 w-5 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-400 shadow-md transition-colors hover:bg-red-500 hover:text-white hover:border-red-500"
      >
        <svg viewBox="0 0 14 14" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="2" y1="2" x2="12" y2="12" />
          <line x1="12" y1="2" x2="2" y2="12" />
        </svg>
      </button>

      {/* Component viewport */}
      <div className="min-h-0 w-full flex-1 overflow-visible rounded-md p-0.5">
        <Component storageKey={storageKey} editable={true} />
      </div>
    </div>
  );
}
