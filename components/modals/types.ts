// Config shape for the editable modal widget.
//
// Every visible thing in a modal — the hero treatment (badge / illustration /
// stepper), its icon and colour, the decorative sparkles or confetti, the
// title, message, each action button, the card theme/colour/width, the close
// button and the backdrop — is a field here. A parent passes a preset in; the
// widget edits itself in place and round-trips the same object through
// localStorage.

export type ModalIconKind =
  | "check"
  | "cross"
  | "clipboard-check"
  | "warning"
  | "info"
  | "question"
  | "lock"
  | "bell"
  | "star"
  | "trash"
  | "clock"
  | "shield"
  | "mail"
  | "upload";

export const MODAL_ICON_KINDS: ModalIconKind[] = [
  "check",
  "cross",
  "clipboard-check",
  "warning",
  "info",
  "question",
  "lock",
  "bell",
  "star",
  "trash",
  "clock",
  "shield",
  "mail",
  "upload",
];

/** Which illustration sits at the top of the card. */
export type ModalHeroKind = "badge" | "document" | "giftbox" | "stepper" | "none";

export const MODAL_HERO_KINDS: { id: ModalHeroKind; label: string }[] = [
  { id: "badge", label: "Badge" },
  { id: "document", label: "Document" },
  { id: "giftbox", label: "Gift box" },
  { id: "stepper", label: "Steps" },
  { id: "none", label: "None" },
];

/** Festive bits scattered around the hero. */
export type DecorationKind = "none" | "sparkles" | "confetti";

export const DECORATION_KINDS: { id: DecorationKind; label: string }[] = [
  { id: "none", label: "None" },
  { id: "sparkles", label: "Sparkles" },
  { id: "confetti", label: "Confetti" },
];

export type ButtonShape = "pill" | "rounded";
export type TitleSize = "md" | "lg";

export type ButtonVariant = "solid" | "outline";

export interface ModalButtonConfig {
  /** Stable id — map key and delete handle. */
  id: string;
  label: string;
  color: string;
  variant: ButtonVariant;
}

export interface StepConfig {
  /** Stable id — map key and delete handle. */
  id: string;
  /** Label under the step marker; wraps onto a second line when long. */
  label: string;
  /** Completed steps render a filled check, pending ones a hollow ring. */
  done: boolean;
}

export interface ModalConfig {
  // ── Hero ──
  showBadge: boolean;
  hero: ModalHeroKind;
  icon: ModalIconKind;
  badgeColor: string;
  /** Concentric soft rings behind a "badge" hero. */
  showRipples: boolean;
  decoration: DecorationKind;
  /** Steps shown when `hero` is "stepper". */
  steps: StepConfig[];

  // ── Text ──
  title: string;
  titleSize: TitleSize;
  message: string;

  // ── Actions ──
  buttons: ModalButtonConfig[];
  /** Stack buttons vertically instead of side by side. */
  stackButtons: boolean;
  buttonShape: ButtonShape;

  // ── Card ──
  theme: "dark" | "light";
  /** Flat card background. Omitted means "derive it from `theme`". */
  cardColor?: string;
  /** Max card width in px. */
  width: number;
  showClose: boolean;
  /** Soft decorative wave across the foot of the card. */
  showBottomWave: boolean;
  /**
   * Frosted-glass card: a translucent fill that blurs whatever sits behind it,
   * instead of the flat `cardColor`. Reads best with the backdrop dim turned
   * down, so some of the page shows through to be refracted.
   */
  glassCard: boolean;

  // ── Backdrop ──
  dimBackdrop: boolean;
  blurBackdrop: boolean;
}

/** Swatches offered by the colour pickers in the settings panel. */
export const COLOR_PRESETS = [
  "#22c55e",
  "#16a34a",
  "#3cd070",
  "#14b8a6",
  "#3b82f6",
  "#2563eb",
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#ff5252",
  "#dc2626",
  "#f06126",
  "#f59e0b",
  "#eab308",
  "#71717a",
  "#334155",
] as const;

// Shared greens for the success family.
const GREEN_SOLID = "#16a34a";
const GREEN_BADGE = "#22c55e";

// ── Presets ──────────────────────────────────────────────────────────

/** 1 — plain check badge, single OK action. */
export const SUCCESS_SIMPLE: ModalConfig = {
  showBadge: true,
  hero: "badge",
  icon: "check",
  badgeColor: GREEN_BADGE,
  showRipples: true,
  decoration: "sparkles",
  steps: [],
  title: "Success!",
  titleSize: "lg",
  message: "Your data has been submitted successfully.",
  buttons: [{ id: "b1", label: "OK", color: GREEN_SOLID, variant: "solid" }],
  stackButtons: true,
  buttonShape: "rounded",
  theme: "light",
  width: 300,
  showClose: true,
  showBottomWave: false,
  dimBackdrop: true,
  blurBackdrop: true,
  glassCard: false,
};

/** 2 — document illustration, "View Details" action. */
export const SUBMITTED_DOCUMENT: ModalConfig = {
  showBadge: true,
  hero: "document",
  icon: "check",
  badgeColor: GREEN_BADGE,
  showRipples: false,
  decoration: "confetti",
  steps: [],
  title: "Submitted Successfully!",
  titleSize: "lg",
  message: "Your information has been saved successfully.",
  buttons: [
    { id: "b1", label: "View Details", color: GREEN_SOLID, variant: "solid" },
  ],
  stackButtons: true,
  buttonShape: "rounded",
  theme: "light",
  width: 340,
  showClose: true,
  showBottomWave: false,
  dimBackdrop: true,
  blurBackdrop: true,
  glassCard: false,
};

