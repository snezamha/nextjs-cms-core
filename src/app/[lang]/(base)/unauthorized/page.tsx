import type { LocaleType } from "@/types";

import { getDictionary } from "@/lib/get-dictionary";

import { Unauthorized401 } from "@/components/base/pages/unauthorized-401";

export default async function UnauthorizedPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const resolvedParams = await params;
  const dictionary = await getDictionary(resolvedParams.lang as LocaleType);
  return <Unauthorized401 dictionary={dictionary} />;
}
