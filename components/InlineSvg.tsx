"use client";

import { useEffect, useRef } from "react";

interface InlineSvgProps {
  svg: string;
  className?: string;
}

// Potrace-style SVGs carry empty margin inside their viewBox, which makes the
// artwork render smaller than the space it's given. Retargeting the viewBox to
// the real bounding box makes it fill the box without altering the drawing.
export function InlineSvg({ svg, className }: InlineSvgProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current?.querySelector("svg");
    if (!el) return;

    el.removeAttribute("width");
    el.removeAttribute("height");

    const box = el.getBBox();
    if (box.width > 0 && box.height > 0) {
      el.setAttribute(
        "viewBox",
        `${box.x} ${box.y} ${box.width} ${box.height}`
      );
    }
  }, [svg]);

  return (
    <div
      ref={ref}
      className={className}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
