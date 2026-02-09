"use client";

import type { LocaleType } from "@/types";

import { useDictionary } from "@/contexts/dictionary-context";
import { ServerError500 } from "@/components/base/pages/server-error-500";

export default function Error(_props: {
  error: Error & { digest?: string };
  reset: () => void;
  params?: { lang: LocaleType };
}) {
  const dictionary = useDictionary();
  return <ServerError500 dictionary={dictionary} />;
}
