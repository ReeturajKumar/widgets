"use client";

import type { ComponentType } from "react";
import type { ShapeProps } from "./types";
import { Circle } from "./Circle";
import { Cloud } from "./Cloud";
import { Cylinder } from "./Cylinder";
import { Diamond } from "./Diamond";
import { Document } from "./Document";
import { Ellipse } from "./Ellipse";
import { Frame } from "./Frame";
import { Hexagon } from "./Hexagon";
import { Note } from "./Note";
import { Parallelogram } from "./Parallelogram";
import { Pentagon } from "./Pentagon";
import { Person } from "./Person";
import { Rectangle } from "./Rectangle";
import { RoundedRectangle } from "./RoundedRectangle";
import { SpeechBubble } from "./SpeechBubble";
import { Star } from "./Star";
import { TextLabel } from "./TextLabel";
import { Trapezoid } from "./Trapezoid";
import { Triangle } from "./Triangle";

// Shape primitives shown in the General sidebar tab and available on the board.
//
// Order here is the order the tiles appear in the sidebar. The board stores a
// shape as its key on the node's `data.componentKey`, so keys are stable ids —
// don't rename one after a widget has been placed with it.

export interface ShapeDef {
  key: string;
  label: string;
  Component: ComponentType<ShapeProps>;
  /** Default node size on placement, chosen to match the shape's proportions. */
  defaultSize: { width: number; height: number };
}

const wide = { width: 140, height: 90 } as const;
const square = { width: 110, height: 110 } as const;
const tall = { width: 80, height: 120 } as const;

export const SHAPES: readonly ShapeDef[] = [
  { key: "shape-rectangle", label: "Rectangle", Component: Rectangle, defaultSize: wide },
  { key: "shape-rounded-rectangle", label: "Rounded", Component: RoundedRectangle, defaultSize: wide },
  { key: "shape-ellipse", label: "Ellipse", Component: Ellipse, defaultSize: wide },
  { key: "shape-circle", label: "Circle", Component: Circle, defaultSize: square },
  { key: "shape-diamond", label: "Diamond", Component: Diamond, defaultSize: square },
  { key: "shape-triangle", label: "Triangle", Component: Triangle, defaultSize: square },
  { key: "shape-hexagon", label: "Hexagon", Component: Hexagon, defaultSize: wide },
  { key: "shape-pentagon", label: "Pentagon", Component: Pentagon, defaultSize: wide },
  { key: "shape-parallelogram", label: "Parallelogram", Component: Parallelogram, defaultSize: wide },
  { key: "shape-trapezoid", label: "Trapezoid", Component: Trapezoid, defaultSize: wide },
  { key: "shape-star", label: "Star", Component: Star, defaultSize: square },
  { key: "shape-cylinder", label: "Cylinder", Component: Cylinder, defaultSize: square },
  { key: "shape-cloud", label: "Cloud", Component: Cloud, defaultSize: wide },
  { key: "shape-document", label: "Document", Component: Document, defaultSize: wide },
  { key: "shape-note", label: "Note", Component: Note, defaultSize: square },
  { key: "shape-frame", label: "Frame", Component: Frame, defaultSize: wide },
  { key: "shape-speech-bubble", label: "Speech bubble", Component: SpeechBubble, defaultSize: wide },
  { key: "shape-person", label: "Person", Component: Person, defaultSize: tall },
  { key: "shape-text", label: "Text", Component: TextLabel, defaultSize: { width: 160, height: 48 } },
];

const BY_KEY = new Map(SHAPES.map((shape) => [shape.key, shape]));

export function getShape(key: string | undefined): ShapeDef | undefined {
  return key ? BY_KEY.get(key) : undefined;
}
