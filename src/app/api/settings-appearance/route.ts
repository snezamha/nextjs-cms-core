import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

import { requireSuperAdminApi } from "@/lib/auth/api-guards";
import type { AppearancePayload } from "@/lib/get-settings-appearance";
import { resolveAppearance } from "@/lib/get-settings-appearance";
import { hasDbConfig } from "@/lib/server/api-utils";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const payload = await resolveAppearance();
  return NextResponse.json(payload, { status: 200 });
}

export async function POST(req: NextRequest) {
  const admin = await requireSuperAdminApi();
  if (!admin.ok) return admin.response;

  if (!hasDbConfig()) {
    return NextResponse.json(
      { error: "Database is not configured" },
      { status: 503 }
    );
  }

  try {
    const body = (await req.json()) as Partial<AppearancePayload>;
    const existing = await prisma.settingsAppearance.findFirst();

    const theme =
      typeof body.theme === "string" && body.theme
        ? body.theme
        : (existing?.theme ?? "zinc");
    const radius =
      typeof body.radius === "number" &&
      [0, 0.3, 0.5, 0.75, 1].includes(body.radius)
        ? body.radius
        : (existing?.radius ?? 0.5);
    const layout =
      typeof body.layout === "string" &&
      (body.layout === "vertical" || body.layout === "horizontal")
        ? body.layout
        : (existing?.layout ?? "vertical");

    if (!existing) {
      await prisma.settingsAppearance.create({
        data: { theme, radius, layout },
      });
    } else {
      await prisma.settingsAppearance.update({
        where: { id: existing.id },
        data: { theme, radius, layout },
      });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Error saving settings-appearance:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
