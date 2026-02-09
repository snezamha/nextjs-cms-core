"use client";

import type { DirectionType, LocaleType } from "@/types";
import type { SettingsType } from "@/types";
import type { ReactNode } from "react";
import { useEffect, useLayoutEffect } from "react";
import { useRouter } from "next/navigation";

import { SettingsProvider } from "@/contexts/settings-context";
import { DirectionProvider } from "./direction-provider";
import { ModeProvider } from "./mode-provider";
import { ThemeProvider } from "./theme-provider";

function RefreshOnMetadataUpdated() {
  const router = useRouter();

  useEffect(() => {
    const onUpdated = () => router.refresh();
    window.addEventListener("metadata-updated", onUpdated);
    window.addEventListener("appearance-updated", onUpdated);
    return () => {
      window.removeEventListener("metadata-updated", onUpdated);
      window.removeEventListener("appearance-updated", onUpdated);
    };
  }, [router]);

  return null;
}

export function Providers({
  locale,
  direction,
  initialSettings,
  children,
}: Readonly<{
  locale: LocaleType;
  direction: DirectionType;
  initialSettings?: Partial<SettingsType>;
  children: ReactNode;
}>) {
  useLayoutEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = direction;
    document.body.lang = locale;
    document.body.dir = direction;

    document.body.classList.toggle("lang-fa", locale === "fa");
  }, [locale, direction]);

  return (
    <SettingsProvider locale={locale} initialSettings={initialSettings}>
      <ThemeProvider>
        <ModeProvider>
          <DirectionProvider direction={direction}>
            <RefreshOnMetadataUpdated />
            {children}
          </DirectionProvider>
        </ModeProvider>
      </ThemeProvider>
    </SettingsProvider>
  );
}
