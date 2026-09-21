import type { Edge, Node } from "@xyflow/react";
import type { EdgeStyle, IconDef } from "./types";

// Only uploaded (user-added) icons are persisted; builtin icons come from code.
const UPLOADED_ICONS_KEY = "widgets.uploadedIcons.v1";
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

export function loadUploadedIcons(): IconDef[] {
  return read<IconDef[]>(UPLOADED_ICONS_KEY) ?? [];
}

export function saveUploadedIcons(icons: IconDef[]) {
  write(UPLOADED_ICONS_KEY, icons);
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
