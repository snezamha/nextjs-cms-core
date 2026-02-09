import "server-only";

import { cache } from "react";

import { radii } from "@/configs/themes";
import type { LayoutType, RadiusType, ThemeType } from "@/types";
import { prisma } from "./prisma";
import { hasDbConfig } from "./server/api-utils";

export type AppearancePayload = {
  theme: ThemeType;
  radius: RadiusType;
  layout: LayoutType;
};

const DEFAULT_APPEARANCE: AppearancePayload = {
  theme: "zinc",
  radius: 0.5,
  layout: "vertical",
};

const VALID_THEMES: ThemeType[] = [
  "zinc",
  "slate",
  "stone",
  "gray",
  "neutral",
  "red",
  "rose",
  "orange",
  "green",
  "blue",
  "yellow",
  "violet",
];

const VALID_LAYOUTS: LayoutType[] = ["vertical", "horizontal"];

function normalizeTheme(raw: unknown): ThemeType {
  const s = typeof raw === "string" ? raw : "";
  return VALID_THEMES.includes(s as ThemeType) ? (s as ThemeType) : "zinc";
}

function normalizeRadius(raw: unknown): RadiusType {
  const n = Number(raw);
  return radii.includes(n as RadiusType) ? (n as RadiusType) : 0.5;
}

function normalizeLayout(raw: unknown): LayoutType {
  const s = typeof raw === "string" ? raw : "";
  return VALID_LAYOUTS.includes(s as LayoutType)
    ? (s as LayoutType)
    : "vertical";
}

async function resolveAppearanceUncached(): Promise<AppearancePayload> {
  if (!hasDbConfig()) return DEFAULT_APPEARANCE;
  try {
    const row = await prisma.settingsAppearance.findFirst();
    if (!row) return DEFAULT_APPEARANCE;
    return {
      theme: normalizeTheme(row.theme),
      radius: normalizeRadius(row.radius),
      layout: normalizeLayout(row.layout),
    };
  } catch {
    return DEFAULT_APPEARANCE;
  }
}

export const resolveAppearance = cache(resolveAppearanceUncached);
