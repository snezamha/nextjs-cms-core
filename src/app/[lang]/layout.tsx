import { Inter, Vazirmatn } from "next/font/google";
import { cookies } from "next/headers";

import { i18n } from "@/configs/i18n";
import { resolveAppearance } from "@/lib/get-settings-appearance";
import { resolveMetadata } from "@/lib/get-settings-general";
import { cn } from "@/lib/utils";
import { syncCurrentUser } from "@/lib/sync-user";

import { Providers } from "@/providers";

import type { LocaleType, SettingsType } from "@/types";
import type { Metadata } from "next";
import type { ReactNode } from "react";

import { Toaster } from "@/components/base/ui/sonner";
import { Toaster as AppToaster } from "@/components/base/ui/toaster";

function parseSettingsCookie(
  value: string | undefined
): Partial<SettingsType> | undefined {
  if (!value) return undefined;
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!parsed || typeof parsed !== "object") return undefined;
    return parsed as Partial<SettingsType>;
  } catch {
    return undefined;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const lang = resolvedParams.lang as LocaleType;
  const meta = await resolveMetadata(lang);

  const resolvedTitle = meta.title;
  const resolvedDescription = meta.description;
  const resolvedKeywords = meta.keywords;
  const resolvedAuthors = meta.authors.map((a) => ({
    name: a.name ?? "",
    url: a.url ?? undefined,
  }));

  return {
    title: {
      template: resolvedTitle ? `%s | ${resolvedTitle}` : "%s",
      default: resolvedTitle,
    },
    description: resolvedDescription,
    keywords: resolvedKeywords,
    authors: resolvedAuthors,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
  };
}

const inter = Inter({ subsets: ["latin"] });
const vazir = Vazirmatn({ subsets: ["arabic"] });

export default async function LangLayout(props: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const params = await props.params;
  const { children } = props;

  const lang = params.lang as LocaleType;
  const direction = i18n.localeDirection[lang];
  const font = lang === "fa" ? vazir : inter;

  await syncCurrentUser();

  const cookieStore = await cookies();
  const cookieSettings = parseSettingsCookie(
    cookieStore.get("settings")?.value
  );
  const appearance = await resolveAppearance();
  const initialSettings = {
    ...appearance,
    mode: cookieSettings?.mode ?? "system",
    locale: lang,
  };

  return (
    <div
      lang={lang}
      dir={direction}
      className={cn(font.className, "min-h-dvh")}
    >
      <Providers
        locale={lang}
        direction={direction}
        initialSettings={initialSettings}
      >
        {children}
        <Toaster position="top-center" richColors />
        <AppToaster />
      </Providers>
    </div>
  );
}
