import "server-only";

import { cache } from "react";

import { i18n } from "@/configs/i18n";
import type enDictionary from "@/data/dictionaries/en.json";
import type { LocaleType } from "@/types";

export type DictionaryType = typeof enDictionary;

function normalizeDictionaryModule(module: unknown): DictionaryType {
  if (module && typeof module === "object" && "default" in module) {
    return (module as { default: DictionaryType }).default;
  }
  return module as DictionaryType;
}

const dictionaries: Record<LocaleType, () => Promise<DictionaryType>> = {
  en: () =>
    import("@/data/dictionaries/en.json").then((module) =>
      normalizeDictionaryModule(module)
    ),
  fa: () =>
    import("@/data/dictionaries/fa.json").then((module) =>
      normalizeDictionaryModule(module)
    ),
  de: () =>
    import("@/data/dictionaries/de.json").then((module) =>
      normalizeDictionaryModule(module)
    ),
};

async function getDictionaryUncached(locale: string): Promise<DictionaryType> {
  const normalizedLocale = i18n.locales.includes(locale as LocaleType)
    ? (locale as LocaleType)
    : i18n.defaultLocale;
  const loader = dictionaries[normalizedLocale];
  return loader();
}

export const getDictionary = cache(getDictionaryUncached);
