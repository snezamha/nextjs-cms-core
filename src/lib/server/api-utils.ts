import "server-only";

import type { LocaleType } from "@/types";
import { i18n } from "@/configs/i18n";

export function normalizeLocale(raw: string | null): LocaleType {
  const loc = raw ?? "";
  return i18n.locales.includes(loc as LocaleType)
    ? (loc as LocaleType)
    : i18n.defaultLocale;
}

export function hasDbConfig(): boolean {
  return !!(
    process.env.DATABASE_URL &&
    !(
      process.env.DATABASE_URL.includes("localhost:5432") &&
      !process.env.DATABASE_URL.includes("postgresql://user:password")
    )
  );
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function toRecord(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}
