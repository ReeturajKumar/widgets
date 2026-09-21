// Widgets that have been built from their original artwork into React
// components under components/icons.
//
// Shared by both sides of the app: the server-side library loader reads it to
// skip the raw file each one replaces, and the client registry reads it to
// label the component. Keep it free of React imports so the server can use it.
//
// Order here is the order the widgets appear in the sidebar.

export interface ConvertedWidget {
  /** Stable id stored on the board; never reuse one for different art. */
  key: string;
  /** The file in public/icons this component replaces. */
  file: string;
  label: string;
}

export const CONVERTED_WIDGETS: readonly ConvertedWidget[] = [
  { key: "centrifugal-pump", file: "1.svg", label: "Centrifugal Pump" },
  { key: "screw-pump-unit", file: "2.svg", label: "Screw Pump Unit" },
  { key: "pressure-valve", file: "3.svg", label: "Pressure Valve" },
  { key: "submersible-pump", file: "4.svg", label: "Submersible Pump" },
  { key: "split-case-pump", file: "5.svg", label: "Split Case Pump" },
  { key: "solenoid-valve", file: "6.svg", label: "Solenoid Valve" },
  { key: "pumpjack", file: "7.svg", label: "Pumpjack" },
  { key: "motor-driven-pump", file: "8.svg", label: "Motor Driven Pump" },
  { key: "linear-actuator", file: "9.svg", label: "Linear Actuator" },
  { key: "vertical-inline-pump", file: "10.svg", label: "Vertical Inline Pump" },
  { key: "centrifugal-pump-skid", file: "11.svg", label: "Centrifugal Pump Skid" },
  { key: "progressive-cavity-pump", file: "12.svg", label: "Progressive Cavity Pump" },
  { key: "blower-housing", file: "13.svg", label: "Blower Housing" },
];

export const CONVERTED_FILES = new Set(CONVERTED_WIDGETS.map((w) => w.file));
