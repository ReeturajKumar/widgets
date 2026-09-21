export interface IconDef {
  id: string;
  name: string;
  /** Raw markup, for library files not built into a component. */
  svg?: string;
  /** Key into the widget component registry, for built widgets. */
  componentKey?: string;
}

export type EdgeStyle = "straight" | "bezier" | "step";
