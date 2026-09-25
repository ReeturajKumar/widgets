"use client";

import { NodeResizer, type NodeProps } from "@xyflow/react";
import { useEffect, useRef, useState } from "react";
import { DashboardPage } from "./dashboard/DashboardPage";
import { OutageDashboardPage } from "./dashboard/outage/OutageDashboardPage";
import { useNodeActions } from "./NodeActionsContext";

/** Natural width the dashboard is designed at — the min-w in DashboardPage. */
const NATURAL_WIDTH = 1280;

export type DashboardTemplateId = "soe" | "outage";

/**
 * React Flow node that hosts the entire SCADA dashboard.
 * Supports both Sequence of Events (SOE) and Outage Monitoring templates.
 */
export function DashboardNode({ id, selected, data }: NodeProps) {
  const { deleteNode } = useNodeActions();
  const [scale, setScale] = useState(1);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const initialTemplate = ((data as Record<string, unknown>)?.templateId as DashboardTemplateId) || "soe";
  const [template, setTemplate] = useState<DashboardTemplateId>(initialTemplate);

  // Fit the dashboard to whatever width the node has been resized to.
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

  // The root deliberately has no overflow-hidden: NodeResizer renders its
  // handles inside this element, sitting astride its edges, so clipping here
  // would hide the outer half of every dot. The scroll container does it.
  return (
    <div
      ref={rootRef}
      className="relative h-full w-full rounded-lg border-2 border-white bg-zinc-100 shadow-xl"
    >
      {/* Always visible, not gated on hover or selection. The dashboard fills
          the node with its own interactive controls, so clicks land on those
          and the node may never become selected — which left the handles
          unreachable. Permanent dots also mean they are already mounted when a
          drag starts, instead of racing the hover re-render. */}
      <NodeResizer
        minWidth={480}
        minHeight={320}
        isVisible
        handleClassName="!z-40 !h-2.5 !w-2.5 !rounded-full !border-2 !border-white !bg-blue-500 !shadow"
        lineClassName={`!z-30 ${selected ? "!border-blue-500" : "!border-transparent"}`}
      />

      {/* Floated above the card rather than inside it: at top-2 right-2 it sat
          on the dashboard's own navbar controls. The offset clears the
          top-right resize handle too, which straddles the corner.

          Always rendered, not shown on hover: the button sits a few pixels
          clear of the card, and reaching for it takes the cursor across that
          gap — which fired the card's mouseleave and unmounted the button just
          as it was being aimed at. */}
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          deleteNode(id);
        }}
        title="Remove dashboard"
        aria-label="Remove dashboard"
        className="nodrag nopan absolute -top-9 right-0 z-40 flex h-6 w-6 items-center justify-center rounded-full bg-white text-red-600 shadow-md ring-1 ring-zinc-200 hover:bg-red-500 hover:text-white hover:ring-red-500"
      >
        <svg viewBox="0 0 14 14" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="1" y1="1" x2="13" y2="13" />
          <line x1="13" y1="1" x2="1" y2="13" />
        </svg>
      </button>

      <div
        style={{ zoom: scale }}
        className="h-full w-full overflow-auto rounded-[6px]"
      >
        {template === "outage" ? <OutageDashboardPage /> : <DashboardPage />}
      </div>
    </div>
  );
}
