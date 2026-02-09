import type { LocaleType } from "@/types";
import type { NextRequest } from "next/server";

import { i18n } from "@/configs/i18n";
import { ensureWithPrefix } from "@/lib/utils";

export function isPathnameMissingLocale(pathname: string) {
  return !i18n.locales.some((locale) => pathname.startsWith(`/${locale}`));
}

export function getLocaleFromPathname(pathname: string) {
  return i18n.locales.find((locale) => pathname.startsWith(`/${locale}`));
}

export function ensureLocalizedPathname(pathname: string, locale: string) {
  if (!pathname || !locale)
    throw new Error("Pathname or Locale cannot be empty");

  return isPathnameMissingLocale(pathname)
    ? `${ensureWithPrefix(locale, "/")}${ensureWithPrefix(pathname, "/")}`
    : pathname;
}

export function relocalizePathname(pathname: string, locale: string) {
  if (!pathname || !locale)
    throw new Error("Pathname or Locale cannot be empty");

  const segments = pathname.split("/");
  segments[1] = locale;

  return segments.join("/");
}

export function getPreferredLocale(request: NextRequest) {
  const settingsCookie = request.cookies.get("settings")?.value;
  try {
    const parsedSettingsCookie = settingsCookie && JSON.parse(settingsCookie);

    if (parsedSettingsCookie?.locale) {
      return parsedSettingsCookie.locale as LocaleType;
    }
  } catch (error) {
    console.error("Failed to parse settings cookie", error);
  }

  return i18n.defaultLocale as LocaleType;
}
