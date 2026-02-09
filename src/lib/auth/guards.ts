import "server-only";

import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import type { LocaleType } from "@/types";
import prisma from "@/lib/prisma";

export type Role = "super_admin" | "admin" | "user";

export function hasDbConfig(): boolean {
  return !!(
    process.env.DATABASE_URL &&
    !(
      process.env.DATABASE_URL.includes("localhost:5432") &&
      !process.env.DATABASE_URL.includes("postgresql://user:password")
    )
  );
}

export async function requireAuth(lang: LocaleType) {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    redirect(`/${lang}/auth`);
  }
  return clerkUser;
}

export async function requireRole(
  lang: LocaleType,
  roles: ReadonlyArray<Role>
) {
  const clerkUser = await requireAuth(lang);

  if (!hasDbConfig()) {
    redirect(`/${lang}/forbidden`);
  }

  const me = await prisma.user.findUnique({
    where: { clerkUserId: clerkUser.id },
    select: { id: true, role: true },
  });

  const role = (me?.role ?? "user") as Role;
  if (!roles.includes(role)) {
    redirect(`/${lang}/forbidden`);
  }

  return { clerkUser, meDbId: me?.id ?? 0, role };
}

export async function requireAdmin(lang: LocaleType) {
  return requireRole(lang, ["admin", "super_admin"]);
}

export async function requireSuperAdmin(lang: LocaleType) {
  return requireRole(lang, ["super_admin"]);
}
