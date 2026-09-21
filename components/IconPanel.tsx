"use client";

import type { DragEvent } from "react";
import type { IconDef } from "../lib/types";
import { IconArt } from "./IconArt";

interface IconPanelProps {
  icons: IconDef[];
  isOpen: boolean;
  onToggle: () => void;
  onClickIcon: (icon: IconDef) => void;
}

export const SIDEBAR_WIDTH_OPEN = 220;
export const SIDEBAR_WIDTH_CLOSED = 48;

export function IconPanel({
  icons,
  isOpen,
  onToggle,
  onClickIcon,
}: IconPanelProps) {
  function handleDragStart(event: DragEvent<HTMLDivElement>, icon: IconDef) {
    event.dataTransfer.setData(
      "application/x-widget-icon",
      JSON.stringify(icon)
    );
    event.dataTransfer.effectAllowed = "move";
  }

  return (
    <aside
      className="fixed inset-y-0 left-0 z-20 flex flex-col overflow-hidden border-r border-zinc-200 bg-zinc-50 transition-[width] duration-200 ease-in-out"
      style={{ width: isOpen ? SIDEBAR_WIDTH_OPEN : SIDEBAR_WIDTH_CLOSED }}
    >
      {/* Toggle row — always visible */}
      <div className="flex h-11 shrink-0 items-center border-b border-zinc-200">
        {isOpen && (
          <span className="ml-3 flex-1 select-none text-[13px] font-semibold text-zinc-800">
            Widgets
          </span>
        )}
        <button
          type="button"
          onClick={onToggle}
          aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          className="flex h-full w-11 shrink-0 items-center justify-center text-zinc-400 hover:text-zinc-700"
        >
          <svg
            viewBox="0 0 16 16"
            className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "" : "rotate-180"}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="10 4 6 8 10 12" />
          </svg>
        </button>
      </div>

      {/* ── EXPANDED ── */}
      {isOpen && (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="border-b border-zinc-200 px-2.5 pb-2 pt-2">
            <p className="text-[10px] text-zinc-400">
              Click to add · Drag to place
            </p>
          </div>

          {/* Widget grid */}
          <div className="scrollbar-hidden min-h-0 flex-1 overflow-y-auto p-2">
            <div className="grid grid-cols-2 gap-2">
              {icons.map((icon) => (
                <div
                  key={icon.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, icon)}
                  onClick={() => onClickIcon(icon)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && onClickIcon(icon)}
                  className="group relative flex cursor-pointer flex-col items-center gap-1 rounded-md border border-zinc-200 bg-white p-1.5 hover:border-blue-400 hover:bg-blue-50 active:scale-95"
                >
                  <IconArt
                    componentKey={icon.componentKey}
                    svg={icon.svg}
                    className="flex h-14 w-full items-center justify-center [&_svg]:h-full [&_svg]:w-full [&_img]:h-full [&_img]:w-full [&_img]:object-contain"
                  />
                  <span className="w-full truncate text-center text-[9px] leading-tight text-zinc-500">
                    {icon.name}
                  </span>
                </div>
              ))}
              {icons.length === 0 && (
                <p className="col-span-2 py-4 text-center text-[11px] text-zinc-400">
                  No widgets
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── COLLAPSED ── widget strip */}
      {!isOpen && (
        <div className="flex flex-col items-center gap-1.5 overflow-y-auto py-2">
          {icons.map((icon) => (
            <button
              key={icon.id}
              type="button"
              onClick={() => onClickIcon(icon)}
              title={icon.name}
              className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-zinc-200"
            >
              <IconArt
                componentKey={icon.componentKey}
                svg={icon.svg}
                className="h-8 w-8 [&_svg]:h-full [&_svg]:w-full [&_img]:h-full [&_img]:w-full [&_img]:object-contain"
              />
            </button>
          ))}
        </div>
      )}
    </aside>
  );
}
