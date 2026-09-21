"use client";

import dynamic from "next/dynamic";
import type { IconDef } from "../lib/types";

// The whiteboard reads/writes localStorage and uses browser-only canvas
// interactions, so it's excluded from SSR entirely rather than gated
// behind a post-hydration effect.
const Whiteboard = dynamic(
  () => import("./Whiteboard").then((mod) => mod.Whiteboard),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-1 items-center justify-center text-sm text-zinc-400">
        Loading whiteboard…
      </div>
    ),
  }
);

export function WhiteboardLoader({ builtinIcons }: { builtinIcons: IconDef[] }) {
  return <Whiteboard builtinIcons={builtinIcons} />;
}
