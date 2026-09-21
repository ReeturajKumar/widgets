"use client";

import type { ComponentType, ImgHTMLAttributes } from "react";
import {
  CONVERTED_WIDGETS,
  type ConvertedWidget,
} from "../../lib/convertedWidgets";
import { ActuatedValve } from "./ActuatedValve";
import { BareShaftPump } from "./BareShaftPump";
import { BlowerHousing } from "./BlowerHousing";
import { BlowerScrollCasing } from "./BlowerScrollCasing";
import { CannedMotorPump } from "./CannedMotorPump";
import { CannedMotorUnit } from "./CannedMotorUnit";
import { CentrifugalFan } from "./CentrifugalFan";
import { CentrifugalPump } from "./CentrifugalPump";
import { CentrifugalPumpSkid } from "./CentrifugalPumpSkid";
import { ChemicalProcessPump } from "./ChemicalProcessPump";
import { CloseCoupledPump } from "./CloseCoupledPump";
import { ConicalBottomTank } from "./ConicalBottomTank";
import { ConicalInlinePump } from "./ConicalInlinePump";
import { DiaphragmPump } from "./DiaphragmPump";
import { EndSuctionPump } from "./EndSuctionPump";
import { ExternalGearPump } from "./ExternalGearPump";
import { FanScrollHousing } from "./FanScrollHousing";
import { FinnedMotorHousing } from "./FinnedMotorHousing";
import { FlangedControlValve } from "./FlangedControlValve";
import { FlywheelDrivenPump } from "./FlywheelDrivenPump";
import { GearboxDriveUnit } from "./GearboxDriveUnit";
import { HermeticCannedPump } from "./HermeticCannedPump";
import { HorizontalMultistagePump } from "./HorizontalMultistagePump";
import { HorizontalProcessPump } from "./HorizontalProcessPump";
import { ImpellerAssembly } from "./ImpellerAssembly";
import { InclinedScrewConveyor } from "./InclinedScrewConveyor";
import { IndustrialBlower } from "./IndustrialBlower";
import { LevelSensorProbe } from "./LevelSensorProbe";
import { LinearActuator } from "./LinearActuator";
import { LobePump } from "./LobePump";
import { LongCoupledPump } from "./LongCoupledPump";
import { LubeOilReservoir } from "./LubeOilReservoir";
import { MagneticDrivePump } from "./MagneticDrivePump";
import { MeteringPump } from "./MeteringPump";
import { MotorDrivenPump } from "./MotorDrivenPump";
import { MultistagePump } from "./MultistagePump";
import { OvoidVessel } from "./OvoidVessel";
import { PlateHeatExchanger } from "./PlateHeatExchanger";
import { PressureValve } from "./PressureValve";
import { PrimingPumpUnit } from "./PrimingPumpUnit";
import { ProcessPumpCasing } from "./ProcessPumpCasing";
import { ProcessPumpSkid } from "./ProcessPumpSkid";
import { ProgressiveCavityPump } from "./ProgressiveCavityPump";
import { PumpCasingCover } from "./PumpCasingCover";
import { PumpVoluteBody } from "./PumpVoluteBody";
import { Pumpjack } from "./Pumpjack";
import { RotaryGearPump } from "./RotaryGearPump";
import { RotaryLobeBlower } from "./RotaryLobeBlower";
import { ScrewPumpUnit } from "./ScrewPumpUnit";
import { SeallessCannedPump } from "./SeallessCannedPump";
import { SewagePump } from "./SewagePump";
import { ShellTubeHeatExchanger } from "./ShellTubeHeatExchanger";
import { SolenoidValve } from "./SolenoidValve";
import { SpacerCoupledPump } from "./SpacerCoupledPump";
import { SphericalChamber } from "./SphericalChamber";
import { SphericalPumpCasing } from "./SphericalPumpCasing";
import { SpiralVoluteCasing } from "./SpiralVoluteCasing";
import { SplitCasePump } from "./SplitCasePump";
import { StainlessProcessPump } from "./StainlessProcessPump";
import { StainlessSubmersiblePump } from "./StainlessSubmersiblePump";
import { StainlessVoluteCasing } from "./StainlessVoluteCasing";
import { StrainerCartridge } from "./StrainerCartridge";
import { SubmersibleDrainagePump } from "./SubmersibleDrainagePump";
import { SubmersibleMotorHousing } from "./SubmersibleMotorHousing";
import { SubmersiblePump } from "./SubmersiblePump";
import { TallFramePump } from "./TallFramePump";
import { TripodMountedPump } from "./TripodMountedPump";
import { TubularHeatExchanger } from "./TubularHeatExchanger";
import { TwinScrewPump } from "./TwinScrewPump";
import { VerticalCantileverPump } from "./VerticalCantileverPump";
import { VerticalFilterVessel } from "./VerticalFilterVessel";
import { VerticalGearPump } from "./VerticalGearPump";
import { VerticalGearbox } from "./VerticalGearbox";
import { VerticalInlinePump } from "./VerticalInlinePump";
import { VerticalMultistagePump } from "./VerticalMultistagePump";
import { VerticalReliefValve } from "./VerticalReliefValve";
import { VerticalSumpPump } from "./VerticalSumpPump";
import { VerticalTurbinePump } from "./VerticalTurbinePump";
import { VoluteCasingProfile } from "./VoluteCasingProfile";
import { VoluteCasingSection } from "./VoluteCasingSection";
import { VolutePumpCasing } from "./VolutePumpCasing";
import { WaterTreatmentSkid } from "./WaterTreatmentSkid";

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
  "diaphragm-pump": DiaphragmPump,
  "inclined-screw-conveyor": InclinedScrewConveyor,
  "canned-motor-pump": CannedMotorPump,
  "plate-heat-exchanger": PlateHeatExchanger,
  "actuated-valve": ActuatedValve,
  "vertical-sump-pump": VerticalSumpPump,
  "centrifugal-fan": CentrifugalFan,
  "lobe-pump": LobePump,
  "magnetic-drive-pump": MagneticDrivePump,
  "rotary-lobe-blower": RotaryLobeBlower,
  "lube-oil-reservoir": LubeOilReservoir,
  "vertical-gear-pump": VerticalGearPump,
  "submersible-drainage-pump": SubmersibleDrainagePump,
  "water-treatment-skid": WaterTreatmentSkid,
  "chemical-process-pump": ChemicalProcessPump,
  "end-suction-pump": EndSuctionPump,
  "multistage-pump": MultistagePump,
  "vertical-cantilever-pump": VerticalCantileverPump,
  "vertical-gearbox": VerticalGearbox,
  "volute-pump-casing": VolutePumpCasing,
  "industrial-blower": IndustrialBlower,
  "canned-motor-unit": CannedMotorUnit,
  "shell-tube-heat-exchanger": ShellTubeHeatExchanger,
  "bare-shaft-pump": BareShaftPump,
  "finned-motor-housing": FinnedMotorHousing,
  "vertical-turbine-pump": VerticalTurbinePump,
  "blower-scroll-casing": BlowerScrollCasing,
  "pump-casing-cover": PumpCasingCover,
  "close-coupled-pump": CloseCoupledPump,
  "priming-pump-unit": PrimingPumpUnit,
  "horizontal-process-pump": HorizontalProcessPump,
  "tripod-mounted-pump": TripodMountedPump,
  "stainless-submersible-pump": StainlessSubmersiblePump,
  "fan-scroll-housing": FanScrollHousing,
  "horizontal-multistage-pump": HorizontalMultistagePump,
  "external-gear-pump": ExternalGearPump,
  "impeller-assembly": ImpellerAssembly,
  "vertical-filter-vessel": VerticalFilterVessel,
  "conical-bottom-tank": ConicalBottomTank,
  "spherical-chamber": SphericalChamber,
  "spherical-pump-casing": SphericalPumpCasing,
  "process-pump-skid": ProcessPumpSkid,
  "rotary-gear-pump": RotaryGearPump,
  "flywheel-driven-pump": FlywheelDrivenPump,
  "vertical-relief-valve": VerticalReliefValve,
  "flanged-control-valve": FlangedControlValve,
  "spiral-volute-casing": SpiralVoluteCasing,
  "ovoid-vessel": OvoidVessel,
  "tubular-heat-exchanger": TubularHeatExchanger,
  "twin-screw-pump": TwinScrewPump,
  "submersible-motor-housing": SubmersibleMotorHousing,
  "level-sensor-probe": LevelSensorProbe,
  "stainless-volute-casing": StainlessVoluteCasing,
  "volute-casing-profile": VoluteCasingProfile,
  "gearbox-drive-unit": GearboxDriveUnit,
  "spacer-coupled-pump": SpacerCoupledPump,
  "vertical-multistage-pump": VerticalMultistagePump,
  "conical-inline-pump": ConicalInlinePump,
  "pump-volute-body": PumpVoluteBody,
  "volute-casing-section": VoluteCasingSection,
  "long-coupled-pump": LongCoupledPump,
  "stainless-process-pump": StainlessProcessPump,
  "strainer-cartridge": StrainerCartridge,
  "sewage-pump": SewagePump,
  "process-pump-casing": ProcessPumpCasing,
  "sealless-canned-pump": SeallessCannedPump,
  "hermetic-canned-pump": HermeticCannedPump,
  "tall-frame-pump": TallFramePump,
  "metering-pump": MeteringPump,
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
