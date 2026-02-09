"use client";

import { useCallback } from "react";

import Link from "next/link";

import { useParams, usePathname } from "next/navigation";

import { Earth } from "lucide-react";

import type { DictionaryType } from "@/lib/get-dictionary";

import type { LocaleType } from "@/types";

import { i18n } from "@/configs/i18n";

import { relocalizePathname } from "@/lib/i18n";

import { getDictionaryValue } from "@/lib/utils";

import { useSettings } from "@/hooks/use-settings";

import { Button } from "@/components/base/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/base/ui/dropdown-menu";

type NavigationLanguageDictionary = Record<string, string>;
type NavigationDictionary = {
  language?: NavigationLanguageDictionary;
};

export function LanguageDropdown({
  dictionary,
}: {
  dictionary: DictionaryType;
}) {
  const navigationDict = dictionary.navigation as
    | NavigationDictionary
    | undefined;
  const languageDict = navigationDict?.language;

  const pathname = usePathname();
  const params = useParams<{ lang: LocaleType }>();
  const { settings, updateSettings } = useSettings();

  const locale = params.lang;
  const direction = i18n.localeDirection[locale];

  const setLocale = useCallback(
    (localeName: LocaleType) => {
      updateSettings({ ...settings, locale: localeName });
    },
    [settings, updateSettings]
  );

  return (
    <DropdownMenu dir={direction}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Language">
          <Earth className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>
          {languageDict?.language ?? "Language"}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={locale}>
          {i18n.locales.map((locale) => {
            const localeName = i18n.localeNames[locale];

            const localizedLocaleName = getDictionaryValue(
              localeName,
              languageDict ?? {}
            );

            return (
              <Link
                key={locale}
                href={relocalizePathname(pathname, locale)}
                onClick={() => setLocale(locale)}
              >
                <DropdownMenuRadioItem value={locale}>
                  {localizedLocaleName}
                </DropdownMenuRadioItem>
              </Link>
            );
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
