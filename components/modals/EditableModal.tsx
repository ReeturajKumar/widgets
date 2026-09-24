"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { BottomWave, ModalHero } from "./ModalHero";
import { ModalIcon } from "./ModalIcons";
import {
  COLOR_PRESETS,
  DECORATION_KINDS,
  EMPTY_MODAL,
  MODAL_HERO_KINDS,
  MODAL_ICON_KINDS,
  type ModalButtonConfig,
  type ModalConfig,
  type ModalIconKind,
  type StepConfig,
} from "./types";

// Row-layout measurements, used to widen the card when buttons sit side by
// side. Keep in step with the button classes below (px-6 card, gap-2.5 row).
const MIN_ROW_BUTTON_WIDTH = 112;
const BUTTON_GAP = 10;
const ADD_BUTTON_WIDTH = 76;
const CARD_PADDING_X = 48;

interface EditableModalProps {
  open: boolean;
  onClose: () => void;
  /** Starting configuration; used only if nothing is in storage yet. */
  defaultConfig?: ModalConfig;
  /** Distinct key per modal so each keeps its own edits. */
  storageKey?: string;
  /** false renders the modal exactly as configured, with no edit affordances. */
  editable?: boolean;
  /** Fired when an action button is pressed, with that button's id. */
  onAction?: (buttonId: string) => void;
  onChange?: (config: ModalConfig) => void;
}

/**
 * Fully-editable popup modal.
 *
 * View mode renders the modal exactly as configured. In edit mode every piece
 * is adjustable: double-click the title, message, a button label or a step
 * label to edit text; click the hero icon to swap it; click a step marker to
 * toggle completed; open the ⚙ panel for hero style, decoration, theme,
 * colours, width, title size, button shape and the various toggles. All
 * changes persist to localStorage under `storageKey`.
 */
