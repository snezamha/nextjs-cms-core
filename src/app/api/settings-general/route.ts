import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

import { requireAdminApi } from "@/lib/auth/api-guards";
import { i18n } from "@/configs/i18n";
import { hasDbConfig, normalizeLocale, toRecord } from "@/lib/server/api-utils";
import {
  mergeLocaleSettings,
  resolveLocaleSettings,
} from "@/lib/get-settings-general";
import type { SettingsGeneralLocalePayload } from "@/lib/get-settings-general";
import { prisma } from "@/lib/prisma";
import type { LocaleType } from "@/types";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const localeParam = url.searchParams.get("locale");
  const locale = localeParam ? normalizeLocale(localeParam) : null;

  if (!hasDbConfig()) {
    if (locale) {
      return NextResponse.json(
        { locale, settings: resolveLocaleSettings({}) },
        { status: 200 }
      );
    }

    const settingsByLocale = Object.fromEntries(
      (i18n.locales as ReadonlyArray<LocaleType>).map((loc) => [
        loc,
        resolveLocaleSettings({}),
      ])
    ) as Record<LocaleType, SettingsGeneralLocalePayload>;

    return NextResponse.json({ settingsByLocale }, { status: 200 });
  }

  const existing = await prisma.settingsGeneral.findFirst();

  if (locale) {
    const value = existing ? (existing[locale] as unknown) : {};
    return NextResponse.json(
      { locale, settings: resolveLocaleSettings(value) },
      { status: 200 }
    );
  }

  const settingsByLocale = Object.fromEntries(
    (i18n.locales as ReadonlyArray<LocaleType>).map((loc) => {
      const value = existing ? (existing[loc] as unknown) : {};
      return [loc, resolveLocaleSettings(value)] as const;
    })
  ) as Record<LocaleType, SettingsGeneralLocalePayload>;

  return NextResponse.json({ settingsByLocale }, { status: 200 });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdminApi();
  if (!admin.ok) return admin.response;

  if (!hasDbConfig()) {
    return NextResponse.json(
      { error: "Database is not configured" },
      { status: 503 }
    );
  }

  try {
    const body = (await req.json()) as {
      settingsByLocale?: Partial<
        Record<LocaleType, Partial<SettingsGeneralLocalePayload>>
      >;
    };

    const existing = await prisma.settingsGeneral.findFirst();

    const merged: Record<LocaleType, SettingsGeneralLocalePayload> =
      Object.fromEntries(
        (i18n.locales as ReadonlyArray<LocaleType>).map((loc) => {
          const prevValue = existing ? (existing[loc] as unknown) : {};
          const incoming = body.settingsByLocale?.[loc];
          const next = mergeLocaleSettings(prevValue, incoming);
          return [loc, next] as const;
        })
      ) as Record<LocaleType, SettingsGeneralLocalePayload>;

    if (!existing) {
      await prisma.settingsGeneral.create({
        data: {
          fa: merged.fa,
          en: merged.en,
          de: merged.de,
        },
      });
    } else {
      const nextFa = { ...toRecord(existing.fa as unknown), ...merged.fa };
      const nextEn = { ...toRecord(existing.en as unknown), ...merged.en };
      const nextDe = { ...toRecord(existing.de as unknown), ...merged.de };

      await prisma.settingsGeneral.update({
        where: { id: existing.id },
        data: {
          fa: nextFa,
          en: nextEn,
          de: nextDe,
        },
      });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Error saving settings-general:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
