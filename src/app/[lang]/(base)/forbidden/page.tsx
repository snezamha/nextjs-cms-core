import type { LocaleType } from "@/types";

import { getDictionary } from "@/lib/get-dictionary";

import { Forbidden403 } from "@/components/base/pages/forbidden-403";

export default async function ForbiddenPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const resolvedParams = await params;
  const dictionary = await getDictionary(resolvedParams.lang as LocaleType);
  return <Forbidden403 dictionary={dictionary} />;
}
