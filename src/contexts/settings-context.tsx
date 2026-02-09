"use client";

import { createContext, useCallback, useMemo, useState } from "react";

import type { LocaleType, SettingsType } from "@/types";
import type { ReactNode } from "react";

export const defaultSettings: SettingsType = {
  theme: "zinc",
  mode: "system",
  radius: 0.5,
  layout: "vertical",
  locale: "en",
};

export const SettingsContext = createContext<
  | {
      settings: SettingsType;
      updateSettings: (newSettings: SettingsType) => void;
      resetSettings: () => void;
    }
  | undefined
>(undefined);

function setCookieValue(name: string, value: string) {
  const maxAgeSeconds = 60 * 60 * 24 * 365;
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; path=/; max-age=${maxAgeSeconds}; samesite=lax`;
}

export function SettingsProvider({
  locale,
  initialSettings,
  children,
}: {
  locale: LocaleType;
  initialSettings?: Partial<SettingsType>;
  children: ReactNode;
}) {
  const [settings, setSettings] = useState<SettingsType>(() => ({
    ...defaultSettings,
    ...initialSettings,
    locale,
  }));

  const resolvedSettings = useMemo<SettingsType>(
    () => ({ ...settings, locale }),
    [settings, locale]
  );

  const updateSettings = useCallback(
    (newSettings: SettingsType) => {
      const nextSettings: SettingsType = { ...newSettings, locale };
      setSettings(nextSettings);
      setCookieValue("settings", JSON.stringify(nextSettings));
    },
    [locale]
  );

  const resetSettings = useCallback(() => {
    setSettings((prev) => {
      const next = { ...prev, mode: "system" as const };
      setCookieValue("settings", JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <SettingsContext.Provider
      value={{ settings: resolvedSettings, updateSettings, resetSettings }}
    >
      {children}
    </SettingsContext.Provider>
  );
}
