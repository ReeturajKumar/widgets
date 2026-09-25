"use client";

// Custom icon images — local uploads and image URLs — for the icon pickers.
//
// This sits *alongside* the built-in icon kinds rather than replacing them:
// each config gains an optional `iconImage`, and whenever it is set the widget
// renders that image instead of the glyph. Clearing it falls straight back to
// the `icon` kind, which is left untouched throughout.

import { useRef, useState } from "react";

/** The only upload formats accepted, per the file input and the validator. */
export const ACCEPTED_IMAGE_TYPES = ".png,.jpg,.jpeg";
const ACCEPTED_MIME = ["image/png", "image/jpeg"];

/** Refuse anything implausible before it ever reaches the FileReader. */
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

/**
 * Icons render at roughly 20px, so anything larger is wasted bytes.
 *
 * This matters more than it looks: these configs are persisted to
 * localStorage, and a single un-scaled phone photo as a data URL would exceed
 * the ~5MB quota on its own. The widgets swallow quota errors when saving, so
 * the failure would be silent — the icon would appear to work until reload.
 */
const MAX_DIMENSION = 128;

export class IconImageError extends Error {}

/**
 * Reads a local file into a downscaled data URL.
 *
 * PNGs stay PNG to preserve transparency; everything else is re-encoded as
 * JPEG, which is far smaller for photographs.
 */
export async function readImageFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  const extensionOk = /\.(png|jpe?g)$/.test(name);
  if (!extensionOk || !ACCEPTED_MIME.includes(file.type)) {
    throw new IconImageError("Only .png, .jpg and .jpeg files are supported.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new IconImageError("That image is too large (8 MB maximum).");
  }

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new IconImageError("Could not read that file."));
    reader.readAsDataURL(file);
  });

  return downscale(dataUrl, file.type === "image/png");
}

function downscale(dataUrl: string, keepPng: boolean): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const largest = Math.max(image.width, image.height);
      if (largest <= MAX_DIMENSION) {
        resolve(dataUrl);
        return;
      }
      const ratio = MAX_DIMENSION / largest;
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(image.width * ratio);
      canvas.height = Math.round(image.height * ratio);
      const context = canvas.getContext("2d");
      if (!context) {
        // No 2D context is unusual but not fatal — keep the original.
        resolve(dataUrl);
        return;
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(
        keepPng
          ? canvas.toDataURL("image/png")
          : canvas.toDataURL("image/jpeg", 0.85)
      );
    };
    image.onerror = () =>
      reject(new IconImageError("That file is not a readable image."));
    image.src = dataUrl;
  });
}

/** Accepts http(s) and data URLs; anything else is rejected rather than set. */
export function normalizeImageUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) throw new IconImageError("Enter an image URL.");
  if (/^data:image\//i.test(trimmed)) return trimmed;
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new IconImageError("That does not look like a valid URL.");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new IconImageError("Only http and https URLs are supported.");
  }
  return parsed.toString();
}

// ── UI ────────────────────────────────────────────────────────────────

export interface IconImageControlsProps {
  /** The image currently in use, if any. */
  value?: string;
  /** Called with a data URL or a remote URL, or null to go back to the glyph. */
  onChange: (image: string | null) => void;
  /** Closes the surrounding popover after a successful choice. */
  onDone?: () => void;
}

/**
 * The "Custom image" half of an icon picker: an upload button, a URL field,
 * and a Remove action once an image is in use.
 */
export function IconImageControls({
  value,
  onChange,
  onDone,
}: IconImageControlsProps) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    try {
      onChange(await readImageFile(file));
      onDone?.();
    } catch (cause) {
      setError(
        cause instanceof IconImageError ? cause.message : "Could not use that image."
      );
    }
  }

  function applyUrl() {
    setError(null);
    try {
      onChange(normalizeImageUrl(url));
      setUrl("");
      onDone?.();
    } catch (cause) {
      setError(
        cause instanceof IconImageError ? cause.message : "Could not use that URL."
      );
    }
  }

  return (
    <div className="mt-2 border-t border-zinc-100 pt-2">
      <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-wide text-zinc-400">
        Custom image
      </p>

      <input
        ref={fileRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES}
        className="hidden"
        onChange={(event) => {
          void handleFile(event.target.files?.[0]);
          // Reset so picking the same file twice still fires a change.
          event.target.value = "";
        }}
      />

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="nodrag nopan flex-1 rounded border border-zinc-200 px-1.5 py-1 text-[9.5px] font-medium text-zinc-600 transition-colors hover:border-blue-400 hover:text-blue-600"
        >
          Upload image
        </button>
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange(null);
              setError(null);
            }}
            title="Use a built-in icon again"
            className="nodrag nopan rounded border border-zinc-200 px-1.5 py-1 text-[9.5px] font-medium text-zinc-500 transition-colors hover:border-red-400 hover:text-red-600"
          >
            Remove
          </button>
        )}
      </div>

      <div className="mt-1 flex items-center gap-1">
        <input
          type="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              applyUrl();
            }
          }}
          placeholder="Paste image URL"
          className="nodrag nopan min-w-0 flex-1 rounded border border-zinc-200 px-1.5 py-1 text-[9.5px] text-zinc-700 outline-none focus:border-blue-400"
        />
        <button
          type="button"
          onClick={applyUrl}
          disabled={!url.trim()}
          className="nodrag nopan rounded border border-zinc-200 px-1.5 py-1 text-[9.5px] font-medium text-zinc-600 transition-colors enabled:hover:border-blue-400 enabled:hover:text-blue-600 disabled:opacity-40"
        >
          Use
        </button>
      </div>

      <p className="mt-1 text-[8.5px] leading-snug text-zinc-400">
        .png, .jpg or .jpeg
      </p>

      {error && (
        <p role="alert" className="mt-1 text-[9px] leading-snug text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Renders a chosen image in place of a glyph.
 *
 * A remote URL can fail after the fact — the host goes away, or blocks
 * hotlinking — so a load error clears the image and lets the caller fall back
 * to the built-in icon rather than leaving a broken-image box in the UI.
 */
export function IconImage({
  src,
  className,
  onError,
}: {
  src: string;
  className?: string;
  onError?: () => void;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      draggable={false}
      onError={onError}
      className={`${className ?? "h-5 w-5"} shrink-0 rounded-sm object-contain`}
    />
  );
}
