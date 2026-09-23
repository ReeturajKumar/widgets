"use client";

import { useCallback, useEffect, useRef, useState, type DragEvent } from "react";
import {
  Background,
  ConnectionLineType,
  ConnectionMode,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type Edge,
  type EdgeTypes,
  type Node,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { DELETABLE_EDGE_TYPE, DeletableEdge } from "./DeletableEdge";
import { DashboardNode } from "./DashboardNode";
import { DashboardWidgetNode } from "./DashboardWidgetNode";
import { IconNode, NODE_MIN_SIZE, type IconNodeData } from "./IconNode";
import { getGraph } from "./graphs/registry";
import { getShape } from "./shapes/registry";
import { getDashboardWidget } from "./dashboard/widgetRegistry";
import { NodeActionsContext } from "./NodeActionsContext";
import {
  loadBoard,
  loadEdgeStyle,
  saveBoard,
  saveEdgeStyle,
} from "../lib/storage";
import type { EdgeStyle, IconDef } from "../lib/types";

const nodeTypes: NodeTypes = {
  iconNode: IconNode,
  dashboardNode: DashboardNode,
  dashboardWidgetNode: DashboardWidgetNode,
};
const edgeTypes: EdgeTypes = { [DELETABLE_EDGE_TYPE]: DeletableEdge };

// Boards saved before connections became deletable carry React Flow's built-in
// edge types. Route them through the deletable edge, keeping the shape they
// were drawn with, so old boards gain the delete button too.
const VARIANT_BY_BUILTIN_TYPE: Record<string, EdgeStyle> = {
  straight: "straight",
  default: "bezier",
  smoothstep: "step",
};

function asDeletable(edge: Edge): Edge {
  if (edge.type === DELETABLE_EDGE_TYPE) return edge;
  return {
    ...edge,
    type: DELETABLE_EDGE_TYPE,
    data: {
      ...edge.data,
      variant: VARIANT_BY_BUILTIN_TYPE[edge.type ?? "default"] ?? "bezier",
    },
  };
}

const NODE_SIZE = NODE_MIN_SIZE;

// A monotonically-increasing z-index so a freshly placed node always renders
// on top of anything already on the board.
let nextNodeZ = 100;
function claimTopZ(): number {
  nextNodeZ += 1;
  return nextNodeZ;
}

// Node factory for a fresh dashboard drop. Kept next to the placement
// code so a size change lands in exactly one place.
function makeDashboardNode(
  position: { x: number; y: number },
  templateId: "soe" | "outage" = "soe"
): Node<IconNodeData> {
  return {
    id: `dashboard-${crypto.randomUUID()}`,
    type: "dashboardNode",
    position,
    width: 1280,
    height: 820,
    zIndex: claimTopZ(),
    data: {
      name: templateId === "outage" ? "Outage Monitoring" : "SCADA Dashboard",
      templateId,
    },
  };
}

function makeDashboardWidgetNode(
  position: { x: number; y: number },
  widgetKey: string
): Node<IconNodeData> {
  const widget = getDashboardWidget(widgetKey);
  const size = widget?.defaultSize ?? { width: 500, height: 300 };
  return {
    id: `dashwidget-${crypto.randomUUID()}`,
    type: "dashboardWidgetNode",
    position,
    width: size.width,
    height: size.height,
    zIndex: claimTopZ(),
    data: {
      name: widget?.label ?? "Dashboard Component",
      widgetKey,
      storageKey: `${widgetKey}.${crypto.randomUUID().slice(0, 8)}`,
    },
  };
}


const EDGE_STYLE_OPTIONS: {
  value: EdgeStyle;
  label: string;
  edgeType: "straight" | "default" | "smoothstep";
  lineType: ConnectionLineType;
}[] = [
  {
    value: "straight",
    label: "Straight",
    edgeType: "straight",
    lineType: ConnectionLineType.Straight,
  },
  {
    value: "bezier",
    label: "Curved",
    edgeType: "default",
    lineType: ConnectionLineType.Bezier,
  },
  {
    value: "step",
    label: "Orthogonal",
    edgeType: "smoothstep",
    lineType: ConnectionLineType.SmoothStep,
  },
];

function styleFor(edgeStyle: EdgeStyle) {
  return (
    EDGE_STYLE_OPTIONS.find((opt) => opt.value === edgeStyle) ??
    EDGE_STYLE_OPTIONS[1]
  );
}

interface CanvasInnerProps {
  onRegisterAdd: (fn: (icon: IconDef) => void) => void;
  onRegisterPlaceDashboard?: (fn: () => void) => void;
}

function CanvasInner({ onRegisterAdd, onRegisterPlaceDashboard }: CanvasInnerProps) {
  const [initial] = useState(() => ({
    board: loadBoard(),
    edgeStyle: loadEdgeStyle() ?? ("bezier" as EdgeStyle),
  }));

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<IconNodeData>>(
    ((initial.board?.nodes as Node<IconNodeData>[]) ?? []).map((n, index) => ({
      ...n,
      width: n.width ?? NODE_SIZE,
      height: n.height ?? NODE_SIZE,
      zIndex:
        typeof n.zIndex === "number" && n.zIndex < 100000 ? n.zIndex : index + 1,
    }))
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(
    (initial.board?.edges ?? []).map(asDeletable)
  );
  const [edgeStyle, setEdgeStyle] = useState<EdgeStyle>(initial.edgeStyle);
  const [replacingNodeId, setReplacingNodeId] = useState<string | null>(null);
  const replacingNodeIdRef = useRef<string | null>(null);

  // Keep ref in sync so placeIcon closure always sees the current value
  useEffect(() => {
    replacingNodeIdRef.current = replacingNodeId;
  }, [replacingNodeId]);

  const { screenToFlowPosition } = useReactFlow();
  const containerRef = useRef<HTMLDivElement>(null);

  // Cancel replace mode on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setReplacingNodeId(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    saveBoard({ nodes, edges });
  }, [nodes, edges]);

  useEffect(() => {
    saveEdgeStyle(edgeStyle);
  }, [edgeStyle]);

  const deleteNode = useCallback(
    (id: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== id));
      setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
      setReplacingNodeId((prev) => (prev === id ? null : prev));
    },
    [setNodes, setEdges]
  );

  const rotateNode = useCallback(
    (id: string) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === id
            ? {
                ...n,
                data: { ...n.data, rotation: ((n.data.rotation ?? 0) + 90) % 360 },
              }
            : n
        )
      );
    },
    [setNodes]
  );

  const themeNode = useCallback(
    (id: string, theme: string) => {
      setNodes((nds) =>
        nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, theme } } : n))
      );
    },
    [setNodes]
  );

  const themeAllNodes = useCallback(
    (theme: string) => {
      setNodes((nds) => nds.map((n) => ({ ...n, data: { ...n.data, theme } })));
    },
    [setNodes]
  );

  const updateText = useCallback(
    (id: string, text: string) => {
      setNodes((nds) =>
        nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, text } } : n))
      );
    },
    [setNodes]
  );

  const updateChartConfig = useCallback(
    (id: string, chartConfig: import("./graphs/types").ChartOverride) => {
      setNodes((nds) =>
        nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, chartConfig } } : n))
      );
    },
    [setNodes]
  );

  const startReplace = useCallback((id: string) => {
    setReplacingNodeId(id);
  }, []);

  const bringToFront = useCallback(
    (id: string) => {
      setNodes((nds) => {
        const node = nds.find((n) => n.id === id);
        if (!node) return nds;
        const otherNodes = nds.filter((n) => n.id !== id);
        const maxZ = otherNodes.reduce(
          (max, n) =>
            Math.max(
              max,
              typeof n.zIndex === "number" && n.zIndex < 100000 ? n.zIndex : 0
            ),
          0
        );
        const topZ = maxZ + 1;
        nextNodeZ = Math.max(nextNodeZ, topZ);
        // Move to the end of the array so React Flow renders it LAST in the DOM,
        // and assign it the highest zIndex.
        return [...otherNodes, { ...node, zIndex: topZ }];
      });
    },
    [setNodes]
  );

  const placeIcon = useCallback(
    (icon: IconDef) => {
      // If replace mode is active, swap the icon on that node instead of adding
      if (replacingNodeId) {
        const rid = replacingNodeId;
        setNodes((nds) =>
          nds.map((n) =>
            n.id === rid
              ? {
                  ...n,
                  data: {
                    ...n.data,
                    name: icon.name,
                    svg: icon.svg,
                    componentKey: icon.componentKey,
                  },
                }
              : n
          )
        );
        setReplacingNodeId(null);
        return;
      }

      const container = containerRef.current;
      const rect = container?.getBoundingClientRect() ?? {
        left: 0,
        top: 0,
        width: 800,
        height: 600,
      };
      const jitter = () => (Math.random() - 0.5) * 80;
      const position = screenToFlowPosition({
        x: rect.left + rect.width / 2 + jitter(),
        y: rect.top + rect.height / 2 + jitter(),
      });

      const dashboardWidget = getDashboardWidget(icon.componentKey);
      if (dashboardWidget) {
        const newNode: Node<IconNodeData> = {
          id: `dashwidget-${crypto.randomUUID()}`,
          type: "dashboardWidgetNode",
          position,
          width: dashboardWidget.defaultSize.width,
          height: dashboardWidget.defaultSize.height,
          zIndex: claimTopZ(),
          data: {
            name: dashboardWidget.label,
            widgetKey: dashboardWidget.key,
            storageKey: `${dashboardWidget.key}.${crypto.randomUUID().slice(0, 8)}`,
          },
        };
        setNodes((nds) => nds.concat(newNode));
        return;
      }

      const size = getGraph(icon.componentKey)?.defaultSize ??
        getShape(icon.componentKey)?.defaultSize ?? {
          width: NODE_SIZE,
          height: NODE_SIZE,
        };
      const newNode: Node<IconNodeData> = {
        id: `node-${crypto.randomUUID()}`,
        type: "iconNode",
        position,
        width: size.width,
        height: size.height,
        zIndex: claimTopZ(),
        data: {
          name: icon.name,
          svg: icon.svg,
          componentKey: icon.componentKey,
        },
      };
      setNodes((nds) => nds.concat(newNode));
    },
    [replacingNodeId, screenToFlowPosition, setNodes]
  );

  const placeDashboard = useCallback(
    (templateId: "soe" | "outage" = "soe") => {
      const pane = document.querySelector<HTMLElement>(".react-flow__pane");
      const rect = pane?.getBoundingClientRect();
      const cx = rect ? rect.x + rect.width / 2 : window.innerWidth / 2;
      const cy = rect ? rect.y + rect.height / 2 : window.innerHeight / 2;
      const position = screenToFlowPosition({ x: cx - 640, y: cy - 410 });
      setNodes((nds) => nds.concat(makeDashboardNode(position, templateId)));
    },
    [screenToFlowPosition, setNodes]
  );

  const placeDashboardWidget = useCallback(
    (widgetKey: string) => {
      const pane = document.querySelector<HTMLElement>(".react-flow__pane");
      const rect = pane?.getBoundingClientRect();
      const widget = getDashboardWidget(widgetKey);
      const w = widget?.defaultSize.width ?? 500;
      const h = widget?.defaultSize.height ?? 300;
      const cx = rect ? rect.x + rect.width / 2 : window.innerWidth / 2;
      const cy = rect ? rect.y + rect.height / 2 : window.innerHeight / 2;
      const position = screenToFlowPosition({ x: cx - w / 2, y: cy - h / 2 });
      setNodes((nds) => nds.concat(makeDashboardWidgetNode(position, widgetKey)));
    },
    [screenToFlowPosition, setNodes]
  );

  useEffect(() => {
    onRegisterPlaceDashboard?.(placeDashboard);
  }, [onRegisterPlaceDashboard, placeDashboard]);

  useEffect(() => {
    onRegisterAdd(placeIcon);
  }, [onRegisterAdd, placeIcon]);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            type: DELETABLE_EDGE_TYPE,
            data: { variant: edgeStyle },
            markerEnd: { type: MarkerType.ArrowClosed },
          },
          eds
        )
      );
    },
    [edgeStyle, setEdges]
  );

  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = "copy";
  }, []);

  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();

      const flowPos = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // 1. Full Dashboard template drop
      const dashboardTemplate = event.dataTransfer.getData("application/x-widget-dashboard");
      if (dashboardTemplate) {
        const templateId = (dashboardTemplate === "outage" ? "outage" : "soe") as "soe" | "outage";
        const dropAt = {
          x: flowPos.x - 640,
          y: flowPos.y - 40,
        };
        setNodes((nds) => nds.concat(makeDashboardNode(dropAt, templateId)));
        return;
      }

      // 2. Standalone Dashboard Component drop
      const widgetKey = event.dataTransfer.getData("application/x-widget-dashboard-component");
      if (widgetKey) {
        const widget = getDashboardWidget(widgetKey);
        const w = widget?.defaultSize.width ?? 500;
        const h = widget?.defaultSize.height ?? 300;
        const dropAt = {
          x: flowPos.x - w / 2,
          y: flowPos.y - h / 2,
        };
        setNodes((nds) => nds.concat(makeDashboardWidgetNode(dropAt, widgetKey)));
        return;
      }

      // 3. Standard IconDef drop (could be equipment, graph, shape, or dashboard widget)
      const raw = event.dataTransfer.getData("application/x-widget-icon");
      if (raw) {
        try {
          const icon = JSON.parse(raw) as IconDef;
          const dashboardWidget = getDashboardWidget(icon.componentKey);
          if (dashboardWidget) {
            const w = dashboardWidget.defaultSize.width;
            const h = dashboardWidget.defaultSize.height;
            const dropAt = {
              x: flowPos.x - w / 2,
              y: flowPos.y - h / 2,
            };
            setNodes((nds) => nds.concat(makeDashboardWidgetNode(dropAt, icon.componentKey!)));
            return;
          }

          const size = getGraph(icon.componentKey)?.defaultSize ??
            getShape(icon.componentKey)?.defaultSize ?? {
              width: NODE_SIZE,
              height: NODE_SIZE,
            };
          const newNode: Node<IconNodeData> = {
            id: `node-${crypto.randomUUID()}`,
            type: "iconNode",
            position: {
              x: flowPos.x - size.width / 2,
              y: flowPos.y - size.height / 2,
            },
            width: size.width,
            height: size.height,
            zIndex: claimTopZ(),
            data: {
              name: icon.name,
              svg: icon.svg,
              componentKey: icon.componentKey,
            },
          };
          setNodes((nds) => nds.concat(newNode));
          return;
        } catch {
          // continue to fallback
        }
      }

      // 4. Fallback: application/json or text/plain JSON payload
      const textData = event.dataTransfer.getData("application/json") || event.dataTransfer.getData("text/plain");
      if (textData) {
        try {
          const parsed = JSON.parse(textData);
          if (parsed.type === "dashboard" || parsed.templateId) {
            const templateId = (parsed.templateId === "outage" ? "outage" : "soe") as "soe" | "outage";
            const dropAt = {
              x: flowPos.x - 640,
              y: flowPos.y - 40,
            };
            setNodes((nds) => nds.concat(makeDashboardNode(dropAt, templateId)));
            return;
          }

          const key = parsed.widgetKey || parsed.componentKey;
          if (key && getDashboardWidget(key)) {
            const widget = getDashboardWidget(key);
            const w = widget?.defaultSize.width ?? 500;
            const h = widget?.defaultSize.height ?? 300;
            const dropAt = {
              x: flowPos.x - w / 2,
              y: flowPos.y - h / 2,
            };
            setNodes((nds) => nds.concat(makeDashboardWidgetNode(dropAt, key)));
            return;
          }

          if (parsed.name || parsed.svg || parsed.componentKey) {
            const size = getGraph(parsed.componentKey)?.defaultSize ??
              getShape(parsed.componentKey)?.defaultSize ?? {
                width: NODE_SIZE,
                height: NODE_SIZE,
              };
            const newNode: Node<IconNodeData> = {
              id: `node-${crypto.randomUUID()}`,
              type: "iconNode",
              position: {
                x: flowPos.x - size.width / 2,
                y: flowPos.y - size.height / 2,
              },
              width: size.width,
              height: size.height,
              zIndex: claimTopZ(),
              data: {
                name: parsed.name ?? "Node",
                svg: parsed.svg,
                componentKey: parsed.componentKey,
              },
            };
            setNodes((nds) => nds.concat(newNode));
            return;
          }
        } catch {
          // ignore
        }
      }
    },
    [screenToFlowPosition, setNodes]
  );

  function handleClearBoard() {
    if (!window.confirm("Clear all nodes and connections from the board?")) {
      return;
    }
    setNodes([]);
    setEdges([]);
  }

  const { lineType } = styleFor(edgeStyle);

  return (
    <NodeActionsContext.Provider
      value={{
        deleteNode,
        startReplace,
        rotateNode,
        updateText,
        updateChartConfig,
        themeNode,
        themeAllNodes,
        bringToFront,
        replacingNodeId,
      }}
    >
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-zinc-200 bg-white px-4 py-2">
          <h1 className="text-sm font-semibold text-zinc-800">
            Whiteboard
          </h1>
          {replacingNodeId && (
            <div className="flex items-center gap-1.5 rounded bg-amber-50 px-2 py-1 text-xs text-amber-700 ring-1 ring-amber-200">
              <svg viewBox="0 0 14 14" className="h-3 w-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 4h9M7 1l3 3-3 3" />
                <path d="M13 10H4M7 7l-3 3 3 3" />
              </svg>
              Replace mode — click an icon in the sidebar, or press Esc to cancel
            </div>
          )}
          <div className="ml-auto flex items-center gap-2">
            <label
              htmlFor="edge-style"
              className="text-xs text-zinc-500"
            >
              Connection style
            </label>
            <select
              id="edge-style"
              value={edgeStyle}
              onChange={(e) => setEdgeStyle(e.target.value as EdgeStyle)}
              className="rounded border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-900"
            >
              {EDGE_STYLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleClearBoard}
              className="rounded border border-zinc-300 px-2 py-1 text-xs text-zinc-600 hover:border-red-400 hover:text-red-600"
            >
              Clear board
            </button>
          </div>
        </header>

        {/* Click canvas background to cancel replace mode */}
        <div
          ref={containerRef}
          className="min-h-0 flex-1"
          onDragOver={onDragOver}
          onDrop={onDrop}
          onClick={(e) => {
            if (
              replacingNodeId &&
              (e.target as HTMLElement).classList.contains("react-flow__pane")
            ) {
              setReplacingNodeId(null);
            }
          }}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDragOver={onDragOver}
            onDrop={onDrop}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            deleteKeyCode={["Delete", "Backspace"]}
            connectionMode={ConnectionMode.Loose}
            // Selection must not reorder z — the newest placed node stays
            // on top even if you click an older one behind it.
            elevateNodesOnSelect={false}
            connectionLineType={lineType}
            colorMode="light"
            fitView
          >
            <Background />
            <Controls />
            <MiniMap pannable zoomable />
          </ReactFlow>
        </div>
      </div>
    </NodeActionsContext.Provider>
  );
}

interface CanvasProps {
  onRegisterAdd: (fn: (icon: IconDef) => void) => void;
  /** Register a callback the parent can invoke to place a dashboard at the canvas centre. */
  onRegisterPlaceDashboard?: (fn: () => void) => void;
}

export function Canvas({ onRegisterAdd, onRegisterPlaceDashboard }: CanvasProps) {
  return (
    <ReactFlowProvider>
      <CanvasInner onRegisterAdd={onRegisterAdd} onRegisterPlaceDashboard={onRegisterPlaceDashboard} />
    </ReactFlowProvider>
  );
}
