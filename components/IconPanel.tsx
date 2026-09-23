"use client";

import { useCallback, useRef, useState, type DragEvent, type PointerEvent as ReactPointerEvent } from "react";

// The sidebar groups its content into tabs. Components holds the widget
// library; General is a slot for later — a future set of primitives (labels,
// notes, connectors) will slot in without changing the sidebar shell.
export type SidebarTab = "components" | "general" | "modals" | "graphs" | "dashboard";

// Popup modal previews shown in the Modals tab. Each entry is a tile that
// opens its own modal; adding a new modal here means one row and one component.
type ModalId = "success" | "submission" | "blocked";

interface ModalTile {
  id: ModalId;
  label: string;
  description: string;
  swatch: string;
  glyph: React.ReactNode;
}

const CHECK_GLYPH = (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const SUBMISSION_GLYPH = (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);
const BLOCKED_GLYPH = (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const MODAL_TILES: ModalTile[] = [
  {
    id: "success",
    label: "Success",
    description: "Positive-confirmation popup",
    swatch: "bg-emerald-500 text-white",
    glyph: CHECK_GLYPH,
  },
  {
    id: "blocked",
    label: "Account blocked",
    description: "Security warning popup",
    swatch: "bg-red-500 text-white",
    glyph: BLOCKED_GLYPH,
  },
  {
    id: "submission",
    label: "Submission",
    description: "Confirm before submitting",
    swatch: "bg-blue-100 text-blue-600",
    glyph: SUBMISSION_GLYPH,
  },
];

const TABS: { id: SidebarTab; label: string }[] = [
  { id: "components", label: "Components" },
  { id: "general", label: "General" },
  { id: "modals", label: "Modals" },
  { id: "graphs", label: "Graphs" },
  { id: "dashboard", label: "Dashboard" },
];
import type { IconDef } from "../lib/types";
import { IconArt } from "./IconArt";
import { GRAPHS } from "./graphs/registry";
import { SHAPES } from "./shapes/registry";
import { SubmissionModal } from "./modals/SubmissionModal";
import { SuccessModal } from "./modals/SuccessModal";
import { BlockedModal } from "./modals/BlockedModal";

interface IconPanelProps {
  icons: IconDef[];
  isOpen: boolean;
  /** Current open width in px; ignored while collapsed. */
  width: number;
  onToggle: () => void;
  onWidthChange: (width: number) => void;
  /** Fired as a drag starts and ends, so the canvas can drop its transition. */
  onResizingChange?: (resizing: boolean) => void;
  onClickIcon: (icon: IconDef) => void;
  /** Fired whenever the active sidebar tab changes. */
  onTabChange?: (tab: SidebarTab) => void;
  /** Fired when the user clicks or drops the Dashboard tile. */
  onOpenDashboard?: () => void;
}

/** Default open width, and the bounds a drag may resize between. */
export const SIDEBAR_WIDTH_OPEN = 220;
export const SIDEBAR_WIDTH_CLOSED = 48;
export const SIDEBAR_MIN_WIDTH = 150;
export const SIDEBAR_MAX_WIDTH = 560;

export function clampSidebarWidth(width: number): number {
  return Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, Math.round(width)));
}

