"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  IconPanel,
  SIDEBAR_WIDTH_CLOSED,
  SIDEBAR_WIDTH_OPEN,
  clampSidebarWidth,
} from "./IconPanel";
import { Canvas } from "./Canvas";
import type { IconDef } from "../lib/types";

const SIDEBAR_OPEN_KEY = "widgets.sidebarOpen.v1";
const SIDEBAR_WIDTH_KEY = "widgets.sidebarWidth.v1";

export function Whiteboard({ builtinIcons }: { builtinIcons: IconDef[] }) {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    try {
      return localStorage.getItem(SIDEBAR_OPEN_KEY) !== "false";
    } catch {
      return true;
    }
  });

  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    try {
      const stored = Number(localStorage.getItem(SIDEBAR_WIDTH_KEY));
      // A stored width from an older build could be anything; clamp it rather
      // than trusting it, so a bad value cannot wedge the panel off-screen.
      return stored ? clampSidebarWidth(stored) : SIDEBAR_WIDTH_OPEN;
    } catch {
      return SIDEBAR_WIDTH_OPEN;
    }
  });

  const [resizing, setResizing] = useState(false);
  const placeDashboardRef = useRef<((templateId?: "soe" | "outage") => void) | null>(null);
  const openModalRef = useRef<((id: string) => void) | null>(null);
  const handleRegisterOpenModal = useCallback((fn: (id: string) => void) => {
    openModalRef.current = fn;
  }, []);
  const handleRegisterPlaceDashboard = useCallback((fn: (templateId?: "soe" | "outage") => void) => {
    placeDashboardRef.current = fn;
  }, []);

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

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_WIDTH_KEY, String(sidebarWidth));
    } catch {
      // ignore
    }
  }, [sidebarWidth]);

  function handleClickIcon(icon: IconDef) {
    addIconRef.current?.(icon);
  }

  const layoutWidth = sidebarOpen ? sidebarWidth : SIDEBAR_WIDTH_CLOSED;

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <IconPanel
        icons={builtinIcons}
        isOpen={sidebarOpen}
        width={sidebarWidth}
        onToggle={() => setSidebarOpen((v) => !v)}
        onWidthChange={setSidebarWidth}
        onResizingChange={setResizing}
        onClickIcon={handleClickIcon}
        onOpenDashboard={(templateId) => placeDashboardRef.current?.(templateId)}
        onRegisterOpenModal={handleRegisterOpenModal}
      />
      <div
        className={`flex min-h-0 min-w-0 flex-1 flex-col ${
          // Animating the margin during a drag makes the canvas trail the
          // panel; only the open/close toggle should ease.
          resizing ? "" : "transition-[margin-left] duration-200 ease-in-out"
        }`}
        style={{ marginLeft: layoutWidth }}
      >
        <Canvas
          onRegisterAdd={handleRegisterAdd}
          onRegisterPlaceDashboard={handleRegisterPlaceDashboard}
          onModalDrop={(id) => openModalRef.current?.(id)}
        />
      </div>
    </div>
  );
}
