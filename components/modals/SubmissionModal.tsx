"use client";

import { Modal } from "../Modal";

interface SubmissionModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm?: () => void;
}

/**
 * Submission-confirmation popup. Two actions — Cancel dismisses, Submit runs
 * the caller's `onConfirm` and then closes. Defaulting `onConfirm` to `onClose`
 * keeps the popup usable as a preview from the sidebar with no wiring.
 */
export function SubmissionModal({ open, onClose, onConfirm }: SubmissionModalProps) {
  function handleConfirm() {
    onConfirm?.();
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon={
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600">
          <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
        </div>
      }
      title="Submit for review?"
      actions={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-zinc-300 bg-white px-4 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Submit
          </button>
        </>
      }
    >
      Once submitted, your entry will be sent for review and can no longer be
      edited.
    </Modal>
  );
}
