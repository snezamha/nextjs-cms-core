import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

import { clerkClient } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/api-guards";

function parseUserId(raw: string): number | null {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminApi();
  if (!admin.ok) return admin.response;

  const { id: rawId } = await ctx.params;
  const id = parseUserId(rawId);
  if (!id) {
    return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
  }

  const body = (await req.json().catch(() => null)) as null | {
    role?: "admin" | "user" | "super_admin";
  };
  const role = body?.role;
  // super_admin can only be assigned by "first user" rule, not via UI/API.
  if (role !== "admin" && role !== "user") {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({
    where: { id },
    select: { role: true },
  });
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // super_admin cannot be changed by anyone.
  if (target.role === "super_admin") {
    return NextResponse.json(
      { error: "SUPER_ADMIN_IMMUTABLE" },
      { status: 400 }
    );
  }

  // An "admin" can't modify another admin; only super_admin can.
  if (admin.role === "admin" && target.role === "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { role },
    select: { id: true, email: true, name: true, role: true },
  });

  return NextResponse.json({ user: updated }, { status: 200 });
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminApi();
  if (!admin.ok) return admin.response;

  const { id: rawId } = await ctx.params;
  const id = parseUserId(rawId);
  if (!id) {
    return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
  }

  if (id === admin.meDbId) {
    return NextResponse.json(
      { error: "You cannot delete your own account" },
      { status: 400 }
    );
  }

  const target = await prisma.user.findUnique({
    where: { id },
    select: { id: true, clerkUserId: true, role: true },
  });
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // super_admin cannot be deleted by anyone.
  if (target.role === "super_admin") {
    return NextResponse.json(
      { error: "SUPER_ADMIN_IMMUTABLE" },
      { status: 400 }
    );
  }

  // An "admin" can't delete another admin; only super_admin can.
  if (admin.role === "admin" && target.role === "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Delete from Clerk first. If this fails, we keep the DB row to avoid mismatch.
  try {
    const client = await clerkClient();
    await client.users.deleteUser(target.clerkUserId);
  } catch (error) {
    console.error("Failed deleting user from Clerk:", error);
    return NextResponse.json(
      { error: "Failed deleting user from Clerk" },
      { status: 502 }
    );
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true }, { status: 200 });
}
