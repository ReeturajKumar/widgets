"use client";

import type { ComponentType, ImgHTMLAttributes } from "react";
import {
  CONVERTED_WIDGETS,
  type ConvertedWidget,
} from "../../lib/convertedWidgets";
import { BlowerHousing } from "./BlowerHousing";
import { CentrifugalPump } from "./CentrifugalPump";
import { CentrifugalPumpSkid } from "./CentrifugalPumpSkid";
import { LinearActuator } from "./LinearActuator";
import { MotorDrivenPump } from "./MotorDrivenPump";
import { PressureValve } from "./PressureValve";
import { ProgressiveCavityPump } from "./ProgressiveCavityPump";
import { Pumpjack } from "./Pumpjack";
import { ScrewPumpUnit } from "./ScrewPumpUnit";
import { SolenoidValve } from "./SolenoidValve";
import { SplitCasePump } from "./SplitCasePump";
import { SubmersiblePump } from "./SubmersiblePump";
import { VerticalInlinePump } from "./VerticalInlinePump";

export type WidgetIconProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src">;

export interface WidgetIcon extends ConvertedWidget {
  Component: ComponentType<WidgetIconProps>;
}

// Keyed by ConvertedWidget.key. A widget listed there but missing here is
// skipped rather than crashing the sidebar.
const ART: Record<string, ComponentType<WidgetIconProps>> = {
  "centrifugal-pump": CentrifugalPump,
  "screw-pump-unit": ScrewPumpUnit,
  "pressure-valve": PressureValve,
  "submersible-pump": SubmersiblePump,
  "split-case-pump": SplitCasePump,
  "solenoid-valve": SolenoidValve,
  "pumpjack": Pumpjack,
  "motor-driven-pump": MotorDrivenPump,
  "linear-actuator": LinearActuator,
  "vertical-inline-pump": VerticalInlinePump,
  "centrifugal-pump-skid": CentrifugalPumpSkid,
  "progressive-cavity-pump": ProgressiveCavityPump,
  "blower-housing": BlowerHousing,
};

export const WIDGET_ICONS: Record<string, WidgetIcon> = Object.fromEntries(
  CONVERTED_WIDGETS.flatMap((widget) => {
    const Component = ART[widget.key];
    return Component ? [[widget.key, { ...widget, Component }]] : [];
  })
);

export function getWidgetIcon(key: string | undefined): WidgetIcon | undefined {
  return key ? WIDGET_ICONS[key] : undefined;
}
