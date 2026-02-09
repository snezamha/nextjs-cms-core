import type { LocaleType } from "@/types";

import { getDictionary } from "@/lib/get-dictionary";
import { ServerError500 } from "@/components/base/pages/server-error-500";

export default async function ServerErrorPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = rawLang as LocaleType;
  const dictionary = await getDictionary(lang);
  return <ServerError500 dictionary={dictionary} />;
}
