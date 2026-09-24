"use client";

import { ModalIcon } from "./ModalIcons";
import {
  hexToRgba,
  type DecorationKind,
  type ModalIconKind,
} from "./types";

// ── Decorations ──────────────────────────────────────────────────────

/** Confetti uses a fixed festive mix; sparkles tint from the hero colour. */
const CONFETTI_COLORS = ["#22c55e", "#3b82f6", "#eab308", "#16a34a", "#60a5fa"];

interface DecorationProps {
  kind: DecorationKind;
  color: string;
}

/**
 * Scattered bits behind the hero. Positions are hand-placed percentages so the
 * arrangement reads deliberately rather than randomly, and stays stable across
 * re-renders (no Math.random, which would reshuffle on every keystroke).
 */
function Decoration({ kind, color }: DecorationProps) {
  if (kind === "none") return null;

  if (kind === "sparkles") {
    const sparkles = [
      { x: 8, y: 22, s: 9 },
      { x: 20, y: 58, s: 6 },
      { x: 84, y: 18, s: 10 },
      { x: 92, y: 48, s: 6 },
      { x: 74, y: 66, s: 7 },
    ];
    return (
      <div className="pointer-events-none absolute inset-0 select-none">
        {sparkles.map((sp, i) => (
          <svg
            key={i}
            viewBox="0 0 24 24"
            style={{
              position: "absolute",
              left: `${sp.x}%`,
              top: `${sp.y}%`,
              width: sp.s,
              height: sp.s,
              color,
            }}
            fill="currentColor"
          >
            <path d="M12 0l2.2 9.8L24 12l-9.8 2.2L12 24l-2.2-9.8L0 12l9.8-2.2L12 0z" />
          </svg>
        ))}
      </div>
    );
  }

  // confetti — short rounded dashes at varied angles
  const bits = [
    { x: 6, y: 30, r: -28, c: 0 },
    { x: 15, y: 60, r: 42, c: 2 },
    { x: 24, y: 16, r: 14, c: 1 },
    { x: 34, y: 72, r: -52, c: 3 },
    { x: 68, y: 12, r: 36, c: 4 },
    { x: 78, y: 40, r: -18, c: 2 },
    { x: 88, y: 24, r: 58, c: 1 },
    { x: 92, y: 62, r: -40, c: 0 },
    { x: 60, y: 74, r: 24, c: 2 },
  ];
  return (
    <div className="pointer-events-none absolute inset-0 select-none">
      {bits.map((b, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            left: `${b.x}%`,
            top: `${b.y}%`,
            width: 9,
            height: 3.5,
            borderRadius: 2,
            backgroundColor: CONFETTI_COLORS[b.c],
            transform: `rotate(${b.r}deg)`,
          }}
        />
      ))}
    </div>
  );
}

// ── Hero: circular badge ─────────────────────────────────────────────

interface BadgeHeroProps {
  icon: ModalIconKind;
  color: string;
  showRipples: boolean;
  editable: boolean;
  onIconClick: () => void;
}

function BadgeHero({
  icon,
  color,
  showRipples,
  editable,
  onIconClick,
}: BadgeHeroProps) {
  return (
    <div className="relative flex h-[88px] items-center justify-center">
      {showRipples && (
        <>
          <span
            style={{
              height: 88,
              width: 88,
              backgroundColor: hexToRgba(color, 0.12),
            }}
            className="pointer-events-none absolute rounded-full"
          />
          <span
            style={{
              height: 72,
              width: 72,
              backgroundColor: hexToRgba(color, 0.2),
            }}
            className="pointer-events-none absolute rounded-full"
          />
        </>
      )}
      <button
        type="button"
        onClick={() => editable && onIconClick()}
        disabled={!editable}
        title={editable ? "Change icon" : undefined}
        style={{ backgroundColor: color }}
        className={`relative flex h-[58px] w-[58px] items-center justify-center rounded-full text-white ${
          editable ? "cursor-pointer hover:brightness-110" : ""
        }`}
      >
        <ModalIcon name={icon} className="h-7 w-7" />
      </button>
    </div>
  );
}

// ── Hero: document with a check overlay ──────────────────────────────

