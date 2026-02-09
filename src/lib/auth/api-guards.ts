import "server-only";

import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import type { Role } from "./guards";
import { hasDbConfig } from "./guards";

export async function requireRoleApi(roles: ReadonlyArray<Role>) {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "Unauthenticated" },
        { status: 401 }
      ),
    };
  }

  if (!hasDbConfig()) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "Database is not configured" },
        { status: 503 }
      ),
    };
  }

  const me = await prisma.user.findUnique({
    where: { clerkUserId: clerkUser.id },
    select: { id: true, role: true },
  });
  const role = (me?.role ?? "user") as Role;

  if (!roles.includes(role)) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return {
    ok: true as const,
    clerkUserId: clerkUser.id,
    meDbId: me?.id ?? 0,
    role,
  };
}

export async function requireAdminApi() {
  return requireRoleApi(["admin", "super_admin"]);
}

export async function requireSuperAdminApi() {
  return requireRoleApi(["super_admin"]);
}
