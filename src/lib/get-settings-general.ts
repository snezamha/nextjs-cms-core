import { cache } from "react";

import type { LocaleType } from "@/types";
import { prisma } from "./prisma";
import {
  DEFAULT_DASHBOARD_FOOTER,
  DEFAULT_SITE_METADATA,
} from "./settings-general/defaults";
import { hasDbConfig, toRecord } from "./server/api-utils";

export type DashboardFooterFields = {
  line1?: string;
  line2?: string;
};

export type DashboardFooterPayload = Required<DashboardFooterFields>;

export type SiteMetadata = {
  title?: string;
  description?: string;
  keywords?: string[];
  authors?: Array<{
    name?: string;
    url?: string;
  }>;
};

export type SiteMetadataPayload = {
  title: string;
  description: string;
  keywords: string[];
  authors: Array<{
    name: string;
    url: string;
  }>;
};

export type SettingsGeneralLocalePayload = {
  metadata: SiteMetadataPayload;
  dashboardFooter: DashboardFooterPayload;
};

export { DEFAULT_DASHBOARD_FOOTER, DEFAULT_SITE_METADATA };

function normalizeFooter(raw: unknown): DashboardFooterPayload {
  const obj = toRecord(raw);
  return {
    line1: (obj.line1 ?? DEFAULT_DASHBOARD_FOOTER.line1).toString(),
    line2: (obj.line2 ?? DEFAULT_DASHBOARD_FOOTER.line2).toString(),
  };
}

function normalizeMetadata(raw: unknown): SiteMetadataPayload {
  const obj = toRecord(raw);
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
        ? obj.authors.map((a) => {
            const rec = toRecord(a);
            return {
              name: (rec.name ?? "").toString(),
              url: (rec.url ?? "").toString(),
            };
          })
        : DEFAULT_SITE_METADATA.authors,
  };
}

export function normalizeDashboardFooterPayload(
  raw: unknown
): DashboardFooterPayload {
  return normalizeFooter(raw);
}

export function normalizeSiteMetadataPayload(
  raw: unknown
): SiteMetadataPayload {
  return normalizeMetadata(raw);
}

function getLocaleJson(record: unknown, locale: LocaleType): unknown {
  if (!record || typeof record !== "object") return {};
  return (record as Record<string, unknown>)[locale] as unknown;
}

export function resolveLocaleSettings(
  localeValue: unknown
): SettingsGeneralLocalePayload {
  const obj = toRecord(localeValue);
  const metadataValue = "metadata" in obj ? obj.metadata : obj;
  const footerValue = "dashboardFooter" in obj ? obj.dashboardFooter : obj;
  return {
    metadata: normalizeMetadata(metadataValue),
    dashboardFooter: normalizeFooter(footerValue),
  };
}

export function mergeLocaleSettings(
  prevLocaleValue: unknown,
  incoming?: Partial<SettingsGeneralLocalePayload>
): SettingsGeneralLocalePayload {
  const prevResolved = resolveLocaleSettings(prevLocaleValue);
  return {
    metadata:
      incoming?.metadata !== undefined
        ? normalizeMetadata(incoming.metadata)
        : prevResolved.metadata,
    dashboardFooter:
      incoming?.dashboardFooter !== undefined
        ? normalizeFooter(incoming.dashboardFooter)
        : prevResolved.dashboardFooter,
  };
}

async function getSettingsGeneralRecordUncached(): Promise<unknown | null> {
  if (!hasDbConfig()) return null;
  try {
    return await prisma.settingsGeneral.findFirst();
  } catch {
    return null;
  }
}

export const getSettingsGeneralRecord = cache(getSettingsGeneralRecordUncached);

export async function resolveSettingsGeneralLocale(
  locale: LocaleType
): Promise<SettingsGeneralLocalePayload> {
  const record = await getSettingsGeneralRecord();
  const value = record ? getLocaleJson(record, locale) : {};
  return resolveLocaleSettings(value);
}

export async function resolveDashboardFooter(
  locale: LocaleType
): Promise<DashboardFooterPayload> {
  const resolved = await resolveSettingsGeneralLocale(locale);
  return resolved.dashboardFooter;
}

export async function resolveMetadata(
  locale: LocaleType
): Promise<SiteMetadataPayload> {
  const resolved = await resolveSettingsGeneralLocale(locale);
  return resolved.metadata;
}
