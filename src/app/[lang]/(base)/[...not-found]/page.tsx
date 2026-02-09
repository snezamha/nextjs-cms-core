import type { LocaleType } from "@/types";

import { getDictionary } from "@/lib/get-dictionary";

import { NotFound404 } from "@/components/base/pages/not-found-404";

export default async function NotFoundPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const resolvedParams = await params;
  const dictionary = await getDictionary(resolvedParams.lang as LocaleType);
  return <NotFound404 dictionary={dictionary} />;
}
