import Link from "next/link";

import type { LocaleType } from "@/types";

import { getDictionary } from "@/lib/get-dictionary";

import { Button } from "@/components/base/ui/button";

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = rawLang as LocaleType;
  const dictionary = await getDictionary(lang);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center">
        <h1 className="text-4xl font-bold text-center sm:text-left">
          {dictionary.welcome.message}
        </h1>
        <Link href={`/${lang}/dashboard`}>
          <Button size="lg" className="w-full sm:w-auto">
            {dictionary.welcome.startButton}
          </Button>
        </Link>
      </main>
    </div>
  );
}
