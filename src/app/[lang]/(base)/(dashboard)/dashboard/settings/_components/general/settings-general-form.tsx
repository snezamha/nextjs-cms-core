"use client";

import { useEffect, useState } from "react";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import { i18n } from "@/configs/i18n";
import { getDictionaryValue } from "@/lib/utils";
import type { LocaleType } from "@/types";

import { useDictionary } from "@/contexts/dictionary-context";
import { useToast } from "@/hooks/use-toast";
import { isApiError } from "@/lib/api/errors";
import { fetchJson } from "@/lib/api/fetch-json";
import { Button } from "@/components/base/ui/button";
import { Input } from "@/components/base/ui/input";
import { Label } from "@/components/base/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/base/ui/tabs";
import { Textarea } from "@/components/base/ui/textarea";
import { QuillEditor } from "@/components/base/rich-text/quill";
import { getDefaultSettingsGeneralLocale } from "@/lib/settings-general/defaults";

type DashboardFooterState = {
  line1: string;
  line2: string;
};

type SiteMetadataState = {
  title: string;
  description: string;
  keywords: string[];
  authors: Array<{
    name: string;
    url: string;
  }>;
};

type SettingsGeneralLocaleState = {
  metadata: SiteMetadataState;
  dashboardFooter: DashboardFooterState;
};

const defaultState: SettingsGeneralLocaleState =
  getDefaultSettingsGeneralLocale();