/** 3 — ringed badge with two side-by-side actions. */
export const SUCCESS_TWO_ACTIONS: ModalConfig = {
  showBadge: true,
  hero: "badge",
  icon: "check",
  badgeColor: GREEN_BADGE,
  showRipples: true,
  decoration: "confetti",
  steps: [],
  title: "Success!",
  titleSize: "lg",
  message: "Your request has been completed successfully.",
  buttons: [
    {
      id: "b1",
      label: "Go to Dashboard",
      color: GREEN_SOLID,
      variant: "outline",
    },
    { id: "b2", label: "Close", color: GREEN_SOLID, variant: "solid" },
  ],
  stackButtons: false,
  buttonShape: "rounded",
  theme: "light",
  width: 380,
  showClose: true,
  showBottomWave: false,
  dimBackdrop: true,
  blurBackdrop: true,
  glassCard: false,
};

/** 4 — gift-box illustration with a decorative wave at the card foot. */
export const GREAT_GIFTBOX: ModalConfig = {
  showBadge: true,
  hero: "giftbox",
  icon: "check",
  badgeColor: GREEN_BADGE,
  showRipples: false,
  decoration: "confetti",
  steps: [],
  title: "Great!",
  titleSize: "lg",
  message: "Your changes have been saved successfully.",
  buttons: [
    { id: "b1", label: "Continue", color: GREEN_SOLID, variant: "solid" },
  ],
  stackButtons: true,
  buttonShape: "rounded",
  theme: "light",
  width: 340,
  showClose: true,
  showBottomWave: true,
  dimBackdrop: true,
  blurBackdrop: true,
  glassCard: false,
};

/** 5 — three-step progress row above the copy. */
export const ALL_DONE_STEPS: ModalConfig = {
  showBadge: true,
  hero: "stepper",
  icon: "check",
  badgeColor: GREEN_BADGE,
  showRipples: false,
  decoration: "none",
  steps: [
    { id: "s1", label: "Details Submitted", done: true },
    { id: "s2", label: "Processing Completed", done: true },
    { id: "s3", label: "Success", done: true },
  ],
  title: "All Done!",
  titleSize: "lg",
  message: "Your data has been processed successfully.",
  buttons: [{ id: "b1", label: "OK", color: GREEN_SOLID, variant: "solid" }],
  stackButtons: true,
  buttonShape: "rounded",
  theme: "light",
  width: 400,
  showClose: true,
  showBottomWave: false,
  dimBackdrop: true,
  blurBackdrop: true,
  glassCard: false,
};

/** 6 — redesigned account-blocked warning, same light language. */
export const BLOCKED_MODAL: ModalConfig = {
  showBadge: true,
  hero: "badge",
  icon: "cross",
  badgeColor: "#ff5252",
  showRipples: true,
  decoration: "none",
  steps: [],
  title: "Account blocked!",
  titleSize: "lg",
  message:
    "Your account is temporarily blocked. We will unlock it in 24 hours. If you forget your password, you will have 24 hours to recover it.",
  buttons: [{ id: "b1", label: "Got it", color: "#dc2626", variant: "solid" }],
  stackButtons: true,
  buttonShape: "rounded",
  theme: "light",
  width: 320,
  showClose: true,
  showBottomWave: false,
  dimBackdrop: true,
  blurBackdrop: true,
  glassCard: false,
};

/** 7 — redesigned submit-for-review confirmation. */
export const SUBMISSION_MODAL: ModalConfig = {
  showBadge: true,
  hero: "badge",
  icon: "clipboard-check",
  badgeColor: "#3b82f6",
  showRipples: true,
  decoration: "none",
  steps: [],
  title: "Submit for review?",
  titleSize: "lg",
  message:
    "Once submitted, your entry will be sent for review and can no longer be edited.",
  buttons: [
    { id: "b1", label: "Cancel", color: "#71717a", variant: "outline" },
    { id: "b2", label: "Submit", color: "#2563eb", variant: "solid" },
  ],
  stackButtons: false,
  buttonShape: "rounded",
  theme: "light",
  width: 360,
  showClose: true,
  showBottomWave: false,
  dimBackdrop: true,
  blurBackdrop: true,
  glassCard: false,
};

/** Blank starting point for a brand-new modal. */
export const EMPTY_MODAL: ModalConfig = {
  showBadge: true,
  hero: "badge",
  icon: "info",
  badgeColor: "#3b82f6",
  showRipples: true,
  decoration: "none",
  steps: [],
  title: "Title",
  titleSize: "lg",
  message: "Message goes here.",
  buttons: [{ id: "b1", label: "OK", color: "#2563eb", variant: "solid" }],
  stackButtons: true,
  buttonShape: "rounded",
  theme: "light",
  width: 320,
  showClose: true,
  showBottomWave: false,
  dimBackdrop: true,
  blurBackdrop: true,
  glassCard: false,
};

// ── Colour helper ────────────────────────────────────────────────────

/** Hex → rgba string, used for ripple rings, waves and tinted fills. */
export function hexToRgba(hex: string, alpha: number): string {
  const raw = hex.replace("#", "");
  const full =
    raw.length === 3
      ? raw
          .split("")
          .map((c) => c + c)
          .join("")
      : raw;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  if ([r, g, b].some(Number.isNaN)) return `rgba(34, 197, 94, ${alpha})`;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
