import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/api-guards";

export async function GET() {
  const admin = await requireAdminApi();
  if (!admin.ok) return admin.response;

  const users = await prisma.user.findMany({
    orderBy: { id: "desc" },
    select: { id: true, email: true, name: true, role: true },
  });

  return NextResponse.json({ users }, { status: 200 });
}