export default function SettingsGeneralForm() {
  const { toast } = useToast();
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dictionary = useDictionary();

  const defaultLocale = params.lang as LocaleType;
  const [locale, setLocale] = useState<LocaleType>(() => {
    const fromQuery = searchParams.get("locale");
    return i18n.locales.includes(fromQuery as LocaleType)
      ? (fromQuery as LocaleType)
      : defaultLocale;
  });

  const [settingsByLocale, setSettingsByLocale] = useState<
    Partial<Record<LocaleType, SettingsGeneralLocaleState>>
  >({});

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await fetchJson<{
          locale: string;
          settings: SettingsGeneralLocaleState;
        }>(`/api/settings-general?locale=${locale}`, { method: "GET" });
        if (cancelled) return;
        setSettingsByLocale((prev) => ({
          ...prev,
          [locale]: data.settings ?? defaultState,
        }));
      } catch (_e) {}
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [locale]);

  const settings = settingsByLocale[locale] ?? defaultState;

  const updateSettings = (next: SettingsGeneralLocaleState) => {
    setSettingsByLocale((prev) => ({ ...prev, [locale]: next }));
  };

  const setLocaleAndPersist = (next: LocaleType) => {
    setLocale(next);
    const nextSearch = new URLSearchParams(searchParams.toString());
    nextSearch.set("locale", String(next));
    router.replace(`${pathname}?${nextSearch.toString()}`);
  };

  const handleSave = async () => {
    try {
      const locales = i18n.locales as ReadonlyArray<LocaleType>;

      const payloadEntries = await Promise.all(
        locales.map(async (loc) => {
          const existing = settingsByLocale[loc];
          if (existing) return [loc, existing] as const;

          try {
            const data = await fetchJson<{
              settings: SettingsGeneralLocaleState;
            }>(`/api/settings-general?locale=${loc}`, { method: "GET" });
            return [loc, data.settings ?? defaultState] as const;
          } catch (_e) {
            return [loc, defaultState] as const;
          }
        })
      );

      const payload = Object.fromEntries(payloadEntries) as Record<
        LocaleType,
        SettingsGeneralLocaleState
      >;

      await fetchJson<{ ok: true }>("/api/settings-general", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settingsByLocale: payload }),
      });

      toast({
        description:
          dictionary.settings.general.metaData.updatedAll ??
          dictionary.settings.dashboardFooter.form.updatedAll ??
          "Changes applied for all languages",
        variant: "success",
      });

      window.dispatchEvent(new Event("dashboard-footer-updated"));
      window.dispatchEvent(new Event("metadata-updated"));
      router.refresh();
    } catch (error) {
      console.error("Error saving settings-general:", error);
      const apiErrorMessage =
        isApiError(error) &&
        (error.body as { error?: unknown } | null)?.error?.toString?.();
      toast({
        description:
          apiErrorMessage ||
          (dictionary.settings.general.metaData.saveFailed ??
            dictionary.settings.dashboardFooter.form.saveFailed),
        variant: "destructive",
      });
    }
  };

  type NavigationLanguageDictionary = Record<string, string>;
  type NavigationDictionary = { language?: NavigationLanguageDictionary };
  const navigationDict = dictionary.navigation as
    | NavigationDictionary
    | undefined;
  const languageDict = navigationDict?.language;

  return (
    <>
      <Tabs
        value={locale}
        onValueChange={(value) => setLocaleAndPersist(value as LocaleType)}
      >
        <TabsList className="mb-4 flex justify-center w-full">
          {i18n.locales.map((loc) => {
            const localeName = i18n.localeNames[loc];
            const localizedLocaleName = getDictionaryValue(
              localeName,
              languageDict ?? {}
            );
            return (
              <TabsTrigger key={loc} value={loc}>
                {localizedLocaleName}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      <div className="grid gap-6">
        <div className="grid gap-4">
          <div>
            <div className="font-medium">
              {dictionary.settings.general.metaData.title}
            </div>
            <div className="text-sm text-muted-foreground">
              {dictionary.settings.general.metaData.description}
            </div>
          </div>

          <div>
            <Label className="mb-2 block font-medium">
              {dictionary.settings.general.metaData.metaTitle}
            </Label>
            <Input
              value={settings.metadata.title}
              onChange={(e) =>
                updateSettings({
                  ...settings,
                  metadata: { ...settings.metadata, title: e.target.value },
                })
              }
              className="w-full"
            />
          </div>

          <div>
            <Label className="mb-2 block font-medium">
              {dictionary.settings.general.metaData.metaDescription}
            </Label>
            <Textarea
              value={settings.metadata.description}
              onChange={(e) =>
                updateSettings({
                  ...settings,
                  metadata: {
                    ...settings.metadata,
                    description: e.target.value,
                  },
                })
              }
              className="w-full"
            />
          </div>

          <div>
            <Label className="mb-2 block font-medium">
              {dictionary.settings.general.metaData.keywords}
            </Label>
            <Input
              value={settings.metadata.keywords.join(", ")}
              onChange={(e) =>
                updateSettings({
                  ...settings,
                  metadata: {
                    ...settings.metadata,
                    keywords: e.target.value
                      .split(",")
                      .map((x) => x.trim())
                      .filter(Boolean),
                  },
                })
              }
              className="w-full"
            />
          </div>

          <div>
            <Label className="mb-2 block font-medium">
              {dictionary.settings.general.metaData.authorName}
            </Label>
            <Input
              value={settings.metadata.authors[0]?.name || ""}
              onChange={(e) =>
                updateSettings({
                  ...settings,
                  metadata: {
                    ...settings.metadata,
                    authors: [
                      {
                        name: e.target.value,
                        url: settings.metadata.authors[0]?.url || "",
                      },
                    ],
                  },
                })
              }
              className="w-full"
            />
          </div>

          <div>
            <Label className="mb-2 block font-medium">
              {dictionary.settings.general.metaData.authorUrl}
            </Label>
            <Input
              value={settings.metadata.authors[0]?.url || ""}
              onChange={(e) =>
                updateSettings({
                  ...settings,
                  metadata: {
                    ...settings.metadata,
                    authors: [
                      {
                        name: settings.metadata.authors[0]?.name || "",
                        url: e.target.value,
                      },
                    ],
                  },
                })
              }
              className="w-full"
            />
          </div>
        </div>

        <div className="grid gap-4">
          <div>
            <div className="font-medium">
              {dictionary.settings.dashboardFooter.form.title}
            </div>
            <div className="text-sm text-muted-foreground">
              {dictionary.settings.dashboardFooter.form.description}
            </div>
          </div>

          <QuillEditor
            label={dictionary.settings.dashboardFooter.form.line1}
            value={settings.dashboardFooter.line1}
            onChange={(next) =>
              updateSettings({
                ...settings,
                dashboardFooter: { ...settings.dashboardFooter, line1: next },
              })
            }
            placeholder="© 2026 Next.js Starter Kit"
          />

          <QuillEditor
            label={dictionary.settings.dashboardFooter.form.line2}
            value={settings.dashboardFooter.line2}
            onChange={(next) =>
              updateSettings({
                ...settings,
                dashboardFooter: { ...settings.dashboardFooter, line2: next },
              })
            }
            placeholder="Designed & Developed by: Nezam Aghda"
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} variant="default" className="px-6">
            {dictionary.settings.general.metaData.saveChanges}
          </Button>
        </div>
      </div>
    </>
  );
}