export function EditableModal({
  open,
  onClose,
  defaultConfig = EMPTY_MODAL,
  storageKey = "widget.modal.v1",
  editable = true,
  onAction,
  onChange,
}: EditableModalProps) {
  const [config, setConfig] = useState<ModalConfig>(() =>
    loadConfig(storageKey, defaultConfig)
  );
  const [panelOpen, setPanelOpen] = useState(false);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const backdropPressed = useRef(false);

  // The widget stays mounted while closed (it just renders null), so the
  // settings panel and icon picker would otherwise still be open the next time
  // the modal is shown. Reset them on every open/close transition — done during
  // render rather than in an effect so there's no flash of the stale panel.
  const [prevOpen, setPrevOpen] = useState(open);
  if (prevOpen !== open) {
    setPrevOpen(open);
    setPanelOpen(false);
    setIconPickerOpen(false);
  }

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(config));
    } catch {
      // storage full / disabled — silently skip
    }
    onChange?.(config);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, storageKey]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: globalThis.KeyboardEvent) {
      if (event.key !== "Escape") return;
      // Escape backs out of the picker / panel first, then closes the modal.
      if (iconPickerOpen) setIconPickerOpen(false);
      else if (panelOpen) setPanelOpen(false);
      else onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose, panelOpen, iconPickerOpen]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  const dark = config.theme === "dark";

  function patch<K extends keyof ModalConfig>(key: K, value: ModalConfig[K]) {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }

  function patchButton(id: string, changes: Partial<ModalButtonConfig>) {
    setConfig((prev) => ({
      ...prev,
      buttons: prev.buttons.map((b) => (b.id === id ? { ...b, ...changes } : b)),
    }));
  }

  function addButton() {
    setConfig((prev) => ({
      ...prev,
      buttons: [
        ...prev.buttons,
        {
          id: `b-${Date.now().toString(36)}`,
          label: "Action",
          color: prev.badgeColor,
          variant: "solid",
        },
      ],
    }));
  }

  function removeButton(id: string) {
    setConfig((prev) => ({
      ...prev,
      buttons: prev.buttons.filter((b) => b.id !== id),
    }));
  }

  function patchStep(id: string, changes: Partial<StepConfig>) {
    setConfig((prev) => ({
      ...prev,
      steps: prev.steps.map((s) => (s.id === id ? { ...s, ...changes } : s)),
    }));
  }

  function addStep() {
    setConfig((prev) => ({
      ...prev,
      steps: [
        ...prev.steps,
        { id: `s-${Date.now().toString(36)}`, label: "New step", done: false },
      ],
    }));
  }

  function removeStep(id: string) {
    setConfig((prev) => ({
      ...prev,
      steps: prev.steps.filter((s) => s.id !== id),
    }));
  }

  function reset() {
    setConfig(defaultConfig);
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
  }

  // Flat fill — no gradient, so the card has no faded band at its foot.
  const cardBackground = config.cardColor ?? (dark ? "#1c1c1f" : "#ffffff");

  // A clear pane has no colour of its own, so the content contrasts against
  // whatever is BEHIND the card. A dimmed backdrop puts 60% black back there,
  // which makes the pane read dark whatever the theme says — so text follows
  // the backdrop in that case. `dark` still drives the solid-card fill;
  // `darkSurface` drives everything readable that sits on top.
  const darkSurface = config.glassCard ? dark || config.dimBackdrop : dark;

  // Clear glass: barely any fill, so the pane carries no cast of its own and
  // whatever sits behind simply shows through.
  //
  // The saturate() matters. Blur averages a busy region toward mid-grey, which
  // is what made the pane look grey rather than clear — the fill was never the
  // culprit. Boosting chroma puts back what the blur washes out, so the colours
  // behind stay colours. The text halo carries legibility, so the blur does not
  // have to be wide.
  const GLASS_FILTER = "blur(14px) saturate(190%)";
  const cardSurface: CSSProperties = config.glassCard
    ? {
        background: "rgba(255, 255, 255, 0.06)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.18)",
        backdropFilter: GLASS_FILTER,
        WebkitBackdropFilter: GLASS_FILTER,
        borderColor: "rgba(255, 255, 255, 0.25)",
      }
    : { backgroundColor: cardBackground };

  // A side-by-side button row divides the card width between its buttons, so
  // adding one would otherwise just make them all thinner. Widen the card to
  // whatever the row actually needs; the configured width stays the floor.
  const rowButtonCount = config.stackButtons ? 0 : config.buttons.length;
  const rowNeeds =
    rowButtonCount === 0
      ? 0
      : rowButtonCount * MIN_ROW_BUTTON_WIDTH +
        (rowButtonCount - 1) * BUTTON_GAP +
        (editable ? ADD_BUTTON_WIDTH + BUTTON_GAP : 0) +
        CARD_PADDING_X;
  const effectiveWidth = Math.max(config.width, rowNeeds);

  const buttonRadius = config.buttonShape === "pill" ? "rounded-full" : "rounded-lg";
  const titleClass =
    config.titleSize === "lg" ? "text-[22px]" : "text-lg";

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={config.title}
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 transition-opacity"
      // Close only when the press AND the release both land on the backdrop
      // itself. Without the press check, drag-selecting text inside the card
      // and releasing past its edge would dismiss the modal mid-edit.
      onMouseDown={(event) => {
        backdropPressed.current = event.target === event.currentTarget;
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && backdropPressed.current) {
          onClose();
        }
      }}
      // Lift the centred card above the settings bar while it's open.
      style={panelOpen ? { paddingBottom: PANEL_LIFT } : undefined}
    >
      {/* Dim and blur live on their own layer rather than on the backdrop
          element. An element with backdrop-filter becomes a *backdrop root*,
          and a descendant's own backdrop-filter can then only sample what is
          painted inside it — so a glass card nested under a blurred backdrop
          would have nothing to refract and would render flat. As a sibling
          painted underneath, this still gets picked up by the card's glass.
          pointer-events-none keeps backdrop-click-to-close working. */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 ${
          config.dimBackdrop ? "bg-black/60" : ""
        } ${config.blurBackdrop ? "backdrop-blur-sm" : ""}`}
      />

      <div className="relative" onClick={(event) => event.stopPropagation()}>
        {/* ── The modal card ── */}
        <div
          style={{
            width: effectiveWidth,
            maxWidth: "90vw",
            ...cardSurface,
          }}
          className={`relative overflow-hidden rounded-2xl border px-6 pb-6 pt-7 shadow-2xl shadow-black/25 ${
            config.glassCard
              ? ""
              : darkSurface
                ? "border-white/10"
                : "border-black/10"
          }`}
        >
          {config.showBottomWave && <BottomWave color={config.badgeColor} />}

          {/* Edit-panel toggle (mirrors the close button) */}
          {editable && (
            <button
              type="button"
              onClick={() => setPanelOpen((v) => !v)}
              title="Modal settings"
              aria-label="Modal settings"
              className={`absolute left-3.5 top-3.5 z-30 flex h-6 w-6 items-center justify-center rounded-full transition-colors ${
                panelOpen
                  ? "bg-blue-500 text-white"
                  : darkSurface
                    ? "text-zinc-500 hover:bg-white/10 hover:text-zinc-300"
                    : "text-zinc-400 hover:bg-black/5 hover:text-zinc-600"
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
              </svg>
            </button>
          )}

          {/* Close button */}
          {config.showClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className={`absolute right-3.5 top-3.5 z-30 flex h-6 w-6 items-center justify-center rounded-full transition-colors ${
                darkSurface
                  ? "text-zinc-500 hover:bg-white/10 hover:text-zinc-300"
                  : "text-zinc-400 hover:bg-black/5 hover:text-zinc-600"
              }`}
            >
              <svg
                viewBox="0 0 14 14"
                className="h-3 w-3"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <line x1="2" y1="2" x2="12" y2="12" />
                <line x1="12" y1="2" x2="2" y2="12" />
              </svg>
            </button>
          )}

          {/* Content sits above the decorative wave */}
          <div
            className="relative z-10 flex flex-col items-center text-center"
            style={
              // Glass shows whatever is behind it, which the text has to stay
              // legible against — a soft shadow separates the two. The pane
              // recipe itself is untouched.
              config.glassCard
                ? {
                    // A halo, not a drop shadow: a clear pane can put text
                    // over anything, and a glow ringing the glyphs separates
                    // them from the background whatever its luminance.
                    textShadow: darkSurface
                      ? "0 1px 3px rgba(0,0,0,0.65), 0 0 10px rgba(0,0,0,0.5)"
                      : "0 1px 2px rgba(255,255,255,0.95), 0 0 10px rgba(255,255,255,0.85)",
                  }
                : undefined
            }
          >
            {/* Hero + its icon picker */}
            {config.showBadge && config.hero !== "none" && (
              <div className="relative w-full">
                <ModalHero
                  hero={config.hero}
                  icon={config.icon}
                  color={config.badgeColor}
                  showRipples={config.showRipples}
                  decoration={config.decoration}
                  dark={darkSurface}
                  editable={editable}
                  onIconClick={() => setIconPickerOpen((v) => !v)}
                  steps={config.steps}
                  renderStepLabel={(step) => (
                    <Editable
                      value={step.label}
                      onChange={(v) => patchStep(step.id, { label: v || "Step" })}
                      editable={editable}
                      dark={darkSurface}
                    />
                  )}
                  onToggleStepDone={(id) => {
                    const step = config.steps.find((s) => s.id === id);
                    if (step) patchStep(id, { done: !step.done });
                  }}
                  onRemoveStep={removeStep}
                  onAddStep={addStep}
                />

                {iconPickerOpen && (
                  <div
                    style={{ width: 196 }}
                    className="absolute left-1/2 top-full z-40 -translate-x-1/2 rounded-lg border border-zinc-200 bg-white p-1.5 shadow-2xl"
                  >
                    <div className="grid grid-cols-5 gap-1">
                      {MODAL_ICON_KINDS.map((kind) => (
                        <button
                          key={kind}
                          type="button"
                          onClick={() => {
                            patch("icon", kind);
                            setIconPickerOpen(false);
                          }}
                          title={kind}
                          className={`flex h-8 w-8 items-center justify-center rounded ${
                            kind === config.icon
                              ? "bg-blue-600 text-white"
                              : "text-zinc-600 hover:bg-zinc-100"
                          }`}
                        >
                          <ModalIcon name={kind} className="h-4 w-4" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Title */}
            <h2
              className={`${titleClass} font-bold tracking-tight ${
                darkSurface ? "text-white" : "text-zinc-900"
              }`}
            >
              <Editable
                value={config.title}
                onChange={(v) => patch("title", v || "Title")}
                editable={editable}
                dark={darkSurface}
              />
            </h2>

            {/* Message */}
            <div
              className={`mt-1.5 w-full max-w-[280px] text-[13px] leading-relaxed ${
                darkSurface ? "text-zinc-200" : "text-zinc-700"
              }`}
            >
              <Editable
                value={config.message}
                onChange={(v) => patch("message", v)}
                editable={editable}
                dark={darkSurface}
                placeholder="Message"
                multiline
              />
            </div>

            {/* Action buttons */}
            {(config.buttons.length > 0 || editable) && (
              <div
                className={`mt-5 flex w-full gap-2.5 ${
                  config.stackButtons ? "flex-col" : "flex-row"
                }`}
              >
                {config.buttons.map((button) => (
                  <div key={button.id} className="group/btn relative flex-1">
                    <button
                      type="button"
                      onClick={() => {
                        // Inert while editing: otherwise the first click of a
                        // double-click would fire onClose and dismiss the modal
                        // before the label editor could open.
                        if (editable) return;
                        onAction?.(button.id);
                        onClose();
                      }}
                      style={
                        button.variant === "solid"
                          ? { backgroundColor: button.color }
                          : { borderColor: button.color, color: button.color }
                      }
                      className={`w-full ${buttonRadius} px-4 py-2.5 text-[13px] font-semibold transition-all hover:brightness-110 active:scale-[0.98] ${
                        button.variant === "solid"
                          ? "text-white shadow-sm"
                          : "border-[1.5px] bg-transparent"
                      }`}
                    >
                      <Editable
                        value={button.label}
                        onChange={(v) =>
                          patchButton(button.id, { label: v || "Action" })
                        }
                        editable={editable}
                        // A solid button is a saturated surface with white
                        // text, so its editor needs the dark treatment even on
                        // a light card — the light one is a white field, which
                        // would put white text on a white background.
                        dark={button.variant === "solid" ? true : darkSurface}
                      />
                    </button>
                    {editable && (
                      <button
                        type="button"
                        onClick={() => removeButton(button.id)}
                        title="Remove button"
                        aria-label="Remove button"
                        className="absolute -left-1.5 -top-1.5 hidden h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] leading-none text-white shadow group-hover/btn:flex"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                {editable && (
                  <button
                    type="button"
                    onClick={addButton}
                    title="Add button"
                    aria-label="Add button"
                    className={`${buttonRadius} border border-dashed px-3 py-2.5 text-[11px] font-medium transition-colors ${
                      config.stackButtons ? "w-full" : "shrink-0"
                    } ${
                      darkSurface
                        ? "border-white/25 text-zinc-400 hover:border-white/60 hover:text-white"
                        : "border-black/20 text-zinc-500 hover:border-blue-500 hover:text-blue-600"
                    }`}
                  >
                    + Button
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Settings panel ── */}
        {editable && panelOpen && (
          <SettingsPanel
            config={config}
            patch={patch}
            onReset={reset}
            onClose={() => setPanelOpen(false)}
          />
        )}
      </div>
    </div>,
    document.body
  );
}

// ── Settings panel ────────────────────────────────────────────────────

interface SettingsPanelProps {
  config: ModalConfig;
  patch: <K extends keyof ModalConfig>(key: K, value: ModalConfig[K]) => void;
  onReset: () => void;
  onClose: () => void;
}

/** Landscape settings bar pinned to the foot of the viewport. */
const PANEL_WIDTH = 616;
/** Bottom padding the backdrop adds so the card clears the open bar. */
const PANEL_LIFT = 380;

function SettingsPanel({ config, patch, onReset, onClose }: SettingsPanelProps) {
  return (
    <div
      style={{ width: PANEL_WIDTH, maxWidth: "calc(100vw - 32px)" }}
      // Pinned to the foot of the viewport rather than hung off the card: the
      // card is vertically centred, so a panel this tall fits neither above
      // nor below it. The backdrop adds matching bottom padding so the card
      // lifts clear of the bar instead of sitting behind it.
      className="fixed bottom-4 left-1/2 z-30 max-h-[52vh] -translate-x-1/2 overflow-y-auto rounded-lg border border-zinc-200 bg-white p-3 text-zinc-700 shadow-2xl"
    >
      {/* Header */}
      <div className="mb-2.5 flex items-center justify-between border-b border-zinc-100 pb-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-wider">
          Modal settings
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onReset}
            title="Reset to defaults"
            className="text-[9px] font-medium text-zinc-400 hover:text-blue-600"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="text-[10px] leading-none text-zinc-400 hover:text-zinc-700"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Three columns of controls */}
      <div className="grid grid-cols-3 gap-x-4">
        {/* ── Column 1: structure ── */}
        <div>
          <Group label="Hero style">
            <div className="grid grid-cols-2 gap-1">
              {MODAL_HERO_KINDS.map((h) => (
                <Chip
                  key={h.id}
                  label={h.label}
                  active={config.hero === h.id}
                  onClick={() => patch("hero", h.id)}
                />
              ))}
            </div>
          </Group>

          <Group label="Decoration">
            <div className="grid grid-cols-3 gap-1">
              {DECORATION_KINDS.map((d) => (
                <Chip
                  key={d.id}
                  label={d.label}
                  active={config.decoration === d.id}
                  onClick={() => patch("decoration", d.id)}
                />
              ))}
            </div>
          </Group>

          <Group label={`Width — ${config.width}px`}>
            <input
              type="range"
              min={260}
              max={520}
              step={10}
              value={config.width}
              onChange={(e) => patch("width", Number(e.target.value))}
              className="w-full accent-blue-600"
            />
          </Group>
        </div>

        {/* ── Column 2: colours ── */}
        <div>
          <Group label="Accent colour">
            <ColorRow
              value={config.badgeColor}
              onChange={(v) => patch("badgeColor", v)}
            />
          </Group>

          <Group label="Card colour">
            <ColorRow
              value={
                config.cardColor ??
                (config.theme === "dark" ? "#1c1c1f" : "#ffffff")
              }
              onChange={(v) => patch("cardColor", v)}
              onAuto={() => patch("cardColor", undefined)}
              isAuto={config.cardColor === undefined}
            />
          </Group>
        </div>

        {/* ── Column 3: theme, type, buttons, size ── */}
        <div>
          <Group label="Theme">
            <div className="grid grid-cols-2 gap-1">
              {(["light", "dark"] as const).map((t) => (
                <Chip
                  key={t}
                  label={t === "light" ? "Light" : "Dark"}
                  active={config.theme === t}
                  onClick={() => patch("theme", t)}
                />
              ))}
            </div>
          </Group>

          <Group label="Title size">
            <div className="grid grid-cols-2 gap-1">
              {(["md", "lg"] as const).map((t) => (
                <Chip
                  key={t}
                  label={t === "md" ? "Medium" : "Large"}
                  active={config.titleSize === t}
                  onClick={() => patch("titleSize", t)}
                />
              ))}
            </div>
          </Group>

          <Group label="Button shape">
            <div className="grid grid-cols-2 gap-1">
              {(["rounded", "pill"] as const).map((b) => (
                <Chip
                  key={b}
                  label={b === "rounded" ? "Rounded" : "Pill"}
                  active={config.buttonShape === b}
                  onClick={() => patch("buttonShape", b)}
                />
              ))}
            </div>
          </Group>

        </div>
      </div>

      {/* Toggles run the full width in a four-up grid */}
      <div className="border-t border-zinc-100 pt-2">
        <div className="mb-1.5 text-[9px] font-semibold uppercase tracking-wide text-zinc-400">
          Toggles
        </div>
        <div className="grid grid-cols-4 gap-x-4 gap-y-1.5">
          <Toggle
            label="Show hero"
            checked={config.showBadge}
            onChange={(v) => patch("showBadge", v)}
          />
          <Toggle
            label="Ripple rings"
            checked={config.showRipples}
            onChange={(v) => patch("showRipples", v)}
          />
          <Toggle
            label="Bottom wave"
            checked={config.showBottomWave}
            onChange={(v) => patch("showBottomWave", v)}
          />
          <Toggle
            label="Close button"
            checked={config.showClose}
            onChange={(v) => patch("showClose", v)}
          />
          <Toggle
            label="Stack buttons"
            checked={config.stackButtons}
            onChange={(v) => patch("stackButtons", v)}
          />
          <Toggle
            label="Dim backdrop"
            checked={config.dimBackdrop}
            onChange={(v) => patch("dimBackdrop", v)}
          />
          <Toggle
            label="Blur backdrop"
            checked={config.blurBackdrop}
            onChange={(v) => patch("blurBackdrop", v)}
          />
          <Toggle
            label="Glass card"
            checked={config.glassCard}
            onChange={(v) => patch("glassCard", v)}
          />
        </div>
      </div>

      <p className="mt-2 border-t border-zinc-100 pt-1.5 text-[9px] text-zinc-400">
        Double-click text to edit · click the hero icon to change it · click a
        step to toggle it · hover a button or step to remove it
      </p>
    </div>
  );
}

function Group({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-2">
      <div className="mb-1 text-[9px] font-semibold uppercase tracking-wide text-zinc-400">
        {label}
      </div>
      {children}
    </div>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded border py-1 text-[10px] font-medium ${
        active
          ? "border-blue-500 bg-blue-50 text-blue-700"
          : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
      }`}
    >
      {label}
    </button>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between text-[10px] text-zinc-600">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-3 w-3 cursor-pointer accent-blue-600"
      />
    </label>
  );
}

function ColorRow({
  value,
  onChange,
  onAuto,
  isAuto,
}: {
  value: string;
  onChange: (value: string) => void;
  /** When given, shows an "Auto" chip that clears the override. */
  onAuto?: () => void;
  isAuto?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      {onAuto && (
        <button
          type="button"
          onClick={onAuto}
          className={`rounded border py-0.5 text-[9px] font-medium ${
            isAuto
              ? "border-blue-500 bg-blue-50 text-blue-700"
              : "border-zinc-200 text-zinc-500 hover:border-zinc-300"
          }`}
        >
          Auto (follow theme)
        </button>
      )}
      <div className="grid grid-cols-8 gap-1">
        {COLOR_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => onChange(preset)}
            title={preset}
            style={{ backgroundColor: preset }}
            className={`h-4 w-full rounded-sm border ${
              value.toLowerCase() === preset.toLowerCase()
                ? "border-zinc-800 ring-1 ring-zinc-800"
                : "border-black/10"
            }`}
          />
        ))}
      </div>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-5 w-full cursor-pointer rounded border border-zinc-200 bg-white p-0"
      />
    </div>
  );
}

// ── Inline editable text ──────────────────────────────────────────────

interface EditableProps {
  value: string;
  onChange: (value: string) => void;
  editable: boolean;
  dark: boolean;
  placeholder?: string;
  multiline?: boolean;
}

function Editable({
  value,
  onChange,
  editable,
  dark,
  placeholder,
  multiline = false,
}: EditableProps) {
  const [session, setSession] = useState<number | null>(null);

  if (!editable) return <>{value || placeholder}</>;

  if (session !== null) {
    return (
      <EditableInput
        key={session}
        initial={value}
        placeholder={placeholder}
        dark={dark}
        multiline={multiline}
        onCommit={(next) => {
          setSession(null);
          if (next !== value) onChange(next);
        }}
        onCancel={() => setSession(null)}
      />
    );
  }

  return (
    <span
      // Keep clicks from reaching a clickable ancestor (an action button wraps
      // its own label), so a click here can never dismiss the modal.
      onClick={(event) => event.stopPropagation()}
      onDoubleClick={(event) => {
        event.stopPropagation();
        setSession(Date.now());
      }}
      title="Double-click to edit"
      // block, not inline: a wrapped inline span leaves dead gaps between its
      // line boxes where a double-click would miss the span entirely.
      className={`block cursor-text rounded px-0.5 ${
        dark ? "hover:bg-white/15" : "hover:bg-black/5"
      } ${!value ? "italic opacity-60" : ""}`}
    >
      {value || placeholder || " "}
    </span>
  );
}

interface EditableInputProps {
  initial: string;
  placeholder?: string;
  dark: boolean;
  multiline: boolean;
  onCommit: (value: string) => void;
  onCancel: () => void;
}

/** Isolated editing session — mounted per edit so state can't drift with props. */
function EditableInput({
  initial,
  placeholder,
  dark,
  multiline,
  onCommit,
  onCancel,
}: EditableInputProps) {
  const [draft, setDraft] = useState(initial);
  const committed = useRef(false);

  // Callback ref: focuses and selects the moment the field mounts, without
  // reading a ref during render.
  function focusOnMount(node: HTMLInputElement | HTMLTextAreaElement | null) {
    if (!node) return;
    node.focus();
    // Caret at the end — select-all lets the first keystroke wipe the text.
    const caret = node;
    if (caret) caret.setSelectionRange(caret.value.length, caret.value.length);
  }

  function commit() {
    if (committed.current) return;
    committed.current = true;
    onCommit(draft);
  }

  function onKey(
    event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    if (event.key === "Enter" && !(multiline && event.shiftKey)) {
      event.preventDefault();
      commit();
    } else if (event.key === "Escape") {
      event.preventDefault();
      // Contain it: the modal listens for Escape on the document to close
      // itself, so without this an abandoned edit would also dismiss the modal.
      event.stopPropagation();
      committed.current = true;
      onCancel();
    }
  }

  const chrome = `w-full rounded border px-1 text-center text-inherit outline-none ${
    dark
      ? "border-white/40 bg-white/10 focus:border-white"
      : "border-zinc-300 bg-white focus:border-blue-500"
  }`;

  if (multiline) {
    return (
      <textarea
        ref={focusOnMount}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={onKey}
        placeholder={placeholder}
        rows={3}
        className={`${chrome} resize-none`}
      />
    );
  }

  return (
    <input
      ref={focusOnMount}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={onKey}
      placeholder={placeholder}
      className={chrome}
    />
  );
}

// ── Storage helper ────────────────────────────────────────────────────

function loadConfig(key: string, fallback: ModalConfig): ModalConfig {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<ModalConfig>;
    // Shallow merge so a stored config missing newer fields still boots.
    return { ...fallback, ...parsed };
  } catch {
    return fallback;
  }
}

export type { ModalConfig, ModalIconKind };
