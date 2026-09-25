"use client";

// A popover that escapes clipping ancestors.
//
// The stats cards scroll their tile row horizontally to keep every tile on one
// line. `overflow-x: auto` forces `overflow-y` to compute to `auto` as well —
// CSS does not allow one axis to clip while the other stays visible — so a
// popover anchored inside a tile was being cut off below the row and appeared
// not to open at all.
//
// Rendering into document.body sidesteps every clipping ancestor. Position is
// fixed and derived from the anchor's viewport rect, so it also stays correct
// under the board's zoom transform.

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

const MARGIN = 8;

export interface PickerPopoverProps {
  /** The element the popover is positioned against. */
  anchor: HTMLElement | null;
  width: number;
  onClose: () => void;
  children: ReactNode;
}

export function PickerPopover({
  anchor,
  width,
  onClose,
  children,
}: PickerPopoverProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  // Measured before paint so the popover never flashes in the wrong place.
  useLayoutEffect(() => {
    if (!anchor) return;

    function place() {
      const a = anchor!.getBoundingClientRect();
      const height = ref.current?.offsetHeight ?? 0;

      // A viewport of 0 means the window has not reported a size yet. Clamping
      // against that would drag the popover to the top-left corner, so fall
      // back to the anchor's own position until a real size is known.
      const vw = window.innerWidth || document.documentElement.clientWidth || 0;
      const vh = window.innerHeight || document.documentElement.clientHeight || 0;

      // Below the anchor by default; above it when there is no room below.
      let top = a.bottom + 4;
      if (vh > 0 && height && top + height > vh - MARGIN) {
        const above = a.top - height - 4;
        top = above >= MARGIN ? above : Math.max(MARGIN, vh - height - MARGIN);
      }

      const left =
        vw > 0
          ? Math.min(
              Math.max(MARGIN, a.left),
              Math.max(MARGIN, vw - width - MARGIN)
            )
          : a.left;

      setPos({ top, left });
    }

    place();
    // The board can be panned or zoomed while the popover is open.
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [anchor, width]);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node;
      // A click on the anchor is the toggle; let that handler decide.
      if (ref.current?.contains(target) || anchor?.contains(target)) return;
      onClose();
    }
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [anchor, onClose]);

  if (!anchor) return null;

  return createPortal(
    <div
      ref={ref}
      style={{
        position: "fixed",
        width,
        top: pos?.top ?? -9999,
        left: pos?.left ?? -9999,
        // Hidden until measured, so it cannot flash at the fallback offset.
        visibility: pos ? "visible" : "hidden",
      }}
      // A React portal still bubbles events to its React parent, which here is
      // a board node — stop them so clicks inside do not reach it.
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
      className="nodrag nopan z-[10000] rounded-md border border-zinc-200 bg-white p-2 text-left shadow-xl"
    >
      {children}
    </div>,
    document.body
  );
}
