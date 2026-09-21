"use client";

import { createContext, useContext } from "react";

export interface NodeActions {
  deleteNode: (id: string) => void;
  startReplace: (id: string) => void;
  rotateNode: (id: string) => void;
  /** Theme one node. */
  themeNode: (id: string, theme: string) => void;
  /** Theme every widget on the board at once. */
  themeAllNodes: (theme: string) => void;
  replacingNodeId: string | null;
}

export const NodeActionsContext = createContext<NodeActions>({
  deleteNode: () => {},
  startReplace: () => {},
  rotateNode: () => {},
  themeNode: () => {},
  themeAllNodes: () => {},
  replacingNodeId: null,
});

export function useNodeActions() {
  return useContext(NodeActionsContext);
}
