import type { SVGProps } from "react";
import type { ModalIconKind } from "./types";

type Props = SVGProps<SVGSVGElement> & { name: ModalIconKind };

/**
 * Badge glyphs for the editable modal. All stroke-based so they inherit
 * `currentColor` from the badge, which is driven by `badgeColor` in config.
 */
export function ModalIcon({ name, ...rest }: Props) {
  const base = {
    viewBox: "0 0 24 24",
    fill: "none" as const,
    stroke: "currentColor" as const,
    strokeWidth: 2.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...rest,
  };

  switch (name) {
    case "check":
      return (
        <svg {...base} strokeWidth={3.5}>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      );
    case "cross":
      return (
        <svg {...base} strokeWidth={3.5}>
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      );
    case "clipboard-check":
      return (
        <svg {...base}>
          <path d="M9 4H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2" />
          <rect x="9" y="2" width="6" height="4" rx="1" />
          <polyline points="9 13 11 15 15 11" />
        </svg>
      );
    case "warning":
      return (
        <svg {...base}>
          <path d="M12 3 2 20h20L12 3Z" />
          <line x1="12" y1="10" x2="12" y2="14" />
          <circle cx="12" cy="17.2" r="0.6" fill="currentColor" stroke="none" />
        </svg>
      );
    case "info":
      return (
        <svg {...base}>
          <circle cx="12" cy="12" r="9" />
          <line x1="12" y1="11" x2="12" y2="17" />
          <circle cx="12" cy="7.6" r="0.7" fill="currentColor" stroke="none" />
        </svg>
      );
    case "question":
      return (
        <svg {...base}>
          <circle cx="12" cy="12" r="9" />
          <path d="M9.4 9.3a2.7 2.7 0 0 1 5.2.9c0 1.8-2.6 2.3-2.6 3.8" />
          <circle cx="12" cy="17.2" r="0.7" fill="currentColor" stroke="none" />
        </svg>
      );
    case "lock":
      return (
        <svg {...base}>
          <rect x="4" y="10.5" width="16" height="10.5" rx="2" />
          <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
        </svg>
      );
    case "bell":
      return (
        <svg {...base}>
          <path d="M6 16v-5a6 6 0 1 1 12 0v5l2 2.5H4L6 16Z" />
          <path d="M10 21a2.2 2.2 0 0 0 4 0" />
        </svg>
      );
    case "star":
      return (
        <svg {...base}>
          <path d="m12 3 2.7 5.8 6.3.8-4.6 4.4 1.2 6.3L12 17.3 6.4 20.3l1.2-6.3L3 9.6l6.3-.8L12 3Z" />
        </svg>
      );
    case "trash":
      return (
        <svg {...base}>
          <path d="M4 7h16" />
          <path d="M9 7V4.8A1 1 0 0 1 10 4h4a1 1 0 0 1 1 .8V7" />
          <path d="M6.5 7 7.4 20a1 1 0 0 0 1 1h7.2a1 1 0 0 0 1-1L17.5 7" />
        </svg>
      );
    case "clock":
      return (
        <svg {...base}>
          <circle cx="12" cy="12" r="9" />
          <polyline points="12 7 12 12 15.5 14" />
        </svg>
      );
    case "shield":
      return (
        <svg {...base}>
          <path d="M12 3 4.5 6v6c0 4.6 3.1 8 7.5 9 4.4-1 7.5-4.4 7.5-9V6L12 3Z" />
          <polyline points="9 12 11 14 15 10" />
        </svg>
      );
    case "mail":
      return (
        <svg {...base}>
          <rect x="3" y="5.5" width="18" height="13" rx="2" />
          <polyline points="3.5 7 12 13 20.5 7" />
        </svg>
      );
    case "upload":
      return (
        <svg {...base}>
          <path d="M12 16V4" />
          <polyline points="7.5 8.5 12 4 16.5 8.5" />
          <path d="M4 16v2.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V16" />
        </svg>
      );
  }
}
