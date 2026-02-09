import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

import { requireAdminApi } from "@/lib/auth/api-guards";
import { i18n } from "@/configs/i18n";
import {
  DEFAULT_SITE_METADATA,
  resolveDashboardFooter,
} from "@/lib/get-settings-general";
import { hasDbConfig, normalizeLocale, toRecord } from "@/lib/server/api-utils";
import { prisma } from "@/lib/prisma";
import type { LocaleType } from "@/types";

type DashboardFooterPayload = {
  line1: string;
  line2: string;
};

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const locale = normalizeLocale(url.searchParams.get("locale"));

  const resolved = await resolveDashboardFooter(locale);
  return NextResponse.json({ locale, settings: resolved }, { status: 200 });
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
      locale?: string;
      settings?: Partial<DashboardFooterPayload>;
      settingsByLocale?: Partial<
        Record<LocaleType, Partial<DashboardFooterPayload>>
      >;
    };

    const existing = await prisma.settingsGeneral.findFirst();

    const merged: Record<LocaleType, DashboardFooterPayload> = {
      fa: { line1: "", line2: "" },
      en: { line1: "", line2: "" },
      de: { line1: "", line2: "" },
    };

    const legacyLocale = body.locale ? normalizeLocale(body.locale) : null;

    for (const loc of i18n.locales as ReadonlyArray<LocaleType>) {
      const previousLocaleValue = existing
        ? (existing[loc] as unknown)
        : undefined;
      const previousLocaleObj = toRecord(previousLocaleValue);
      const previousFooterObj = toRecord(previousLocaleObj.dashboardFooter);

      const incoming =
        body.settingsByLocale?.[loc] ??
        (legacyLocale === loc ? body.settings : undefined) ??
        undefined;

      merged[loc] = {
        line1: (incoming?.line1 ?? previousFooterObj.line1 ?? "").toString(),
        line2: (incoming?.line2 ?? previousFooterObj.line2 ?? "").toString(),
      };
    }

    if (!existing) {
      await prisma.settingsGeneral.create({
        data: {
          fa: { metadata: DEFAULT_SITE_METADATA, dashboardFooter: merged.fa },
          en: { metadata: DEFAULT_SITE_METADATA, dashboardFooter: merged.en },
          de: { metadata: DEFAULT_SITE_METADATA, dashboardFooter: merged.de },
        },
      });
    } else {
      const nextFa = {
        ...toRecord(existing.fa as unknown),
        dashboardFooter: merged.fa,
      };
      const nextEn = {
        ...toRecord(existing.en as unknown),
        dashboardFooter: merged.en,
      };
      const nextDe = {
        ...toRecord(existing.de as unknown),
        dashboardFooter: merged.de,
      };

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
    console.error("Error saving dashboard footer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