function DocumentHero({
  icon,
  color,
  editable,
  onIconClick,
}: Omit<BadgeHeroProps, "showRipples">) {
  return (
    <div className="relative flex h-[100px] items-center justify-center">
      <svg viewBox="0 0 84 96" className="h-[92px] w-[84px]">
        {/* Page with a folded top-right corner */}
        <path
          d="M8 4h44l24 24v60a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4Z"
          fill="#dbe2ec"
        />
        <path d="M52 4l24 24H56a4 4 0 0 1-4-4V4Z" fill="#c3cede" />
        {/* Text lines */}
        {[42, 54, 66].map((y, i) => (
          <rect
            key={y}
            x="20"
            y={y}
            width={i === 2 ? 26 : 44}
            height="5"
            rx="2.5"
            fill="#9fb0c4"
          />
        ))}
        <rect x="20" y="28" width="26" height="5" rx="2.5" fill="#9fb0c4" />
      </svg>

      {/* Check badge tucked into the lower-right of the page */}
      <button
        type="button"
        onClick={() => editable && onIconClick()}
        disabled={!editable}
        title={editable ? "Change icon" : undefined}
        style={{ backgroundColor: color }}
        className={`absolute bottom-2 right-[22%] flex h-9 w-9 items-center justify-center rounded-full text-white ring-4 ring-white ${
          editable ? "cursor-pointer hover:brightness-110" : ""
        }`}
      >
        <ModalIcon name={icon} className="h-5 w-5" />
      </button>
    </div>
  );
}

// ── Hero: open gift box with a floating check ────────────────────────

function GiftBoxHero({
  icon,
  color,
  editable,
  onIconClick,
}: Omit<BadgeHeroProps, "showRipples">) {
  const light = hexToRgba(color, 0.28);
  const mid = hexToRgba(color, 0.45);

  return (
    <div className="relative flex h-[118px] items-end justify-center">
      <svg viewBox="0 0 110 78" className="h-[74px] w-[110px]">
        {/* Box body */}
        <path d="M22 30h66l-6 44a4 4 0 0 1-4 3H32a4 4 0 0 1-4-3L22 30Z" fill={light} />
        {/* Open lid, tilted */}
        <path d="M16 22h78a3 3 0 0 1 3 3v9H13v-9a3 3 0 0 1 3-3Z" fill={mid} />
        {/* Ribbon down the body */}
        <rect x="50" y="34" width="10" height="43" fill={hexToRgba(color, 0.6)} />
      </svg>

      {/* Check badge floating out of the box */}
      <button
        type="button"
        onClick={() => editable && onIconClick()}
        disabled={!editable}
        title={editable ? "Change icon" : undefined}
        style={{ backgroundColor: color }}
        className={`absolute left-1/2 top-0 flex h-[54px] w-[54px] -translate-x-1/2 items-center justify-center rounded-full text-white ${
          editable ? "cursor-pointer hover:brightness-110" : ""
        }`}
      >
        <ModalIcon name={icon} className="h-7 w-7" />
      </button>
    </div>
  );
}

// ── Hero: step progress row ──────────────────────────────────────────

export interface StepperHeroProps {
  steps: { id: string; label: string; done: boolean }[];
  color: string;
  dark: boolean;
  editable: boolean;
  renderLabel: (step: { id: string; label: string }) => React.ReactNode;
  onToggleDone: (id: string) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
}

