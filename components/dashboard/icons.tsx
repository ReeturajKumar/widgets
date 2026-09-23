import type { SVGProps } from "react";
import type { FirstOutIcon, KpiIconKind, NavIcon } from "./data";

export type { NavIcon };

type IconProps = SVGProps<SVGSVGElement>;

// Small helper — every nav/KPI/first-out icon is stroke-based so it inherits
// currentColor from the surrounding text. That keeps colouring in the JSX.
function base(props: IconProps) {
  return {
    fill: "none" as const,
    stroke: "currentColor" as const,
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    viewBox: "0 0 24 24",
    ...props,
  };
}

// ── Nav icons ────────────────────────────────────────────────────────

export function NavIconGlyph({ name, ...rest }: IconProps & { name: NavIcon }) {
  switch (name) {
    case "home":
      return (
        <svg {...base(rest)}>
          <path d="M3 11 12 3l9 8" />
          <path d="M5 10v10h14V10" />
          <path d="M10 20v-6h4v6" />
        </svg>
      );
    case "network":
      return (
        <svg {...base(rest)}>
          <circle cx="12" cy="4" r="2" />
          <circle cx="5" cy="18" r="2" />
          <circle cx="19" cy="18" r="2" />
          <path d="M12 6v6M8 14l-2 2M16 14l2 2M8 14h8" />
        </svg>
      );
    case "pss":
      return (
        <svg {...base(rest)}>
          <rect x="3" y="6" width="18" height="12" rx="1.5" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      );
    case "alarms":
      return (
        <svg {...base(rest)}>
          <path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2H4.5L6 16Z" />
          <path d="M10 20a2 2 0 0 0 4 0" />
        </svg>
      );
    case "events":
      return (
        <svg {...base(rest)}>
          <rect x="4" y="4" width="16" height="16" rx="1.5" />
          <line x1="4" y1="8" x2="20" y2="8" />
          <line x1="8" y1="12" x2="16" y2="12" />
          <line x1="8" y1="16" x2="14" y2="16" />
        </svg>
      );
    case "reports":
      return (
        <svg {...base(rest)}>
          <path d="M6 3h9l4 4v14H6z" />
          <path d="M15 3v4h4" />
          <line x1="9" y1="12" x2="16" y2="12" />
          <line x1="9" y1="16" x2="16" y2="16" />
        </svg>
      );
    case "trends":
      return (
        <svg {...base(rest)}>
          <polyline points="3 17 9 11 13 15 21 6" />
          <polyline points="15 6 21 6 21 12" />
        </svg>
      );
    case "settings":
      return (
        <svg {...base(rest)}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
        </svg>
      );
  }
}

export function LogoutIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4" />
      <path d="M10 17l5-5-5-5" />
      <line x1="15" y1="12" x2="4" y2="12" />
    </svg>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="5" width="18" height="16" rx="1.5" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="8" y1="3" x2="8" y2="7" />
      <line x1="16" y1="3" x2="16" y2="7" />
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="11" cy="11" r="6" />
      <line x1="20" y1="20" x2="15.5" y2="15.5" />
    </svg>
  );
}

export function FunnelIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 4h16l-6 8v6l-4 2v-8Z" />
    </svg>
  );
}

export function ResetIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 12a8 8 0 1 0 3-6.3" />
      <polyline points="4 4 4 8 8 8" />
    </svg>
  );
}

export function DownloadIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3v12" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="4" y1="20" x2="20" y2="20" />
    </svg>
  );
}

// ── KPI icons (each includes its own colour circle) ─────────────────

export function KpiGlyph({ kind }: { kind: KpiIconKind }) {
  switch (kind) {
    case "doc-blue":
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
          <svg {...base({ className: "h-6 w-6" })}>
            <path d="M6 3h9l4 4v14H6z" />
            <path d="M15 3v4h4" />
            <line x1="9" y1="12" x2="16" y2="12" />
            <line x1="9" y1="16" x2="14" y2="16" />
          </svg>
        </div>
      );
    case "alert-red":
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-600">
          <svg {...base({ className: "h-6 w-6", strokeWidth: 2 })}>
            <path d="M12 3 2 20h20L12 3Z" />
            <line x1="12" y1="10" x2="12" y2="14" />
            <circle cx="12" cy="17" r="0.5" fill="currentColor" />
          </svg>
        </div>
      );
    case "alert-amber":
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-500">
          <svg {...base({ className: "h-6 w-6", strokeWidth: 2 })}>
            <path d="M12 3 2 20h20L12 3Z" />
            <line x1="12" y1="10" x2="12" y2="14" />
            <circle cx="12" cy="17" r="0.5" fill="currentColor" />
          </svg>
        </div>
      );
    case "bolt-red":
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-600">
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
            <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
          </svg>
        </div>
      );
    case "gear-blue":
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
          <NavIconGlyph name="settings" className="h-6 w-6" />
        </div>
      );
    case "refresh-green":
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
          <svg {...base({ className: "h-6 w-6" })}>
            <path d="M4 4v6h6" />
            <path d="M20 20v-6h-6" />
            <path d="M5 14a8 8 0 0 0 14 4" />
            <path d="M19 10a8 8 0 0 0-14-4" />
          </svg>
        </div>
      );
  }
}

// ── First-Out step icons ────────────────────────────────────────────

export function FirstOutGlyph({ kind }: { kind: FirstOutIcon }) {
  switch (kind) {
    case "bolt-red":
      return (
        <svg viewBox="0 0 24 24" fill="#dc2626" className="h-6 w-6">
          <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
        </svg>
      );
    case "gear":
      return (
        <NavIconGlyph
          name="settings"
          className="h-6 w-6 text-zinc-500"
        />
      );
    case "lock":
      return (
        <svg
          {...base({
            className: "h-6 w-6 text-zinc-500",
            strokeWidth: 1.7,
          })}
        >
          <rect x="5" y="11" width="14" height="10" rx="1.5" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </svg>
      );
    case "tower":
      return (
        <svg
          {...base({
            className: "h-6 w-6 text-zinc-500",
            strokeWidth: 1.6,
          })}
        >
          <path d="M6 21 12 3l6 18" />
          <path d="M8 15h8" />
          <path d="M9 11h6" />
          <path d="M10 7h4" />
        </svg>
      );
  }
}
