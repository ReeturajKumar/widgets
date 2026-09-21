"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { IconPanel, SIDEBAR_WIDTH_CLOSED, SIDEBAR_WIDTH_OPEN } from "./IconPanel";
import { Canvas } from "./Canvas";
import type { IconDef } from "../lib/types";

const SIDEBAR_OPEN_KEY = "widgets.sidebarOpen.v1";

export function Whiteboard({ builtinIcons }: { builtinIcons: IconDef[] }) {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    try {
      return localStorage.getItem(SIDEBAR_OPEN_KEY) !== "false";
    } catch {
      return true;
    }
  });

  const addIconRef = useRef<((icon: IconDef) => void) | null>(null);

  const handleRegisterAdd = useCallback((fn: (icon: IconDef) => void) => {
    addIconRef.current = fn;
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_OPEN_KEY, String(sidebarOpen));
    } catch {
      // ignore
    }
  }, [sidebarOpen]);

  function handleClickIcon(icon: IconDef) {
    addIconRef.current?.(icon);
  }

  const sidebarWidth = sidebarOpen ? SIDEBAR_WIDTH_OPEN : SIDEBAR_WIDTH_CLOSED;

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <IconPanel
        icons={builtinIcons}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((v) => !v)}
        onClickIcon={handleClickIcon}
      />
      <div
        className="flex min-h-0 min-w-0 flex-1 flex-col transition-[margin-left] duration-200 ease-in-out"
        style={{ marginLeft: sidebarWidth }}
      >
        <Canvas onRegisterAdd={handleRegisterAdd} />
      </div>
    </div>
  );
}
