"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {
  DEFAULT_FIRST_OUT,
  FIRST_OUT_ICON_KINDS,
  type FirstOutConfig,
  type FirstOutIconKind,
  type FirstOutStepConfig,
} from "./types";

// ── Props ─────────────────────────────────────────────────────────────

interface FirstOutCardProps {
  /** Starting configuration; used on first render if nothing is in storage. */
  defaultConfig?: FirstOutConfig;
  /** Distinct key per instance for localStorage persistence. */
  storageKey?: string;
  /** false locks the widget to view-only mode. */
  editable?: boolean;
  /** Fired whenever the config changes, if the parent wants to observe. */
  onChange?: (config: FirstOutConfig) => void;
}

/**
 * Fully-editable First-Out Analysis widget.
 *
 * - Double-click title, subtitle, initiating badge, step text, and footer note to edit inline.
 * - Single-click the step icon to open the icon picker (11 power system icons).
 * - Click the "+ Step" button in the header to add a new event step.
 * - Hover over a step card to delete it or toggle initiating event status.
 * - All changes persist to localStorage under `storageKey`.
 */
export function FirstOutCard({
  defaultConfig = DEFAULT_FIRST_OUT,
  storageKey = "widget.firstout.v1",
  editable = true,
  onChange,
}: FirstOutCardProps) {
  const [config, setConfig] = useState<FirstOutConfig>(() =>
    loadConfig(storageKey, defaultConfig)
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(config));
    } catch {
      // storage full / disabled — silently skip
    }
    onChange?.(config);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, storageKey]);

  function patch<K extends keyof FirstOutConfig>(
    key: K,
    value: FirstOutConfig[K]
  ) {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }

  function patchStep(id: string, changes: Partial<FirstOutStepConfig>) {
    setConfig((prev) => ({
      ...prev,
      steps: prev.steps.map((s) => (s.id === id ? { ...s, ...changes } : s)),
    }));
  }

  function toggleInitiating(id: string) {
    setConfig((prev) => ({
      ...prev,
      steps: prev.steps.map((s) =>
        s.id === id ? { ...s, initiating: !s.initiating } : s
      ),
    }));
  }

  function addStep() {
    const id = `step-${Date.now().toString(36)}`;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}.${String(
      now.getMilliseconds()
    ).padStart(3, "0")}`;

    setConfig((prev) => ({
      ...prev,
      steps: [
        ...prev.steps,
        {
          id,
          title: "New Event Step",
          meta: "Device / Bay",
          timestamp: timeStr,
          note: "Event description",
          icon: "alert",
          initiating: false,
        },
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

  return (
    <section className="overflow-visible rounded-lg border border-blue-200 bg-white">
      {/* ── Header ── */}
      <header className="group/header relative flex items-center gap-2 border-b border-blue-200 bg-blue-600 px-3 py-2">
        <SectionIcon />

        <div className="flex flex-1 flex-wrap items-baseline gap-1.5 min-w-0">
          <h2 className="text-[13px] font-semibold text-white">
            <Editable
              value={config.title}
              onChange={(v) => patch("title", v || "First-Out Analysis")}
              editable={editable}
              placeholder="First-Out Analysis"
              dark={false}
            />
          </h2>
          <span className="text-[11px] text-blue-100">
            <Editable
              value={config.subtitle}
              onChange={(v) => patch("subtitle", v || "")}
              editable={editable}
              placeholder="(Cascading Event Sequence)"
              dark={false}
            />
          </span>
        </div>

        {/* Add Step Button */}
        {editable && (
          <button
            type="button"
            onClick={addStep}
            title="Add event step"
            aria-label="Add event step"
            className="flex h-6 items-center gap-1 rounded border border-dashed border-white/50 px-2 text-[11px] font-medium text-white hover:border-white hover:bg-white/15 transition-colors"
          >
            <svg
              viewBox="0 0 16 16"
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <line x1="8" y1="2" x2="8" y2="14" />
              <line x1="2" y1="8" x2="14" y2="8" />
            </svg>
            <span>Step</span>
          </button>
        )}

        {/* Reset button — visible on focus-within */}
        {editable && (
          <button
            type="button"
            onClick={reset}
            title="Reset card to defaults"
            className="absolute -bottom-2.5 right-3 rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-semibold text-zinc-600 opacity-0 shadow transition-opacity group-focus-within/header:opacity-100 hover:!opacity-100 hover:bg-white z-10"
          >
            Reset card
          </button>
        )}
      </header>

      {/* ── Body: Sequence Steps ── */}
      <div className="bg-red-50/60 p-3">
        <div className="flex flex-wrap items-stretch gap-2 sm:flex-nowrap overflow-x-auto pb-1">
          {config.steps.map((step, i) => (
            <div key={step.id} className="flex flex-1 min-w-[155px] items-stretch">
              <StepCard
                step={step}
                initiatingBadgeText={config.initiatingBadge}
                editable={editable}
                onChange={(changes) => patchStep(step.id, changes)}
                onToggleInitiating={() => toggleInitiating(step.id)}
                onRemove={() => removeStep(step.id)}
              />

              {/* Arrow connector between steps */}
              {i < config.steps.length - 1 && (
                <div className="flex items-center px-1 text-zinc-400 shrink-0 select-none">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5 text-red-300"
                    fill="currentColor"
                  >
                    <path d="M8 4l8 8-8 8V4z" />
                  </svg>
                </div>
              )}
            </div>
          ))}

          {config.steps.length === 0 && (
            <p className="w-full py-6 text-center text-[11px] text-zinc-400">
              No event steps.{editable ? " Click '+ Step' above to add one." : ""}
            </p>
          )}
        </div>

        {/* ── Footer Note ── */}
        <div className="mt-3">
          <EditableBlock
            value={config.footerNote}
            onChange={(v) => patch("footerNote", v || "")}
            editable={editable}
            placeholder="Footer note explaining first-out root cause analysis"
            className="text-center text-[11px] font-medium text-red-600"
          />
        </div>
      </div>
    </section>
  );
}

// ── Step Card ─────────────────────────────────────────────────────────

interface StepCardProps {
  step: FirstOutStepConfig;
  initiatingBadgeText: string;
  editable: boolean;
  onChange: (changes: Partial<FirstOutStepConfig>) => void;
  onToggleInitiating: () => void;
  onRemove: () => void;
}

function StepCard({
  step,
  initiatingBadgeText,
  editable,
  onChange,
  onToggleInitiating,
  onRemove,
}: StepCardProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement | null>(null);

  // Close icon picker when clicking outside
  useEffect(() => {
    if (!pickerOpen) return;
    function onPointerDown(event: PointerEvent) {
      if (!pickerRef.current?.contains(event.target as Node)) {
        setPickerOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown, true);
    return () =>
      document.removeEventListener("pointerdown", onPointerDown, true);
  }, [pickerOpen]);

  return (
    <div
      className={`group/step relative flex flex-1 flex-col justify-between rounded border bg-white p-2.5 shadow-sm transition-all ${
        step.initiating
          ? "border-red-400 ring-1 ring-red-400/20 shadow-red-100"
          : "border-zinc-200"
      }`}
    >
      {/* Initiating badge & controls */}
      <div className="flex items-center justify-between gap-1 mb-1.5 min-h-[18px]">
        {step.initiating ? (
          <span className="inline-flex items-center rounded bg-red-600 px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-wide text-white">
            {initiatingBadgeText || "FIRST-OUT (INITIATING EVENT)"}
          </span>
        ) : (
          <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-wide">
            Sequence Step
          </span>
        )}

        {/* Action buttons (hover) */}
        {editable && (
          <div className="flex items-center gap-1 opacity-0 group-hover/step:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={onToggleInitiating}
              title={step.initiating ? "Unmark as initiating event" : "Mark as initiating event"}
              className={`rounded px-1 py-0.2 text-[8px] font-bold uppercase transition-colors ${
                step.initiating
                  ? "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  : "bg-red-50 text-red-600 hover:bg-red-100"
              }`}
            >
              {step.initiating ? "Unmark" : "Make First-Out"}
            </button>
            <button
              type="button"
              onClick={onRemove}
              title="Remove step"
              aria-label="Remove step"
              className="flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-white shadow-xs hover:bg-red-700 cursor-pointer"
            >
              <svg
                viewBox="0 0 16 16"
                className="h-2.5 w-2.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <line x1="4" y1="4" x2="12" y2="12" />
                <line x1="12" y1="4" x2="4" y2="12" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Main card row: Icon + Details */}
      <div className="flex items-start gap-2">
        {/* Icon button */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={(e) => {
              if (!editable || e.detail > 1) return;
              setPickerOpen((v) => !v);
            }}
            disabled={!editable}
            title={editable ? "Click to change step icon" : undefined}
            className={
              editable
                ? "cursor-pointer rounded p-0.5 hover:bg-zinc-100 transition-colors"
                : "cursor-default"
            }
          >
            <FirstOutIconGlyph kind={step.icon} />
          </button>

          {/* Icon picker dropdown */}
          {pickerOpen && (
            <div
              ref={pickerRef}
              style={{ width: 210 }}
              className="absolute left-0 top-full z-[200] mt-1 rounded-md border border-zinc-200 bg-white p-2 shadow-xl"
            >
              <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-wide text-zinc-400">
                Choose Step Icon
              </p>
              <div className="grid grid-cols-4 gap-1.5">
                {FIRST_OUT_ICON_KINDS.map((kind) => (
                  <button
                    key={kind}
                    type="button"
                    onClick={() => {
                      onChange({ icon: kind });
                      setPickerOpen(false);
                    }}
                    title={kind}
                    className={`flex items-center justify-center rounded p-1 transition-all ${
                      kind === step.icon
                        ? "bg-blue-600 ring-2 ring-blue-400"
                        : "hover:bg-zinc-100"
                    }`}
                  >
                    <FirstOutIconGlyph kind={kind} mini />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Text Fields */}
        <div className="min-w-0 flex-1 leading-tight space-y-0.5">
          <EditableBlock
            value={step.title}
            onChange={(v) => onChange({ title: v || "Step Title" })}
            editable={editable}
            placeholder="Step title"
            className="text-[12px] font-semibold text-zinc-800"
          />
          <EditableBlock
            value={step.meta}
            onChange={(v) => onChange({ meta: v || "Location / Meta" })}
            editable={editable}
            placeholder="Meta info"
            className="text-[10px] text-zinc-500"
          />
          <EditableBlock
            value={step.timestamp}
            onChange={(v) => onChange({ timestamp: v || "00:00:00.000" })}
            editable={editable}
            placeholder="Timestamp"
            className="text-[10.5px] font-semibold text-blue-700"
          />
          <EditableBlock
            value={step.note}
            onChange={(v) => onChange({ note: v || "Note" })}
            editable={editable}
            placeholder="Note"
            className="text-[10px] text-zinc-500"
          />
        </div>
      </div>
    </div>
  );
}

// ── EditableBlock ─────────────────────────────────────────────────────

interface EditableBlockProps {
  value: string;
  onChange: (value: string) => void;
  editable: boolean;
  placeholder: string;
  className: string;
}

function EditableBlock({
  value,
  onChange,
  editable,
  placeholder,
  className,
}: EditableBlockProps) {
  const [session, setSession] = useState<number | null>(null);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const committed = useRef(false);
  const editing = session !== null;

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      // Caret at the end — select-all lets the first keystroke wipe the text.
      const caret = inputRef.current;
      if (caret) caret.setSelectionRange(caret.value.length, caret.value.length);
    }
  }, [editing]);

  function startEdit(e: React.MouseEvent) {
    if (!editable || e.detail < 2) return;
    e.stopPropagation();
    e.preventDefault();
    committed.current = false;
    setDraft(value);
    setSession(Date.now());
  }

  function commit() {
    if (committed.current) return;
    committed.current = true;
    setSession(null);
    if (draft !== value) onChange(draft);
  }

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      commit();
    } else if (e.key === "Escape") {
      committed.current = true;
      setSession(null);
    }
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={onKey}
        placeholder={placeholder}
        className={`${className} w-full rounded border border-zinc-300 bg-white px-1 outline-none focus:border-blue-500`}
      />
    );
  }

  return (
    <div
      onClick={startEdit}
      title={editable ? "Double-click to edit" : undefined}
      className={`${className} w-full select-none rounded px-0.5 ${
        editable ? "cursor-text hover:bg-zinc-100/80" : ""
      }`}
    >
      {value || <span className="italic opacity-50">{placeholder}</span>}
    </div>
  );
}

// ── Editable Inline (for glass/header) ────────────────────────────────

interface EditableProps {
  value: string;
  onChange: (value: string) => void;
  editable?: boolean;
  placeholder?: string;
  dark?: boolean;
}

function Editable({
  value,
  onChange,
  editable = true,
  placeholder,
  dark = false,
}: EditableProps) {
  const [session, setSession] = useState<number | null>(null);

  if (!editable) {
    return <span>{value || placeholder}</span>;
  }

  if (session !== null) {
    return (
      <EditableInput
        key={session}
        initial={value}
        placeholder={placeholder}
        dark={dark}
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
      onDoubleClick={(event) => {
        event.stopPropagation();
        setSession(Date.now());
      }}
      title="Double-click to edit"
      className={`cursor-text rounded px-0.5 ${
        dark ? "hover:bg-zinc-100" : "hover:bg-white/20"
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
  onCommit: (value: string) => void;
  onCancel: () => void;
}

