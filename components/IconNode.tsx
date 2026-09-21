"use client";

import { useState } from "react";
import { Handle, NodeResizer, Position, type NodeProps } from "@xyflow/react";
import { useNodeActions } from "./NodeActionsContext";
import { InlineSvg } from "./InlineSvg";

export interface IconNodeData extends Record<string, unknown> {
  name: string;
  svg: string;
  rotation?: number;
}

export const NODE_MIN_SIZE = 70;

const handleClass =
  "!h-2.5 !w-2.5 !border-2 !border-white !bg-zinc-400";

export function IconNode({ id, data, selected }: NodeProps) {
  const { name, svg, rotation = 0 } = data as IconNodeData;
  const { deleteNode, startReplace, rotateNode, replacingNodeId } =
    useNodeActions();
  const [hovered, setHovered] = useState(false);

  const isReplacing = replacingNodeId === id;

  return (
    <div
      title={name}
      className={`group relative flex h-full w-full flex-col items-center rounded-lg border-2 bg-white p-1 shadow-sm ${
        isReplacing
          ? "border-amber-400 ring-2 ring-amber-300 ring-offset-1 animate-pulse"
          : selected
            ? "border-blue-500"
            : "border-zinc-200"
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <NodeResizer
        minWidth={NODE_MIN_SIZE}
        minHeight={NODE_MIN_SIZE}
        isVisible={selected && !replacingNodeId}
        lineClassName="!border-blue-400"
        handleClassName="!h-2 !w-2 !rounded-sm !border-white !bg-blue-500"
      />

      <Handle type="source" position={Position.Top} id="top" className={handleClass} />
      <Handle type="source" position={Position.Right} id="right" className={handleClass} />
      <Handle type="source" position={Position.Bottom} id="bottom" className={handleClass} />
      <Handle type="source" position={Position.Left} id="left" className={handleClass} />

      {/* Hover action buttons — only when hovered and not in any replace mode */}
      {hovered && !replacingNodeId && (
        <div
          className="absolute -right-2 -top-2 z-10 flex gap-px rounded-full border border-zinc-200 bg-white px-0.5 py-0.5 shadow-md"
          onMouseEnter={() => setHovered(true)}
        >
          {/* Rotate button */}
          <button
            type="button"
            title="Rotate 90°"
            onClick={(e) => {
              e.stopPropagation();
              rotateNode(id);
            }}
            className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-zinc-500 hover:bg-blue-100 hover:text-blue-600"
          >
            <svg viewBox="0 0 24 24" className="h-2 w-2" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
            </svg>
          </button>

          {/* Replace button */}
          <button
            type="button"
            title="Replace icon — click a sidebar icon to swap"
            onClick={(e) => {
              e.stopPropagation();
              startReplace(id);
            }}
            className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-zinc-500 hover:bg-amber-100 hover:text-amber-600"
          >
            <svg viewBox="0 0 14 14" className="h-2 w-2" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 4h9M7 1l3 3-3 3" />
              <path d="M13 10H4M7 7l-3 3 3 3" />
            </svg>
          </button>

          {/* Delete button */}
          <button
            type="button"
            title="Remove from canvas"
            onClick={(e) => {
              e.stopPropagation();
              deleteNode(id);
            }}
            className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-zinc-500 hover:bg-red-100 hover:text-red-600"
          >
            <svg viewBox="0 0 14 14" className="h-2 w-2" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="2" y1="2" x2="12" y2="12" />
              <line x1="12" y1="2" x2="2" y2="12" />
            </svg>
          </button>
        </div>
      )}

      {/* Replace mode hint badge */}
      {isReplacing && (
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-amber-500 px-1.5 py-0.5 text-[9px] font-medium text-white shadow">
          Click sidebar icon ↑
        </div>
      )}

      <div
        className="flex min-h-0 w-full flex-1 items-center justify-center rounded-md transition-transform duration-150"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <InlineSvg
          svg={svg}
          className="h-full w-full [&_svg]:block [&_svg]:h-full [&_svg]:w-full [&_img]:h-full [&_img]:w-full [&_img]:object-contain"
        />
      </div>
    </div>
  );
}
