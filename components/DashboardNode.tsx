"use client";

import { NodeResizer, type NodeProps } from "@xyflow/react";
import { useEffect, useRef, useState } from "react";
import { DashboardPage } from "./dashboard/DashboardPage";
import { useNodeActions } from "./NodeActionsContext";

/** Natural width the dashboard is designed at — the min-w in DashboardPage. */
const NATURAL_WIDTH = 1280;

/**
 * React Flow node that hosts the entire SCADA / SOE dashboard.
 *
 * The dashboard renders at its natural 1280 px width and is scaled to fit the
 * node via CSS `zoom` — that keeps the whole layout visible when the node
 * shrinks and lets the user resize freely. Hover reveals a delete button; the
 * standard React Flow drag handle moves the node around the canvas.
 */
export function DashboardNode({ id, selected }: NodeProps) {
  const { deleteNode } = useNodeActions();
  const [hovered, setHovered] = useState(false);
  const [scale, setScale] = useState(1);
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Fit the dashboard to whatever width the node has been resized to. Clamped
  // so the user doesn't accidentally turn it into an unreadable smear.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      const next = Math.min(1.2, Math.max(0.25, width / NATURAL_WIDTH));
      setScale(next);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={rootRef}
      className="relative h-full w-full overflow-hidden rounded-lg border-2 border-white bg-zinc-100 shadow-xl"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <NodeResizer
        minWidth={480}
        minHeight={320}
        isVisible={!!selected}
        handleClassName="!h-2 !w-2 !rounded-sm !border-white !bg-blue-500"
        lineClassName="!border-blue-400"
      />

      {hovered && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            deleteNode(id);
          }}
          title="Remove dashboard"
          aria-label="Remove dashboard"
          // nodrag/nopan so React Flow doesn't start a pan when the pointer
          // presses on this button.
          className="nodrag nopan absolute right-2 top-2 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-white/95 text-red-600 shadow hover:bg-red-500 hover:text-white"
        >
          <svg viewBox="0 0 14 14" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="1" y1="1" x2="13" y2="13" />
            <line x1="13" y1="1" x2="1" y2="13" />
          </svg>
        </button>
      )}

      <div
        // Non-standard `zoom` beats `transform: scale` here: it scales layout
        // too, so the wrapper's height/scroll matches what the user sees. All
        // major evergreen browsers support it now.
        style={{ zoom: scale }}
        className="h-full w-full overflow-auto"
      >
        <DashboardPage />
      </div>
    </div>
  );
}
