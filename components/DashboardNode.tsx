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
  const [hovered, setHovered] = useState(false);
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

      {/* Delete button on hover */}
      {hovered && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            deleteNode(id);
          }}
          title="Remove dashboard"
          aria-label="Remove dashboard"
          className="nodrag nopan absolute top-2 right-2 z-30 flex h-6 w-6 items-center justify-center rounded-full bg-white/95 text-red-600 shadow hover:bg-red-500 hover:text-white"
        >
          <svg viewBox="0 0 14 14" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="1" y1="1" x2="13" y2="13" />
            <line x1="13" y1="1" x2="1" y2="13" />
          </svg>
        </button>
      )}

      <div
        style={{ zoom: scale }}
        className="h-full w-full overflow-auto"
      >
        {template === "outage" ? <OutageDashboardPage /> : <DashboardPage />}
      </div>
    </div>
  );
}
