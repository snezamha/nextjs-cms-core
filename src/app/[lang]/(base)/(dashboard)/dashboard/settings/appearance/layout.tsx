import type { ReactNode } from "react";

import type { LocaleType } from "@/types";
import { requireSuperAdmin } from "@/lib/auth/guards";

export default async function AppearanceSettingsLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  await requireSuperAdmin(lang as LocaleType);
  return <>{children}</>;
}
