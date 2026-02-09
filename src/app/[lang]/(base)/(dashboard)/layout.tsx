import type { LocaleType } from "@/types";
import type { ReactNode } from "react";

import { getDictionary } from "@/lib/get-dictionary";
import { requireAuth } from "@/lib/auth/guards";

import { DictionaryProvider } from "@/contexts/dictionary-context";
import { Layout } from "@/components/base/layout";

export default async function DashboardLayout(props: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const params = await props.params;

  const { children } = props;

  const lang = params.lang as LocaleType;
  await requireAuth(lang);
  const dictionary = await getDictionary(lang);

  return (
    <DictionaryProvider dictionary={dictionary}>
      <Layout dictionary={dictionary}>{children}</Layout>
    </DictionaryProvider>
  );
}