function EditableInput({
  initial,
  placeholder,
  dark,
  onCommit,
  onCancel,
}: EditableInputProps) {
  const [draft, setDraft] = useState(initial);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const committed = useRef(false);

  useEffect(() => {
    inputRef.current?.focus();
    // Caret at the end — select-all lets the first keystroke wipe the text.
    const caret = inputRef.current;
    if (caret) caret.setSelectionRange(caret.value.length, caret.value.length);
  }, []);

  function commit() {
    if (committed.current) return;
    committed.current = true;
    onCommit(draft);
  }

  function onKey(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      commit();
    } else if (event.key === "Escape") {
      event.preventDefault();
      committed.current = true;
      onCancel();
    }
  }

  return (
    <input
      ref={inputRef}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={onKey}
      placeholder={placeholder}
      className={`rounded border px-1 text-inherit outline-none ${
        dark
          ? "border-zinc-300 bg-white focus:border-blue-500"
          : "border-white/40 bg-white/10 focus:border-white"
      }`}
      style={{ width: `${Math.max(draft.length + 1, 4)}ch` }}
    />
  );
}

// ── Header Section Icon ───────────────────────────────────────────────

function SectionIcon() {
  return (
    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-white/20 text-white">
      <svg
        viewBox="0 0 24 24"
        className="h-3 w-3"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor" />
      </svg>
    </div>
  );
}

