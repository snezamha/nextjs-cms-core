import type { ReactNode } from "react";

import type { LocaleType } from "@/types";
import { hasDbConfig, requireAuth, requireSuperAdmin } from "@/lib/auth/guards";

import { NavList } from "./_components/nav-list";

export default async function SettingsLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = rawLang as LocaleType;

  if (!hasDbConfig()) {
    await requireAuth(lang);
    return (
      <div className="container p-4">
        <div className="text-sm text-muted-foreground">
          Database is not configured.
        </div>
      </div>
    );
  }

  await requireSuperAdmin(lang);
  return (
    <div className="container grid w-full items-start gap-6 p-4 md:grid-cols-[180px_1fr]">
      <div className="grid gap-6">
        <NavList />
      </div>
      <div className="grid gap-6">{children}</div>
    </div>
  );
}