export function IconPanel({
  icons,
  isOpen,
  width,
  onToggle,
  onWidthChange,
  onResizingChange,
  onClickIcon,
  onTabChange,
  onOpenDashboard,
}: IconPanelProps) {
  const [resizing, setResizing] = useState(false);
  const [activeTab, setActiveTab] = useState<SidebarTab>("components");
  const [openModal, setOpenModal] = useState<ModalId | null>(null);
  const frame = useRef<number | null>(null);

  // The panel is pinned to the left edge, so the pointer's x is the new width.
  // Updates are coalesced to one per frame: a drag fires far more pointermove
  // events than React needs to re-render 81 widget tiles smoothly.
  const handleResizePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      setResizing(true);
      onResizingChange?.(true);
    },
    [onResizingChange]
  );

  const handleResizePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!resizing) return;
      const x = event.clientX;
      if (frame.current !== null) return;
      frame.current = requestAnimationFrame(() => {
        frame.current = null;
        onWidthChange(clampSidebarWidth(x));
      });
    },
    [resizing, onWidthChange]
  );

  const endResize = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (frame.current !== null) {
      cancelAnimationFrame(frame.current);
      frame.current = null;
    }
    setResizing(false);
    onResizingChange?.(false);
  }, [onResizingChange]);
  function handleDragStart(event: DragEvent<HTMLDivElement>, icon: IconDef) {
    event.dataTransfer.setData(
      "application/x-widget-icon",
      JSON.stringify(icon)
    );
    event.dataTransfer.effectAllowed = "move";
  }

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-20 flex flex-col overflow-hidden border-r border-zinc-200 bg-zinc-50 ${
        // No width transition mid-drag, or the panel lags behind the pointer.
        resizing ? "" : "transition-[width] duration-200 ease-in-out"
        }`}
      style={{ width: isOpen ? width : SIDEBAR_WIDTH_CLOSED }}
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
          {/* Tabs */}
          <div
            role="tablist"
            aria-label="Sidebar sections"
            className="flex shrink-0 border-b border-zinc-200 bg-zinc-50"
          >
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => { setActiveTab(tab.id); onTabChange?.(tab.id); }}
                  className={`flex-1 border-b-2 px-2 py-2 text-[11px] font-medium transition-colors ${active
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-zinc-500 hover:text-zinc-700"
                    }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {activeTab === "components" && (
            /* Widget grid */
            <div className="scrollbar-hidden min-h-0 flex-1 overflow-y-auto p-2">
              <div
                className="grid gap-2"
                style={{
                  gridTemplateColumns: "repeat(auto-fill, minmax(84px, 1fr))",
                }}
              >
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
                  <p className="col-span-full py-4 text-center text-[11px] text-zinc-400">
                    No components
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === "general" && (
            <div className="scrollbar-hidden min-h-0 flex-1 overflow-y-auto p-2">
              <div
                className="grid gap-2"
                style={{
                  gridTemplateColumns: "repeat(auto-fill, minmax(84px, 1fr))",
                }}
              >
                {SHAPES.map((shape) => {
                  // Each tile is an IconDef so the same click/drag handlers
                  // that place widgets also place shapes.
                  const tile = {
                    id: shape.key,
                    name: shape.label,
                    componentKey: shape.key,
                  };
                  return (
                    <div
                      key={shape.key}
                      draggable
                      onDragStart={(e) => handleDragStart(e, tile)}
                      onClick={() => onClickIcon(tile)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && onClickIcon(tile)}
                      className="group flex cursor-pointer flex-col items-center gap-1 rounded-md border border-zinc-200 bg-white p-1.5 hover:border-blue-400 hover:bg-blue-50 active:scale-95"
                      title={shape.label}
                    >
                      <div className="flex h-14 w-full items-center justify-center px-1">
                        <shape.Component className="max-h-full max-w-full" />
                      </div>
                      <span className="w-full truncate text-center text-[9px] leading-tight text-zinc-500">
                        {shape.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "dashboard" && (
            <div className="scrollbar-hidden min-h-0 flex-1 overflow-y-auto p-2">
              <p className="mb-2 px-1 text-[10px] text-zinc-400">
                Click to open · or drag onto the board
              </p>
              <div
                role="button"
                tabIndex={0}
                draggable
                onClick={() => onOpenDashboard?.()}
                onKeyDown={(e) => e.key === "Enter" && onOpenDashboard?.()}
                onDragStart={(event) => {
                  event.dataTransfer.setData(
                    "application/x-widget-dashboard",
                    "1"
                  );
                  event.dataTransfer.effectAllowed = "copy";
                }}
                className="group cursor-pointer overflow-hidden rounded-md border border-zinc-200 bg-white p-2 hover:border-blue-400 hover:bg-blue-50 active:scale-[0.98]"
              >
                <div className="mb-1.5 flex h-24 items-center justify-center rounded bg-gradient-to-br from-blue-50 to-white">
                  <svg
                    viewBox="0 0 160 100"
                    className="h-full w-full"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect width="160" height="14" fill="#1e3a8a" />
                    <rect x="6" y="20" width="100" height="4" rx="1" fill="#dc2626" />
                    <rect x="6" y="28" width="60" height="3" rx="1" fill="#9ca3af" />
                    <rect x="6" y="36" width="148" height="20" rx="2" fill="#eff6ff" stroke="#bfdbfe" strokeWidth="0.6" />
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <rect
                        key={i}
                        x={9 + i * 24}
                        y={40}
                        width={20}
                        height={12}
                        rx={1.5}
                        fill="#ffffff"
                        stroke="#e5e7eb"
                        strokeWidth="0.4"
                      />
                    ))}
                    <rect x="6" y="60" width="100" height="34" rx="2" fill="#ffffff" stroke="#bfdbfe" strokeWidth="0.6" />
                    <rect x="110" y="60" width="44" height="34" rx="2" fill="#ffffff" stroke="#bfdbfe" strokeWidth="0.6" />
                    {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                      <rect
                        key={i}
                        x={8}
                        y={64 + i * 4}
                        width={96}
                        height={2.5}
                        rx={0.5}
                        fill={i < 3 ? "#fecaca" : "#f3f4f6"}
                      />
                    ))}
                  </svg>
                </div>
                <div className="text-[11px] font-semibold text-zinc-800">
                  SEQUENCE OF EVENTS (SOE)
                </div>
                <div className="mt-0.5 text-[10px] text-zinc-500">
                  AUTRIXA Distribution SCADA template
                </div>
              </div>
            </div>
          )}

          {activeTab === "graphs" && (
            <div className="scrollbar-hidden min-h-0 flex-1 overflow-y-auto p-2">
              <div
                className="grid gap-2"
                style={{
                  gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
                }}
              >
                {GRAPHS.map((graph) => {
                  const tile = {
                    id: graph.key,
                    name: graph.label,
                    componentKey: graph.key,
                  };
                  return (
                    <div
                      key={graph.key}
                      draggable
                      onDragStart={(e) => handleDragStart(e, tile)}
                      onClick={() => onClickIcon(tile)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && onClickIcon(tile)}
                      title={graph.description}
                      className="group flex min-w-0 cursor-pointer flex-col gap-1 rounded-md border border-zinc-200 bg-white p-2 hover:border-blue-400 hover:bg-blue-50 active:scale-95"
                    >
                      <div className="flex h-20 w-full items-center justify-center overflow-hidden">
                        <graph.Component className="max-h-full max-w-full" />
                      </div>
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate text-[11px] font-medium text-zinc-800">
                          {graph.label}
                        </span>
                        <span className="truncate text-[10px] text-zinc-500">
                          {graph.description}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "modals" && (
            <div className="scrollbar-hidden min-h-0 flex-1 overflow-y-auto p-2">
              <p className="mb-2 px-1 text-[10px] text-zinc-400">
                Click a preview to open the popup
              </p>
              <div className="flex flex-col gap-2">
                {MODAL_TILES.map((tile) => (
                  <button
                    key={tile.id}
                    type="button"
                    onClick={() => setOpenModal(tile.id)}
                    className="group flex items-center gap-2 rounded-md border border-zinc-200 bg-white p-2 text-left hover:border-blue-400 hover:bg-blue-50"
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${tile.swatch}`}
                    >
                      {tile.glyph}
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-[11px] font-medium text-zinc-800">
                        {tile.label}
                      </span>
                      <span className="truncate text-[10px] text-zinc-500">
                        {tile.description}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
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
      <SuccessModal
        open={openModal === "success"}
        onClose={() => setOpenModal(null)}
      />
      <BlockedModal
        open={openModal === "blocked"}
        onClose={() => setOpenModal(null)}
      />
      <SubmissionModal
        open={openModal === "submission"}
        onClose={() => setOpenModal(null)}
      />

      {/* Drag handle on the right edge. Only while open — there is nothing to
          resize when the panel is collapsed to its icon strip. */}
      {isOpen && (
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize sidebar"
          onPointerDown={handleResizePointerDown}
          onPointerMove={handleResizePointerMove}
          onPointerUp={endResize}
          onPointerCancel={endResize}
          onDoubleClick={() => onWidthChange(SIDEBAR_WIDTH_OPEN)}
          title="Drag to resize · double-click to reset"
          className={`absolute inset-y-0 right-0 z-10 w-1.5 cursor-col-resize touch-none transition-colors ${resizing ? "bg-blue-500" : "bg-transparent hover:bg-blue-300"
            }`}
        />
      )}
    </aside>
  );
}
