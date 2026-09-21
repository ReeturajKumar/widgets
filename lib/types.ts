export type IconSource = "builtin" | "uploaded";

export interface IconDef {
  id: string;
  name: string;
  /** Raw markup — uploaded icons, and builtins not yet converted. */
  svg?: string;
  /** Key into the widget component registry, for converted widgets. */
  componentKey?: string;
  source: IconSource;
}

export type EdgeStyle = "straight" | "bezier" | "step";
