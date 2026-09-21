// Widgets built from their original artwork into React components under
// components/icons. Every icon in the library is now a component.
//
// Shared by both sides of the app: the server-side library loader reads it to
// skip the raw file each one replaces, and the client registry reads it to
// label the component. Keep it free of React imports so the server can use it.
//
// `file` records the source each widget was built from. Those sources are
// deleted once converted, so it is provenance rather than a live path: restore
// one with `git checkout` before re-running tools/build-widgets.
//
// Order here is the order the widgets appear in the sidebar.

export interface ConvertedWidget {
  /** Stable id stored on the board; never reuse one for different art. */
  key: string;
  /** The file in public/icons this component was built from. */
  file: string;
  label: string;
}

export const CONVERTED_WIDGETS: readonly ConvertedWidget[] = [
  { key: "centrifugal-pump", file: "1.svg.svg.svg.svg.svg", label: "Centrifugal Pump" },
  { key: "screw-pump-unit", file: "2.svg.svg.svg.svg.svg", label: "Screw Pump Unit" },
  { key: "pressure-valve", file: "3.svg.svg.svg.svg.svg", label: "Pressure Valve" },
  { key: "submersible-pump", file: "4.svg.svg.svg.svg.svg", label: "Submersible Pump" },
  { key: "split-case-pump", file: "5.svg.svg.svg.svg.svg", label: "Split Case Pump" },
  { key: "pumpjack", file: "7.svg.svg.svg.svg.svg", label: "Pumpjack" },
  { key: "motor-driven-pump", file: "8.svg.svg.svg.svg.svg", label: "Motor Driven Pump" },
  { key: "linear-actuator", file: "9.svg.svg.svg.svg.svg", label: "Linear Actuator" },
  { key: "vertical-inline-pump", file: "10.svg.svg.svg.svg.svg", label: "Vertical Inline Pump" },
  { key: "centrifugal-pump-skid", file: "11.svg.svg.svg.svg.svg", label: "Centrifugal Pump Skid" },
  { key: "progressive-cavity-pump", file: "12.svg.svg.svg.svg.svg", label: "Progressive Cavity Pump" },
  { key: "blower-housing", file: "13.svg.svg.svg.svg.svg", label: "Blower Housing" },
  { key: "diaphragm-pump", file: "14.svg.svg.svg.svg.svg", label: "Diaphragm Pump" },
  { key: "inclined-screw-conveyor", file: "15.svg.svg.svg.svg.svg", label: "Inclined Screw Conveyor" },
  { key: "canned-motor-pump", file: "16.svg.svg.svg.svg.svg", label: "Canned Motor Pump" },
  { key: "plate-heat-exchanger", file: "17.svg.svg.svg.svg.svg", label: "Plate Heat Exchanger" },
  { key: "actuated-valve", file: "18.svg.svg.svg.svg.svg", label: "Actuated Valve" },
  { key: "vertical-sump-pump", file: "19.svg.svg.svg.svg.svg", label: "Vertical Sump Pump" },
  { key: "centrifugal-fan", file: "20.svg.svg.svg.svg.svg", label: "Centrifugal Fan" },
  { key: "lobe-pump", file: "21.svg.svg.svg.svg.svg", label: "Lobe Pump" },
  { key: "magnetic-drive-pump", file: "22.svg.svg.svg.svg.svg", label: "Magnetic Drive Pump" },
  { key: "rotary-lobe-blower", file: "23.svg.svg.svg.svg.svg", label: "Rotary Lobe Blower" },
  { key: "lube-oil-reservoir", file: "24.svg.svg.svg.svg.svg", label: "Lube Oil Reservoir" },
  { key: "vertical-gear-pump", file: "25.svg.svg.svg.svg.svg", label: "Vertical Gear Pump" },
  { key: "submersible-drainage-pump", file: "26.svg.svg.svg.svg.svg", label: "Submersible Drainage Pump" },
  { key: "water-treatment-skid", file: "27.svg.svg.svg.svg.svg", label: "Water Treatment Skid" },
  { key: "chemical-process-pump", file: "28.svg.svg.svg.svg.svg", label: "Chemical Process Pump" },
  { key: "end-suction-pump", file: "29.svg.svg.svg.svg.svg", label: "End Suction Pump" },
  { key: "multistage-pump", file: "30.svg.svg.svg.svg.svg", label: "Multistage Pump" },
  { key: "vertical-cantilever-pump", file: "31.svg.svg.svg.svg.svg", label: "Vertical Cantilever Pump" },
  { key: "vertical-gearbox", file: "32.svg.svg.svg.svg.svg", label: "Vertical Gearbox" },
  { key: "volute-pump-casing", file: "33.svg.svg.svg.svg.svg", label: "Volute Pump Casing" },
  { key: "industrial-blower", file: "34.svg.svg.svg.svg.svg", label: "Industrial Blower" },
  { key: "canned-motor-unit", file: "35.svg.svg.svg.svg", label: "Canned Motor Unit" },
  { key: "shell-tube-heat-exchanger", file: "36.svg.svg.svg.svg", label: "Shell and Tube Heat Exchanger" },
  { key: "bare-shaft-pump", file: "37.svg.svg.svg.svg", label: "Bare Shaft Pump" },
  { key: "finned-motor-housing", file: "38.svg.svg.svg.svg", label: "Finned Motor Housing" },
  { key: "vertical-turbine-pump", file: "39.svg.svg.svg.svg", label: "Vertical Turbine Pump" },
  { key: "blower-scroll-casing", file: "40.svg.svg.svg.svg", label: "Blower Scroll Casing" },
  { key: "pump-casing-cover", file: "41.svg.svg.svg.svg", label: "Pump Casing Cover" },
  { key: "close-coupled-pump", file: "42.svg.svg.svg.svg", label: "Close Coupled Pump" },
  { key: "priming-pump-unit", file: "43.svg.svg.svg.svg", label: "Priming Pump Unit" },
  { key: "horizontal-process-pump", file: "44.svg.svg.svg.svg", label: "Horizontal Process Pump" },
  { key: "tripod-mounted-pump", file: "45.svg.svg.svg.svg", label: "Tripod Mounted Pump" },
  { key: "stainless-submersible-pump", file: "46.svg.svg.svg", label: "Stainless Submersible Pump" },
  { key: "fan-scroll-housing", file: "47.svg.svg.svg", label: "Fan Scroll Housing" },
  { key: "horizontal-multistage-pump", file: "48.svg.svg.svg", label: "Horizontal Multistage Pump" },
  { key: "external-gear-pump", file: "49.svg.svg.svg", label: "External Gear Pump" },
  { key: "impeller-assembly", file: "50.svg.svg.svg", label: "Impeller Assembly" },
  { key: "vertical-filter-vessel", file: "51.svg.svg.svg", label: "Vertical Filter Vessel" },
  { key: "conical-bottom-tank", file: "52.svg.svg.svg", label: "Conical Bottom Tank" },
  { key: "spherical-chamber", file: "53.svg.svg.svg", label: "Spherical Chamber" },
  { key: "spherical-pump-casing", file: "54.svg.svg.svg", label: "Spherical Pump Casing" },
  { key: "process-pump-skid", file: "55.svg.svg.svg", label: "Process Pump Skid" },
  { key: "rotary-gear-pump", file: "56.svg.svg", label: "Rotary Gear Pump" },
  { key: "flywheel-driven-pump", file: "57.svg.svg", label: "Flywheel Driven Pump" },
  { key: "vertical-relief-valve", file: "58.svg.svg", label: "Vertical Relief Valve" },
  { key: "flanged-control-valve", file: "59.svg.svg", label: "Flanged Control Valve" },
  { key: "spiral-volute-casing", file: "60.svg.svg", label: "Spiral Volute Casing" },
  { key: "ovoid-vessel", file: "61.svg.svg", label: "Ovoid Vessel" },
  { key: "tubular-heat-exchanger", file: "62.svg.svg", label: "Tubular Heat Exchanger" },
  { key: "twin-screw-pump", file: "63.svg.svg", label: "Twin Screw Pump" },
  { key: "submersible-motor-housing", file: "64.svg.svg", label: "Submersible Motor Housing" },
  { key: "level-sensor-probe", file: "65.svg.svg", label: "Level Sensor Probe" },
  { key: "stainless-volute-casing", file: "66.svg", label: "Stainless Volute Casing" },
  { key: "volute-casing-profile", file: "67.svg", label: "Volute Casing Profile" },
  { key: "gearbox-drive-unit", file: "68.svg", label: "Gearbox Drive Unit" },
  { key: "spacer-coupled-pump", file: "69.svg", label: "Spacer Coupled Pump" },
  { key: "vertical-multistage-pump", file: "70.svg", label: "Vertical Multistage Pump" },
  { key: "conical-inline-pump", file: "71.svg", label: "Conical Inline Pump" },
  { key: "pump-volute-body", file: "72.svg", label: "Pump Volute Body" },
  { key: "volute-casing-section", file: "73.svg", label: "Volute Casing Section" },
  { key: "long-coupled-pump", file: "74.svg", label: "Long Coupled Pump" },
  { key: "stainless-process-pump", file: "75.svg", label: "Stainless Process Pump" },
  { key: "strainer-cartridge", file: "76.svg", label: "Strainer Cartridge" },
  { key: "sewage-pump", file: "77.svg", label: "Sewage Pump" },
  { key: "process-pump-casing", file: "78.svg", label: "Process Pump Casing" },
  { key: "sealless-canned-pump", file: "79.svg", label: "Sealless Canned Pump" },
  { key: "hermetic-canned-pump", file: "80.svg", label: "Hermetic Canned Pump" },
  { key: "tall-frame-pump", file: "81.svg", label: "Tall Frame Pump" },
  { key: "metering-pump", file: "82.svg", label: "Metering Pump" },
];

export const CONVERTED_FILES = new Set(CONVERTED_WIDGETS.map((w) => w.file));
