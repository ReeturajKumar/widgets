import type { Edge, Node } from "@xyflow/react";
import type { EdgeStyle } from "./types";

const BOARD_KEY = "widgets.board.v1";
const EDGE_STYLE_KEY = "widgets.edgeStyle.v1";

export interface BoardState {
  nodes: Node[];
  edges: Edge[];
}

function read<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or unavailable; drop silently
  }
}

export function loadBoard(): BoardState | null {
  return read<BoardState>(BOARD_KEY);
}

export function saveBoard(board: BoardState) {
  write(BOARD_KEY, board);
}

export function loadEdgeStyle(): EdgeStyle | null {
  return read<EdgeStyle>(EDGE_STYLE_KEY);
}

export function saveEdgeStyle(style: EdgeStyle) {
  write(EDGE_STYLE_KEY, style);
}
