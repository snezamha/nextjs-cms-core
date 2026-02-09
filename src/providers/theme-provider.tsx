"use client";

import { useEffect } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

import type { ReactNode } from "react";

import { useSettings } from "@/hooks/use-settings";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettings();

  useEffect(() => {
    const bodyElement = document.body;

    Array.from(bodyElement.classList)
      .filter(
        (className) =>
          className.startsWith("theme-") || className.startsWith("radius-")
      )
      .forEach((className) => {
        bodyElement.classList.remove(className);
      });

    bodyElement.classList.add(`theme-${settings.theme}`);
    bodyElement.classList.add(`radius-${settings.radius ?? 0.5}`);
  }, [settings.theme, settings.radius]);

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
