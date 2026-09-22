"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** Icon shown above the title — usually a coloured circle with a glyph. */
  icon?: ReactNode;
  title: string;
  /** Body text, or any custom node the caller wants inside the card. */
  children?: ReactNode;
  /** Action row at the foot of the card. Buttons flow right-to-left. */
  actions?: ReactNode;
}

/**
 * Shared shell for every popup modal.
 *
 * Rendered via a portal so the backdrop covers the whole viewport rather than
 * being clipped by the sidebar the trigger button lives in. Dismisses on
 * backdrop click, on the close button, and on Escape — every popup does all
 * three, so the shell owns them.
 */
export function Modal({
  open,
  onClose,
  icon,
  title,
  children,
  actions,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    // Stop the underlying page from scrolling behind the modal.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        // Stop clicks inside the card from reaching the backdrop's onClose.
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
        >
          <svg viewBox="0 0 14 14" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="1" y1="1" x2="13" y2="13" />
            <line x1="13" y1="1" x2="1" y2="13" />
          </svg>
        </button>

        <div className="flex flex-col items-center gap-3 px-6 pb-2 pt-8 text-center">
          {icon}
          <h2 className="text-base font-semibold text-zinc-800">{title}</h2>
          {children && (
            <div className="text-sm leading-relaxed text-zinc-600">
              {children}
            </div>
          )}
        </div>

        {actions && (
          <div className="flex justify-end gap-2 border-t border-zinc-100 bg-zinc-50 px-4 py-3">
            {actions}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
