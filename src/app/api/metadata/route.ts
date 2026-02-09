import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";
import { i18n } from "@/configs/i18n";
import { DEFAULT_SITE_METADATA } from "@/lib/get-settings-general";
import {
  hasDbConfig,
  normalizeLocale,
  isRecord,
  toRecord,
} from "@/lib/server/api-utils";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/api-guards";
import type { LocaleType } from "@/types";

type SiteMetadataPayload = {
  title: string;
  description: string;
  keywords: string[];
  authors: Array<{
    name: string;
    url: string;
  }>;
};

function normalizeMetadata(raw: unknown): SiteMetadataPayload {
  const obj = (raw ?? {}) as Partial<SiteMetadataPayload>;
  return {
    title: (obj.title ?? DEFAULT_SITE_METADATA.title).toString(),
    description: (
      obj.description ?? DEFAULT_SITE_METADATA.description
    ).toString(),
    keywords: Array.isArray(obj.keywords)
      ? obj.keywords.map((k) => (k ?? "").toString()).filter(Boolean)
      : DEFAULT_SITE_METADATA.keywords,
    authors:
      Array.isArray(obj.authors) && obj.authors.length
        ? obj.authors.map((a) => ({
            name: (isRecord(a) ? (a.name ?? "") : "").toString(),
            url: (isRecord(a) ? (a.url ?? "") : "").toString(),
          }))
        : DEFAULT_SITE_METADATA.authors,
  };
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const locale = normalizeLocale(url.searchParams.get("locale"));

  if (!hasDbConfig()) {
    return NextResponse.json(
      { locale, metadata: normalizeMetadata({}) },
      { status: 200 }
    );
  }

  try {
    const existing = await prisma.settingsGeneral.findFirst();
    const value = existing ? (existing[locale] as unknown) : {};
    const localeObj = toRecord(value);
    const metadataValue = "metadata" in localeObj ? localeObj.metadata : value;
    return NextResponse.json(
      { locale, metadata: normalizeMetadata(metadataValue) },
      { status: 200 }
    );
  } catch (_e) {
    return NextResponse.json(
      { locale, metadata: normalizeMetadata({}) },
      { status: 200 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdminApi();
    if (!admin.ok) return admin.response;

    if (!hasDbConfig()) {
      return NextResponse.json(
        { error: "Database is not configured" },
        { status: 503 }
      );
    }

    const body = (await req.json()) as {
      locale?: string;
      settings?: unknown;
      settingsByLocale?: Partial<Record<LocaleType, unknown>>;
    };

    const existing = await prisma.settingsGeneral.findFirst();

    const merged: Record<LocaleType, SiteMetadataPayload> = {
      fa: normalizeMetadata(
        existing
          ? "metadata" in toRecord(existing.fa as unknown)
            ? toRecord(existing.fa as unknown).metadata
            : (existing.fa as unknown)
          : DEFAULT_SITE_METADATA
      ),
      en: normalizeMetadata(
        existing
          ? "metadata" in toRecord(existing.en as unknown)
            ? toRecord(existing.en as unknown).metadata
            : (existing.en as unknown)
          : DEFAULT_SITE_METADATA
      ),
      de: normalizeMetadata(
        existing
          ? "metadata" in toRecord(existing.de as unknown)
            ? toRecord(existing.de as unknown).metadata
            : (existing.de as unknown)
          : DEFAULT_SITE_METADATA
      ),
    };

    const legacyLocale = body.locale ? normalizeLocale(body.locale) : null;

    for (const loc of i18n.locales as ReadonlyArray<LocaleType>) {
      const incoming =
        body.settingsByLocale?.[loc] ??
        (legacyLocale === loc ? body.settings : undefined);
      if (incoming !== undefined) merged[loc] = normalizeMetadata(incoming);
    }

    if (!existing) {
      await prisma.settingsGeneral.create({
        data: {
          fa: { metadata: merged.fa, dashboardFooter: {} },
          en: { metadata: merged.en, dashboardFooter: {} },
          de: { metadata: merged.de, dashboardFooter: {} },
        },
      });
    } else {
      const nextFa = {
        ...toRecord(existing.fa as unknown),
        metadata: merged.fa,
      };
      const nextEn = {
        ...toRecord(existing.en as unknown),
        metadata: merged.en,
      };
      const nextDe = {
        ...toRecord(existing.de as unknown),
        metadata: merged.de,
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
    console.error("Error updating metadata:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
