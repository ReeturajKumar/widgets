"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

interface BlockedModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  buttonText?: string;
  onConfirm?: () => void;
}

/**
 * Account blocked warning modal matching the inspiration design:
 * - Floating concentric red ripple "✕" badge at top
 * - Sleek dark card with warm ambient glow matching app theme
 * - Clear warning text and seamless dismissal
 */
export function BlockedModal({
  open,
  onClose,
  title = "Account blocked!",
  message = "Your account is temporarily blocked. We will unlock it in 24 hours. If you forget your password, you will have 24 hours to recover it",
  buttonText,
  onConfirm,
}: BlockedModalProps) {
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
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="relative flex w-full max-w-[280px] flex-col items-center rounded-2xl border border-white/10 bg-gradient-to-b from-[#242427] via-[#1c1c1f] to-[#351e15] px-6 pb-6 pt-12 text-center shadow-2xl shadow-black/80"
      >
        {/* Subtle Close button in top right */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3.5 top-3.5 flex h-6 w-6 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-white/10 hover:text-zinc-300"
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

        {/* Floating Top Badge with Concentric Red Ripple Rings */}
        <div className="absolute -top-11 left-1/2 flex -translate-x-1/2 items-center justify-center pointer-events-none select-none">
          {/* Outermost soft red ring */}
          <div className="absolute h-26 w-26 rounded-full bg-red-500/10 blur-[1px]" />
          {/* Middle translucent ripple ring */}
          <div className="absolute h-21 w-21 rounded-full bg-red-500/20" />
          {/* Inner vibrant red cross badge */}
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[#ff5252] shadow-lg shadow-red-500/35">
            <svg
              viewBox="0 0 24 24"
              className="h-8 w-8 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-lg font-bold tracking-tight text-white">
          {title}
        </h2>

        {/* Message */}
        <p className="mt-2 max-w-[210px] text-xs leading-relaxed text-zinc-400">
          {message}
        </p>

        {/* Optional Pill Action Button if passed */}
        {buttonText && (
          <button
            type="button"
            onClick={() => {
              onConfirm?.();
              onClose();
            }}
            className="mt-6 w-full rounded-full bg-[#f06126] py-2.5 px-4 text-xs font-semibold text-white shadow-md shadow-orange-950/40 transition-all hover:bg-[#ea580c] hover:brightness-105 active:scale-[0.98]"
          >
            {buttonText}
          </button>
        )}
      </div>
    </div>,
    document.body
  );
}
