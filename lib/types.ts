export type IconSource = "builtin" | "uploaded";

export interface IconDef {
  id: string;
  name: string;
  svg: string;
  source: IconSource;
}

export type EdgeStyle = "straight" | "bezier" | "step";
