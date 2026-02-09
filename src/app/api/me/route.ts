import { NextResponse } from "next/server";

import { currentUser } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";

function hasDbConfig(): boolean {
  return !!(
    process.env.DATABASE_URL &&
    !(
      process.env.DATABASE_URL.includes("localhost:5432") &&
      !process.env.DATABASE_URL.includes("postgresql://user:password")
    )
  );
}

export async function GET() {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }

  if (!hasDbConfig()) {
    return NextResponse.json(
      { authenticated: true, role: "user" as const },
      { status: 200 }
    );
  }

  const dbUser = await prisma.user.findUnique({
    where: { clerkUserId: clerkUser.id },
    select: { role: true },
  });

  return NextResponse.json(
    {
      authenticated: true,
      role: (dbUser?.role ?? "user") as "super_admin" | "admin" | "user",
    },
    { status: 200 }
  );
}
