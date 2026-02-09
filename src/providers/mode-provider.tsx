"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

import type { ReactNode } from "react";

import { useSettings } from "@/hooks/use-settings";

export function ModeProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettings();
  const { setTheme } = useTheme();

  useEffect(() => {
    if (settings.mode) {
      setTheme(settings.mode);
    }
  }, [settings.mode, setTheme]);

  return <>{children}</>;
}
