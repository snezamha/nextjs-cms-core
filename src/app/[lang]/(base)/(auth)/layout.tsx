import type { ReactNode } from "react";

import type { LocaleType } from "@/types";
import { getDictionary } from "@/lib/get-dictionary";
import { DictionaryProvider } from "@/contexts/dictionary-context";

export default async function AuthLayout(props: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const params = await props.params;
  const { children } = props;

  const lang = params.lang as LocaleType;
  const dictionary = await getDictionary(lang);

  return (
    <DictionaryProvider dictionary={dictionary}>{children}</DictionaryProvider>
  );
}