function StepperHero({
  steps,
  color,
  dark,
  editable,
  renderLabel,
  onToggleDone,
  onRemove,
  onAdd,
}: StepperHeroProps) {
  return (
    <div className="flex w-full items-start justify-center gap-0 pt-1">
      {steps.map((step, index) => (
        <div key={step.id} className="flex flex-1 items-start">
          {/* Connector from the previous marker, drawn at marker height */}
          {index > 0 && (
            <span
              style={{
                backgroundColor: step.done
                  ? hexToRgba(color, 0.55)
                  : dark
                    ? "rgba(255,255,255,0.18)"
                    : "#e4e4e7",
              }}
              className="mt-[17px] h-[2px] flex-1"
            />
          )}
          <div className="group/step relative flex flex-col items-center px-1">
            <button
              type="button"
              onClick={() => editable && onToggleDone(step.id)}
              disabled={!editable}
              title={editable ? "Toggle completed" : undefined}
              style={
                step.done
                  ? { backgroundColor: color }
                  : {
                      borderColor: dark ? "rgba(255,255,255,0.3)" : "#d4d4d8",
                    }
              }
              className={`flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full ${
                step.done
                  ? "text-white"
                  : `border-2 bg-transparent ${
                      dark ? "text-zinc-600" : "text-zinc-300"
                    }`
              } ${editable ? "cursor-pointer hover:brightness-110" : ""}`}
            >
              <ModalIcon name="check" className="h-4 w-4" />
            </button>
            <div
              className={`mt-1.5 max-w-[84px] text-center text-[11px] leading-tight ${
                dark ? "text-zinc-300" : "text-zinc-600"
              }`}
            >
              {renderLabel(step)}
            </div>
            {editable && (
              <button
                type="button"
                onClick={() => onRemove(step.id)}
                title="Remove step"
                aria-label="Remove step"
                className="absolute -left-0.5 -top-1 hidden h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] leading-none text-white shadow group-hover/step:flex"
              >
                ×
              </button>
            )}
          </div>
          {/* Connector onward to the next marker */}
          {index < steps.length - 1 && (
            <span
              style={{
                backgroundColor: steps[index + 1].done
                  ? hexToRgba(color, 0.55)
                  : dark
                    ? "rgba(255,255,255,0.18)"
                    : "#e4e4e7",
              }}
              className="mt-[17px] h-[2px] flex-1"
            />
          )}
        </div>
      ))}
      {editable && (
        <button
          type="button"
          onClick={onAdd}
          title="Add step"
          aria-label="Add step"
          className={`ml-1 mt-[9px] flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-dashed text-[13px] leading-none ${
            dark
              ? "border-white/30 text-zinc-400 hover:border-white/70 hover:text-white"
              : "border-zinc-300 text-zinc-400 hover:border-blue-500 hover:text-blue-600"
          }`}
        >
          +
        </button>
      )}
    </div>
  );
}

// ── Bottom wave ──────────────────────────────────────────────────────

/** Soft layered wave across the foot of the card. */
export function BottomWave({ color }: { color: string }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 select-none overflow-hidden rounded-b-2xl">
      <svg viewBox="0 0 400 90" className="h-[90px] w-full" preserveAspectRatio="none">
        <path
          d="M0 44c60-26 120 18 200 8s140-30 200-6v44H0V44Z"
          fill={hexToRgba(color, 0.1)}
        />
        <path
          d="M0 62c70-22 130 14 210 6s130-24 190-4v30H0V62Z"
          fill={hexToRgba(color, 0.16)}
        />
      </svg>
    </div>
  );
}

// ── Public hero switch ───────────────────────────────────────────────

export interface ModalHeroProps {
  hero: "badge" | "document" | "giftbox" | "stepper" | "none";
  icon: ModalIconKind;
  color: string;
  showRipples: boolean;
  decoration: DecorationKind;
  dark: boolean;
  editable: boolean;
  onIconClick: () => void;
  /** Stepper-only wiring. */
  steps: { id: string; label: string; done: boolean }[];
  renderStepLabel: (step: { id: string; label: string }) => React.ReactNode;
  onToggleStepDone: (id: string) => void;
  onRemoveStep: (id: string) => void;
  onAddStep: () => void;
}

export function ModalHero({
  hero,
  icon,
  color,
  showRipples,
  decoration,
  dark,
  editable,
  onIconClick,
  steps,
  renderStepLabel,
  onToggleStepDone,
  onRemoveStep,
  onAddStep,
}: ModalHeroProps) {
  if (hero === "none") return null;

  if (hero === "stepper") {
    return (
      <div className="relative mb-4 w-full">
        <StepperHero
          steps={steps}
          color={color}
          dark={dark}
          editable={editable}
          renderLabel={renderStepLabel}
          onToggleDone={onToggleStepDone}
          onRemove={onRemoveStep}
          onAdd={onAddStep}
        />
      </div>
    );
  }

  return (
    <div className="relative mb-2 w-full">
      {/* Decorations sit behind the illustration, inset so they frame it */}
      <Decoration kind={decoration} color={color} />
      {hero === "badge" && (
        <BadgeHero
          icon={icon}
          color={color}
          showRipples={showRipples}
          editable={editable}
          onIconClick={onIconClick}
        />
      )}
      {hero === "document" && (
        <DocumentHero
          icon={icon}
          color={color}
          editable={editable}
          onIconClick={onIconClick}
        />
      )}
      {hero === "giftbox" && (
        <GiftBoxHero
          icon={icon}
          color={color}
          editable={editable}
          onIconClick={onIconClick}
        />
      )}
    </div>
  );
}
