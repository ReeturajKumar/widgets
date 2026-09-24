"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { DEFAULT_PAGE_HEADER, type PageHeaderConfig } from "./types";

interface PageHeaderProps {
  defaultConfig?: PageHeaderConfig;
  storageKey?: string;
  editable?: boolean;
  onChange?: (config: PageHeaderConfig) => void;
}

/**
 * Editable breadcrumb + page title + scope tags + Live-Data button.
 *
 * Sits directly under the NavBar. Everything renders from `config`, and every
 * text is inline-editable via double-click (Enter/blur saves, Escape reverts).
 * Breadcrumbs and scope tags can be added, edited, and removed; the Live-Data
 * button can be hidden. State persists to localStorage under `storageKey`.
 */
export function PageHeader({
  defaultConfig = DEFAULT_PAGE_HEADER,
  storageKey = "widget.pageheader.v1",
  editable = true,
  onChange,
}: PageHeaderProps) {
  const [config, setConfig] = useState<PageHeaderConfig>(() =>
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

  function patch<K extends keyof PageHeaderConfig>(
    key: K,
    value: PageHeaderConfig[K]
  ) {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }

  function patchList(
    key: "breadcrumb" | "scopeTags",
    updater: (list: string[]) => string[]
  ) {
    setConfig((prev) => ({ ...prev, [key]: updater(prev[key]) }));
  }

  return (
    <div className="border-b border-zinc-200 bg-white">
      {/* Breadcrumb row */}
      <div className="flex items-center gap-1 px-4 py-1 text-[11px] text-blue-600">
        {config.breadcrumb.map((crumb, index) => {
          const last = index === config.breadcrumb.length - 1;
          return (
            <span
              key={`${index}-${crumb}`}
              className="group/crumb relative flex items-center gap-1"
            >
              {index > 0 && <span className="text-zinc-400">›</span>}
              <span
                className={
                  last
                    ? "font-semibold text-zinc-800"
                    : "text-blue-600 hover:underline"
                }
              >
                <Editable
                  value={crumb}
                  onChange={(v) =>
                    patchList("breadcrumb", (list) =>
                      list.map((c, i) => (i === index ? v || "…" : c))
                    )
                  }
                  editable={editable}
                />
              </span>
              {editable && (
                <button
                  type="button"
                  onClick={() =>
                    patchList("breadcrumb", (list) =>
                      list.filter((_, i) => i !== index)
                    )
                  }
                  title="Remove breadcrumb"
                  aria-label="Remove breadcrumb"
                  className="hidden h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[8px] leading-none text-white group-hover/crumb:flex"
                >
                  ×
                </button>
              )}
            </span>
          );
        })}
        {editable && (
          <button
            type="button"
            onClick={() =>
              patchList("breadcrumb", (list) => [...list, "New"])
            }
            title="Add breadcrumb"
            aria-label="Add breadcrumb"
            className="ml-1 flex h-4 w-4 items-center justify-center rounded border border-dashed border-zinc-300 text-[10px] text-zinc-400 hover:border-blue-500 hover:text-blue-600"
          >
            +
          </button>
        )}
      </div>

      {/* Title row */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 px-4 pb-1.5 pt-0.5">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0">
          <h1 className="text-[15px] font-extrabold tracking-wide text-red-600">
            <Editable
              value={config.title}
              onChange={(v) => patch("title", v || "Untitled")}
              editable={editable}
              dark
            />
          </h1>
          <p className="text-[12px] text-zinc-600">
            <Editable
              value={config.subtitle}
              onChange={(v) => patch("subtitle", v)}
              editable={editable}
              dark
              placeholder="Subtitle"
            />
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Scope tags */}
          <div className="flex items-center gap-1 text-[11px] font-medium text-zinc-600">
            {config.scopeTags.map((tag, index) => (
              <span
                key={`${index}-${tag}`}
                className="group/tag relative flex items-center gap-1"
              >
                {index > 0 && <span className="text-zinc-400">|</span>}
                <span className="flex items-center gap-0.5">
                  <Editable
                    value={tag}
                    onChange={(v) =>
                      patchList("scopeTags", (list) =>
                        list.map((c, i) => (i === index ? v || "…" : c))
                      )
                    }
                    editable={editable}
                    dark
                  />
                  {editable && (
                    <button
                      type="button"
                      onClick={() =>
                        patchList("scopeTags", (list) =>
                          list.filter((_, i) => i !== index)
                        )
                      }
                      title="Remove tag"
                      aria-label="Remove tag"
                      className="hidden h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[8px] leading-none text-white group-hover/tag:flex"
                    >
                      ×
                    </button>
                  )}
                </span>
              </span>
            ))}
            {editable && (
              <button
                type="button"
                onClick={() =>
                  patchList("scopeTags", (list) => [...list, "New tag"])
                }
                title="Add scope tag"
                aria-label="Add scope tag"
                className="ml-1 flex h-4 w-4 items-center justify-center rounded border border-dashed border-zinc-300 text-[10px] text-zinc-400 hover:border-blue-500 hover:text-blue-600"
              >
                +
              </button>
            )}
          </div>

          {/* Live Data button */}
          {config.showLiveData ? (
            <div className="group/live relative">
              <button
                type="button"
                className="rounded bg-emerald-600 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow hover:bg-emerald-700"
              >
                <Editable
                  value={config.liveDataLabel}
                  onChange={(v) => patch("liveDataLabel", v || "Live")}
                  editable={editable}
                />
              </button>
              {editable && (
                <button
                  type="button"
                  onClick={() => patch("showLiveData", false)}
                  title="Hide button"
                  aria-label="Hide Live Data button"
                  className="absolute -left-1 -top-1 hidden h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[9px] leading-none text-white group-hover/live:flex"
                >
                  ×
                </button>
              )}
            </div>
          ) : (
            editable && (
              <button
                type="button"
                onClick={() => patch("showLiveData", true)}
                className="rounded border border-dashed border-zinc-300 px-2 py-1 text-[10px] text-zinc-500 hover:border-emerald-500 hover:text-emerald-600"
              >
                + Live Data
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}

// ── Inline editable span ──────────────────────────────────────────────

interface EditableProps {
  value: string;
  onChange: (value: string) => void;
  editable: boolean;
  placeholder?: string;
  /** Use dark-friendly hover treatment (this widget sits on a light bg). */
  dark?: boolean;
}

function Editable({
  value,
  onChange,
  editable,
  placeholder,
  dark = false,
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
        dark ? "hover:bg-blue-100" : "hover:bg-white/15"
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

// ── Storage helper ────────────────────────────────────────────────────

function loadConfig(key: string, fallback: PageHeaderConfig): PageHeaderConfig {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<PageHeaderConfig>;
    return { ...fallback, ...parsed };
  } catch {
    return fallback;
  }
}
