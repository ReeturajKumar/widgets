"use client";

import { createContext, useContext } from "react";

export interface NodeActions {
  deleteNode: (id: string) => void;
  startReplace: (id: string) => void;
  rotateNode: (id: string) => void;
  /** Save the caption for a text-shape node. */
  updateText: (id: string, text: string) => void;
  /** Save axis + colour overrides for a chart node. */
  updateChartConfig: (
    id: string,
    config: import("./graphs/types").ChartOverride
  ) => void;
  /** Theme one node. */
  themeNode: (id: string, theme: string) => void;
  /** Theme every widget on the board at once. */
  themeAllNodes: (theme: string) => void;
  /** Bring a node to the absolute top stacking level. */
  bringToFront: (id: string) => void;
  replacingNodeId: string | null;
}

export const NodeActionsContext = createContext<NodeActions>({
  deleteNode: () => {},
  startReplace: () => {},
  rotateNode: () => {},
  updateText: () => {},
  updateChartConfig: () => {},
  themeNode: () => {},
  themeAllNodes: () => {},
  bringToFront: () => {},
  replacingNodeId: null,
});

export function useNodeActions() {
  return useContext(NodeActionsContext);
}
