// Config shape for the NavBar widget.
//
// Every visible string / flag lives here so a parent template can pass a
// specific configuration in and the widget can also edit itself in place —
// the same object round-trips through localStorage between edits.

import type { NavIcon } from "../../icons";

export interface NavItemConfig {
  /** Stable id — used as the map key and for delete/reorder handles. */
  id: string;
  label: string;
  icon: NavIcon;
  /**
   * A custom image used instead of `icon` — an uploaded data URL or a remote
   * image URL. When unset, the built-in `icon` kind renders as before.
   */
  iconImage?: string;
  /** Text shown in the red badge; empty string / undefined hides the badge. */
  badge?: string;
}

export interface NavBarConfig {
  brand: string;
  brandSuperscript?: string;
  brandSubtitle: string;
  navItems: NavItemConfig[];
  dateTime: string;
  operatorLabel: string;
  operatorValue: string;
  logoutLabel: string;
  showLogout: boolean;
  partnerBrand: string;
  partnerTagline: string;
}

export const DEFAULT_NAVBAR: NavBarConfig = {
  brand: "AUTRIXA",
  brandSuperscript: "TM",
  brandSubtitle: "Distribution SCADA",
  navItems: [
    { id: "home", label: "Home", icon: "home" },
    { id: "network", label: "Network", icon: "network" },
    { id: "pss", label: "PSS", icon: "pss" },
    { id: "alarms", label: "Alarms", icon: "alarms", badge: "12" },
    { id: "events", label: "Events", icon: "events" },
    { id: "reports", label: "Reports", icon: "reports" },
    { id: "trends", label: "Trends", icon: "trends" },
    { id: "settings", label: "Settings", icon: "settings" },
  ],
  dateTime: "09 Sep 2026 14:28:36",
  operatorLabel: "Operator",
  operatorValue: "admin",
  logoutLabel: "Logout",
  showLogout: true,
  partnerBrand: "RS Consultancy",
  partnerTagline: "Reliable | Scalable | Connected",
};

/** Every icon the picker offers, keyed to the icons shipped in icons.tsx. */
export const AVAILABLE_ICONS: NavIcon[] = [
  "home",
  "network",
  "pss",
  "alarms",
  "events",
  "reports",
  "trends",
  "settings",
];