// ── First-Out Icon Glyph Renderer ─────────────────────────────────────

export function FirstOutIconGlyph({
  kind,
  mini = false,
}: {
  kind: FirstOutIconKind;
  mini?: boolean;
}) {
  const size = mini ? "h-6 w-6" : "h-7 w-7";
  const iconSize = mini ? "h-3.5 w-3.5" : "h-4 w-4";

  const base = {
    fill: "none" as const,
    stroke: "currentColor" as const,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    viewBox: "0 0 24 24",
  };

  switch (kind) {
    case "bolt-red":
      return (
        <div className={`flex ${size} items-center justify-center rounded-lg bg-red-100 text-red-600`}>
          <svg viewBox="0 0 24 24" fill="currentColor" className={iconSize}>
            <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
          </svg>
        </div>
      );

    case "bolt-amber":
      return (
        <div className={`flex ${size} items-center justify-center rounded-lg bg-amber-100 text-amber-600`}>
          <svg viewBox="0 0 24 24" fill="currentColor" className={iconSize}>
            <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
          </svg>
        </div>
      );

    case "gear":
      return (
        <div className={`flex ${size} items-center justify-center rounded-lg bg-blue-100 text-blue-600`}>
          <svg {...base} strokeWidth={1.8} className={iconSize}>
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
          </svg>
        </div>
      );

    case "lock":
      return (
        <div className={`flex ${size} items-center justify-center rounded-lg bg-zinc-100 text-zinc-600`}>
          <svg {...base} strokeWidth={1.8} className={iconSize}>
            <rect x="5" y="11" width="14" height="10" rx="1.5" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
        </div>
      );

    case "tower":
      return (
        <div className={`flex ${size} items-center justify-center rounded-lg bg-purple-100 text-purple-600`}>
          <svg {...base} strokeWidth={1.8} className={iconSize}>
            <path d="M6 21 12 3l6 18" />
            <path d="M8 15h8" />
            <path d="M9 11h6" />
            <path d="M10 7h4" />
          </svg>
        </div>
      );

    case "alert":
      return (
        <div className={`flex ${size} items-center justify-center rounded-lg bg-red-100 text-red-600`}>
          <svg {...base} strokeWidth={2} className={iconSize}>
            <path d="M12 3 2 20h20L12 3Z" />
            <line x1="12" y1="10" x2="12" y2="14" />
            <circle cx="12" cy="17" r="0.5" fill="currentColor" />
          </svg>
        </div>
      );

    case "relay":
      return (
        <div className={`flex ${size} items-center justify-center rounded-lg bg-amber-100 text-amber-700`}>
          <svg {...base} strokeWidth={1.8} className={iconSize}>
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="12" r="3" />
            <line x1="9" y1="12" x2="15" y2="7" />
          </svg>
        </div>
      );

    case "breaker":
      return (
        <div className={`flex ${size} items-center justify-center rounded-lg bg-orange-100 text-orange-600`}>
          <svg {...base} strokeWidth={1.8} className={iconSize}>
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <line x1="9" y1="9" x2="9" y2="15" />
            <line x1="15" y1="9" x2="15" y2="15" />
            <line x1="9" y1="12" x2="15" y2="12" />
          </svg>
        </div>
      );

    case "feeder":
      return (
        <div className={`flex ${size} items-center justify-center rounded-lg bg-teal-100 text-teal-600`}>
          <svg {...base} strokeWidth={1.8} className={iconSize}>
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </div>
      );

    case "transformer":
      return (
        <div className={`flex ${size} items-center justify-center rounded-lg bg-indigo-100 text-indigo-600`}>
          <svg {...base} strokeWidth={1.8} className={iconSize}>
            <circle cx="9" cy="12" r="5" />
            <circle cx="15" cy="12" r="5" />
          </svg>
        </div>
      );

    case "restoration":
      return (
        <div className={`flex ${size} items-center justify-center rounded-lg bg-emerald-100 text-emerald-600`}>
          <svg {...base} strokeWidth={1.8} className={iconSize}>
            <path d="M4 4v6h6" />
            <path d="M20 20v-6h-6" />
            <path d="M5 14a8 8 0 0 0 14 4" />
            <path d="M19 10a8 8 0 0 0-14-4" />
          </svg>
        </div>
      );
  }
}

// ── localStorage helper ───────────────────────────────────────────────

function loadConfig(
  key: string,
  fallback: FirstOutConfig
): FirstOutConfig {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = window.localStorage.getItem(key);
    if (!stored) return fallback;
    const parsed = JSON.parse(stored) as Partial<FirstOutConfig>;
    return { ...fallback, ...parsed };
  } catch {
    return fallback;
  }
}
