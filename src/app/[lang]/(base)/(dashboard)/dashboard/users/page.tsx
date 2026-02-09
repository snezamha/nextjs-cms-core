import prisma from "@/lib/prisma";
import { UsersTable } from "./_components/users-table";
import type { LocaleType } from "@/types";

import { hasDbConfig, requireAdmin, requireAuth } from "@/lib/auth/guards";

export default async function UsersManagementPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const resolvedParams = await params;
  const lang = resolvedParams.lang as LocaleType;

  if (!hasDbConfig()) {
    await requireAuth(lang);
    return (
      <div className="container py-6">
        <div className="text-sm text-muted-foreground">
          Database is not configured.
        </div>
      </div>
    );
  }

  const { meDbId, role: meRole } = await requireAdmin(lang);

  const users = await prisma.user.findMany({
    orderBy: { id: "desc" },
    select: { id: true, email: true, name: true, role: true },
  });

  return <UsersTable initialUsers={users} meUserId={meDbId} meRole={meRole} />;
}
