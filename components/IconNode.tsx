"use client";

import { useEffect, useRef, useState } from "react";
import { Handle, NodeResizer, Position, type NodeProps } from "@xyflow/react";
import { useNodeActions } from "./NodeActionsContext";
import { IconArt } from "./IconArt";
import { DEFAULT_THEME_ID, WIDGET_THEMES } from "../lib/widgetThemes";

export interface IconNodeData extends Record<string, unknown> {
  name: string;
  /** Raw markup, for uploaded icons and widgets not yet traced. */
  svg?: string;
  /** Registry key for a built widget component. */
  componentKey?: string;
  /** Colour theme id from lib/widgetThemes. */
  theme?: string;
  rotation?: number;
}

export const NODE_MIN_SIZE = 70;

const handleClass =
  "!h-2.5 !w-2.5 !border-2 !border-white !bg-zinc-400";

export function IconNode({ id, data, selected }: NodeProps) {
  const {
    name,
    svg,
    componentKey,
    theme = DEFAULT_THEME_ID,
    rotation = 0,
  } = data as IconNodeData;
  const {
    deleteNode,
    startReplace,
    rotateNode,
    themeNode,
    themeAllNodes,
    replacingNodeId,
  } = useNodeActions();
  const [hovered, setHovered] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // The picker is positioned above the node, outside its box, so closing on
  // mouse-leave would pull it out from under the pointer on the way there.
  // Dismiss on an outside press or Escape instead.
  //
  // Both listeners run in the capture phase: React Flow stops propagation on
  // pointerdown over the pane so it can start a pan, which would otherwise
  // swallow the press and leave the picker stuck open.
  useEffect(() => {
    if (!themeOpen) return;
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setThemeOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setThemeOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [themeOpen]);

  const isReplacing = replacingNodeId === id;

  return (
    <div
      ref={rootRef}
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
      {(hovered || themeOpen) && !replacingNodeId && (
        <div
          // nodrag/nopan: without them React Flow starts dragging the node on
          // pointerdown over these buttons, and a click that moves even a pixel
          // is swallowed by the drag instead of firing.
          className="nodrag nopan absolute -right-2 -top-2 z-10 flex gap-px rounded-full border border-zinc-200 bg-white px-0.5 py-0.5 shadow-md"
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


          {/* Colour theme button */}
          <button
            type="button"
            title="Colour theme"
            onClick={(e) => {
              e.stopPropagation();
              setThemeOpen((v) => !v);
            }}
            className={`flex h-3.5 w-3.5 items-center justify-center rounded-full hover:bg-violet-100 hover:text-violet-600 ${
              themeOpen ? "bg-violet-100 text-violet-600" : "text-zinc-500"
            }`}
          >
            <svg viewBox="0 0 16 16" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 1.5a6.5 6.5 0 1 0 0 13c.9 0 1.4-.6 1.4-1.3 0-.8-.7-1.2-.7-1.9 0-.5.4-.9 1-.9h1.2A3.6 3.6 0 0 0 14.5 6.8C14.5 3.8 11.6 1.5 8 1.5Z" />
              <circle cx="5.2" cy="6" r=".9" fill="currentColor" stroke="none" />
              <circle cx="8" cy="4.6" r=".9" fill="currentColor" stroke="none" />
              <circle cx="10.9" cy="6" r=".9" fill="currentColor" stroke="none" />
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


      {/* Colour theme picker */}
      {themeOpen && (
        <div
          className="nodrag nopan absolute -top-14 left-1/2 z-30 w-max -translate-x-1/2 rounded-lg border border-zinc-200 bg-white px-2 py-1.5 shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-1.5">
            {WIDGET_THEMES.map((option) => (
              <button
                key={option.id}
                type="button"
                title={option.label}
                onClick={() => themeNode(id, option.id)}
                style={{ backgroundColor: option.swatch }}
                className={`h-3.5 w-3.5 rounded-full ring-offset-1 transition-transform hover:scale-125 ${
                  theme === option.id ? "ring-2 ring-zinc-800" : "ring-1 ring-black/10"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              themeAllNodes(theme);
              setThemeOpen(false);
            }}
            className="mt-1.5 w-full rounded border border-zinc-200 px-1.5 py-0.5 text-[9px] font-medium text-zinc-600 hover:border-violet-400 hover:text-violet-600"
          >
            Apply to all widgets
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
        <IconArt
          componentKey={componentKey}
          svg={svg}
          theme={theme}
          className="h-full w-full [&_svg]:block [&_svg]:h-full [&_svg]:w-full [&_img]:h-full [&_img]:w-full [&_img]:object-contain"
        />
      </div>
    </div>
  );
}
