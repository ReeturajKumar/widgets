"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { LogoutIcon, NavIconGlyph } from "../../icons";
import {
  AVAILABLE_ICONS,
  DEFAULT_NAVBAR,
  type NavBarConfig,
  type NavItemConfig,
} from "./types";

interface NavBarProps {
  /** Starting configuration; used only on first render if nothing is in storage. */
  defaultConfig?: NavBarConfig;
  /** Distinct key per NavBar instance — lets two NavBars on the same board keep separate state. */
  storageKey?: string;
  /** false locks the widget to view mode. */
  editable?: boolean;
  /** Fired whenever the config changes, if the parent wants to observe. */
  onChange?: (config: NavBarConfig) => void;
}

/**
 * Fully-editable AUTRIXA-style top navigation widget.
 *
 * Every string, badge and nav item is editable inline (double-click to edit,
 * Enter/blur to save, Escape to revert). Nav items can be added, removed and
 * have their icon swapped. State persists to localStorage under `storageKey`
 * so a page reload restores the last edits.
 */
export function NavBar({
  defaultConfig = DEFAULT_NAVBAR,
  storageKey = "widget.navbar.v1",
  editable = true,
  onChange,
}: NavBarProps) {
  const [config, setConfig] = useState<NavBarConfig>(() => loadConfig(storageKey, defaultConfig));

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(config));
    } catch {
      // storage full / disabled — silently skip
    }
    onChange?.(config);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, storageKey]);

  function patch<K extends keyof NavBarConfig>(key: K, value: NavBarConfig[K]) {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }

  function patchItem(id: string, changes: Partial<NavItemConfig>) {
    setConfig((prev) => ({
      ...prev,
      navItems: prev.navItems.map((item) =>
        item.id === id ? { ...item, ...changes } : item
      ),
    }));
  }

  function addItem() {
    const id = `item-${Date.now().toString(36)}`;
    setConfig((prev) => ({
      ...prev,
      navItems: [...prev.navItems, { id, label: "New", icon: "events" }],
    }));
  }

  function removeItem(id: string) {
    setConfig((prev) => ({
      ...prev,
      navItems: prev.navItems.filter((item) => item.id !== id),
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
    <header className="relative z-40 flex h-16 items-stretch overflow-visible bg-gradient-to-r from-[#1e3a8a] via-[#1e40af] to-[#1e3a8a] text-white">
      {/* Brand block */}
      <div className="flex items-center gap-2 px-5">
        <div className="flex flex-col leading-tight">
          <span className="text-xl font-bold tracking-wide">
            <Editable
              value={config.brand}
              onChange={(v) => patch("brand", v)}
              editable={editable}
            />
            {(editable || config.brandSuperscript) && (
              <sup className="ml-0.5 text-[9px] font-normal">
                <Editable
                  value={config.brandSuperscript ?? ""}
                  onChange={(v) => patch("brandSuperscript", v || undefined)}
                  editable={editable}
                  placeholder="TM"
                />
              </sup>
            )}
          </span>
          <span className="text-[10px] text-blue-200">
            <Editable
              value={config.brandSubtitle}
              onChange={(v) => patch("brandSubtitle", v)}
              editable={editable}
            />
          </span>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex flex-1 items-stretch justify-center gap-2 overflow-visible">
        {config.navItems.map((item) => (
          <NavButton
            key={item.id}
            item={item}
            editable={editable}
            onChange={(changes) => patchItem(item.id, changes)}
            onRemove={() => removeItem(item.id)}
          />
        ))}
        {editable && (
          <button
            type="button"
            onClick={addItem}
            title="Add nav item"
            aria-label="Add nav item"
            className="my-auto ml-2 flex h-8 w-8 items-center justify-center rounded border border-dashed border-blue-300/70 text-blue-100 hover:border-white hover:text-white"
          >
            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="8" y1="2" x2="8" y2="14" />
              <line x1="2" y1="8" x2="14" y2="8" />
            </svg>
          </button>
        )}
      </nav>

      {/* Right side — date, operator, logout, partner brand */}
      <div className="flex items-center gap-4 px-4 text-[11px]">
        <div className="text-right leading-tight">
          <div className="text-[13px] font-medium">
            <Editable
              value={config.dateTime}
              onChange={(v) => patch("dateTime", v)}
              editable={editable}
            />
          </div>
          <div className="text-blue-200">
            <Editable
              value={config.operatorLabel}
              onChange={(v) => patch("operatorLabel", v)}
              editable={editable}
            />
            {" : "}
            <Editable
              value={config.operatorValue}
              onChange={(v) => patch("operatorValue", v)}
              editable={editable}
            />
          </div>
        </div>

        {config.showLogout && (
          <div className="group relative flex flex-col items-center gap-0.5 text-blue-100 hover:text-white">
            <LogoutIcon className="h-5 w-5" />
            <span className="text-[10px]">
              <Editable
                value={config.logoutLabel}
                onChange={(v) => patch("logoutLabel", v)}
                editable={editable}
              />
            </span>
            {editable && (
              <button
                type="button"
                onClick={() => patch("showLogout", false)}
                title="Hide logout"
                aria-label="Hide logout"
                className="absolute -left-1 -top-1 hidden h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[9px] leading-none text-white group-hover:flex"
              >
                ×
              </button>
            )}
          </div>
        )}
        {editable && !config.showLogout && (
          <button
            type="button"
            onClick={() => patch("showLogout", true)}
            className="rounded border border-dashed border-blue-300/70 px-1.5 py-1 text-[10px] text-blue-100 hover:border-white hover:text-white"
          >
            + Logout
          </button>
        )}

        <div className="flex flex-col items-end leading-tight border-l border-blue-700 pl-4">
          <span className="text-base font-bold text-white">
            <Editable
              value={config.partnerBrand}
              onChange={(v) => patch("partnerBrand", v)}
              editable={editable}
            />
          </span>
          <span className="text-[10px] text-blue-200">
            <Editable
              value={config.partnerTagline}
              onChange={(v) => patch("partnerTagline", v)}
              editable={editable}
            />
          </span>
        </div>
      </div>

      {editable && (
        <button
          type="button"
          onClick={reset}
          title="Reset navbar to defaults"
          className="absolute -bottom-2 right-4 rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-semibold text-zinc-600 opacity-0 shadow transition-opacity hover:bg-white group-focus-within:opacity-100"
        >
          Reset navbar
        </button>
      )}
    </header>
  );
}

// ── Individual nav item (icon + label + optional badge + edit controls) ──

interface NavButtonProps {
  item: NavItemConfig;
  editable: boolean;
  onChange: (changes: Partial<NavItemConfig>) => void;
  onRemove: () => void;
}

function NavButton({ item, editable, onChange, onRemove }: NavButtonProps) {
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!iconPickerOpen) return;
    function onPointerDown(event: PointerEvent) {
      if (!pickerRef.current?.contains(event.target as Node)) {
        setIconPickerOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [iconPickerOpen]);

  const showBadge = editable || (item.badge && item.badge.length > 0);

  return (
    <div className={`group/nav relative flex overflow-visible ${iconPickerOpen ? "z-50" : ""}`}>
      <div className={`relative flex w-20 flex-col items-center justify-center gap-0.5 px-2 text-[11px] font-medium text-blue-100 hover:bg-blue-800 overflow-visible ${iconPickerOpen ? "bg-blue-800" : ""}`}>
        <button
          type="button"
          onClick={() => editable && setIconPickerOpen((v) => !v)}
          disabled={!editable}
          title={editable ? "Change icon" : undefined}
          className={editable ? "cursor-pointer rounded p-0.5 hover:bg-white/15" : ""}
        >
          <NavIconGlyph name={item.icon} className="h-5 w-5" />
        </button>
        <Editable
          value={item.label}
          onChange={(v) => onChange({ label: v || "Item" })}
          editable={editable}
        />
        {showBadge && (
          <span
            className={`absolute right-1 top-1 z-20 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] font-bold text-white ${
              item.badge && item.badge.length > 0
                ? "bg-red-500"
                : editable
                  ? "border border-dashed border-red-300 text-red-200"
                  : ""
            }`}
          >
            <Editable
              value={item.badge ?? ""}
              onChange={(v) => onChange({ badge: v })}
              editable={editable}
              placeholder="0"
              minWidth={1}
            />
          </span>
        )}
      </div>

      {editable && (
        <button
          type="button"
          onClick={onRemove}
          title="Remove nav item"
          aria-label="Remove nav item"
          // Top-LEFT corner so it can never overlap the top-RIGHT badge, and
          // z-30 so it sits over both the icon and the picker's back-arrow.
          className="absolute -left-1 -top-1 z-30 hidden h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] leading-none text-white shadow group-hover/nav:flex"
        >
          ×
        </button>
      )}

      {iconPickerOpen && (
        <div
          ref={pickerRef}
          style={{ width: 176 }}
          className="absolute left-1/2 top-full z-[999999] mt-1.5 -translate-x-1/2 rounded-lg border border-zinc-200/90 bg-white p-2 text-zinc-700 shadow-2xl ring-1 ring-black/10"
        >
          <div className="grid grid-cols-4 gap-1.5">
            {AVAILABLE_ICONS.map((icon) => (
              <button
                key={icon}
                type="button"
                onClick={() => {
                  onChange({ icon });
                  setIconPickerOpen(false);
                }}
                title={icon}
                className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
                  icon === item.icon
                    ? "bg-blue-600 text-white shadow-xs"
                    : "hover:bg-blue-50 text-zinc-700 hover:text-blue-600"
                }`}
              >
                <NavIconGlyph name={icon} className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Inline editable span ──────────────────────────────────────────────

interface EditableProps {
  value: string;
  onChange: (value: string) => void;
  editable: boolean;
  placeholder?: string;
  /** Minimum input width, in characters. */
  minWidth?: number;
}

function Editable({
  value,
  onChange,
  editable,
  placeholder,
  minWidth = 3,
}: EditableProps) {
  const [session, setSession] = useState<number | null>(null);
  const editing = session !== null;

  if (!editable) {
    return <>{value || placeholder}</>;
  }

  if (editing) {
    return (
      <EditableInput
        key={session}
        initial={value}
        placeholder={placeholder}
        minWidth={minWidth}
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
      className={`cursor-text rounded px-0.5 hover:bg-white/15 ${
        !value ? "italic opacity-60" : ""
      }`}
    >
      {value || placeholder || " "}
    </span>
  );
}

interface EditableInputProps {
  initial: string;
  placeholder?: string;
  minWidth: number;
  onCommit: (value: string) => void;
  onCancel: () => void;
}

/** Isolated editing session — mounted per edit, so state can't drift with props. */
function EditableInput({
  initial,
  placeholder,
  minWidth,
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
      className="rounded border border-white/40 bg-white/10 px-1 text-inherit outline-none focus:border-white"
      style={{ width: `${Math.max(draft.length + 1, minWidth)}ch` }}
    />
  );
}

// ── localStorage helpers ──────────────────────────────────────────────

function loadConfig(key: string, fallback: NavBarConfig): NavBarConfig {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = window.localStorage.getItem(key);
    if (!stored) return fallback;
    const parsed = JSON.parse(stored) as Partial<NavBarConfig>;
    // Merge shallowly so a stored config missing new fields still boots.
    return { ...fallback, ...parsed };
  } catch {
    return fallback;
  }
}
