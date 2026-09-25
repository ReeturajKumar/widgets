"use client";

// Drag-to-reorder for the KPI tiles in both dashboard stats cards.
//
// Only a small grip is draggable, not the tile itself: the tiles contain
// inline-editable text, and making the whole tile draggable would hijack
// click-and-drag text selection inside those editors.
//
// The tile is still the *drop* target, so you can aim anywhere on it.

import { useState, type DragEvent } from "react";

/** Private to this interaction, so the board's own drop handler ignores it. */
const MIME = "application/x-kpi-tile";

export interface TileReorder {
  draggingId: string | null;
  /** Spread onto the grip handle — the only draggable element. */
  gripProps: (id: string) => Record<string, unknown>;
  /** Spread onto the tile root, which accepts the drop. */
  dropProps: (id: string) => Record<string, unknown>;
}

export function useTileReorder<T extends { id: string }>(
  tiles: T[],
  onReorder: (next: T[]) => void,
  enabled: boolean
): TileReorder {
  const [draggingId, setDraggingId] = useState<string | null>(null);

  function move(fromId: string, toId: string) {
    if (fromId === toId) return;
    const from = tiles.findIndex((t) => t.id === fromId);
    const to = tiles.findIndex((t) => t.id === toId);
    if (from < 0 || to < 0) return;
    const next = [...tiles];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onReorder(next);
  }

  return {
    draggingId,

    gripProps: (id) =>
      !enabled
        ? {}
        : {
            draggable: true,
            // nodrag/nopan: without them React Flow pans the board instead.
            className: "nodrag nopan",
            onDragStart: (event: DragEvent) => {
              event.stopPropagation();
              event.dataTransfer.effectAllowed = "move";
              event.dataTransfer.setData(MIME, id);
              setDraggingId(id);
            },
            onDragEnd: () => setDraggingId(null),
          },

    dropProps: (id) =>
      !enabled
        ? {}
        : {
            onDragOver: (event: DragEvent) => {
              if (!draggingId) return;
              // preventDefault marks this a valid drop target; without it the
              // browser shows a "no drop" cursor and fires no drop event.
              event.preventDefault();
              event.stopPropagation();
              event.dataTransfer.dropEffect = "move";
              // Reorder as you pass over, so the row previews the result
              // rather than jumping only on release.
              move(draggingId, id);
            },
            onDrop: (event: DragEvent) => {
              event.preventDefault();
              event.stopPropagation();
              const fromId = event.dataTransfer.getData(MIME) || draggingId;
              if (fromId) move(fromId, id);
              setDraggingId(null);
            },
          },
  };
}
