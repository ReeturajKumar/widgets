"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { IconPanel, SIDEBAR_WIDTH_CLOSED, SIDEBAR_WIDTH_OPEN } from "./IconPanel";
import { Canvas } from "./Canvas";
import { loadUploadedIcons, saveUploadedIcons } from "../lib/storage";
import type { IconDef } from "../lib/types";

const SIDEBAR_OPEN_KEY = "widgets.sidebarOpen.v1";

export function Whiteboard({ builtinIcons }: { builtinIcons: IconDef[] }) {
  // Uploaded icons are persisted; builtins always come from code so new
  // icons appear on update without clearing localStorage.
  const [uploaded, setUploaded] = useState<IconDef[]>(() =>
    loadUploadedIcons().filter((i) => i.source === "uploaded")
  );

  const icons: IconDef[] = [...builtinIcons, ...uploaded];

  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    try {
      return localStorage.getItem(SIDEBAR_OPEN_KEY) !== "false";
    } catch {
      return true;
    }
  });

  const addIconRef = useRef<((icon: IconDef) => void) | null>(null);

  const handleRegisterAdd = useCallback(
    (fn: (icon: IconDef) => void) => {
      addIconRef.current = fn;
    },
    []
  );

  useEffect(() => {
    saveUploadedIcons(uploaded);
  }, [uploaded]);

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_OPEN_KEY, String(sidebarOpen));
    } catch {
      // ignore
    }
  }, [sidebarOpen]);

  function handleAddIcon(icon: IconDef) {
    if (icon.source === "uploaded") {
      setUploaded((prev) => [...prev, icon]);
    }
  }

  function handleRemoveIcon(id: string) {
    setUploaded((prev) => prev.filter((icon) => icon.id !== id));
  }

  function handleClickIcon(icon: IconDef) {
    addIconRef.current?.(icon);
  }

  const sidebarWidth = sidebarOpen ? SIDEBAR_WIDTH_OPEN : SIDEBAR_WIDTH_CLOSED;

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <IconPanel
        icons={icons}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((v) => !v)}
        onAddIcon={handleAddIcon}
        onRemoveIcon={handleRemoveIcon}
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
