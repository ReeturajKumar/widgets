"use client";

import { createContext, useContext } from "react";

export interface NodeActions {
  deleteNode: (id: string) => void;
  startReplace: (id: string) => void;
  rotateNode: (id: string) => void;
  replacingNodeId: string | null;
}

export const NodeActionsContext = createContext<NodeActions>({
  deleteNode: () => {},
  startReplace: () => {},
  rotateNode: () => {},
  replacingNodeId: null,
});

export function useNodeActions() {
  return useContext(NodeActionsContext);
}
