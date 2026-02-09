"use client";

import { useRouter } from "next/navigation";

import type { DictionaryType } from "@/lib/get-dictionary";

import { Button } from "@/components/base/ui/button";

export function Unauthorized401({
  dictionary,
}: {
  dictionary: DictionaryType;
}) {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center gap-6 px-4 py-10 text-center text-foreground bg-background">
      <div className="flex flex-col-reverse items-center justify-center gap-6 md:flex-row md:text-start">
        <div className="md:mr-6">
          <h1 className="text-5xl sm:text-6xl font-black">
            401
            <span className="block text-2xl sm:text-3xl font-semibold mt-2">
              {dictionary.unauthorized.title}
            </span>
          </h1>
        </div>

        <div className="flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
            className="h-32 w-32 sm:h-40 sm:w-40 dark:text-gray-400"
          >
            <path
              fill="currentColor"
              d="M256,16C123.452,16,16,123.452,16,256S123.452,496,256,496,496,388.548,496,256,388.548,16,256,16Zm0,448c-106.039,0-192-85.961-192-192S149.961,64,256,64s192,85.961,192,192S362.039,464,256,464Z"
            />
            <path
              fill="currentColor"
              d="M256,128a24,24,0,0,0-24,24V280a24,24,0,0,0,48,0V152A24,24,0,0,0,256,128Z"
            />
            <circle fill="currentColor" cx="256" cy="352" r="28" />
          </svg>
        </div>
      </div>

      <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
        {dictionary.unauthorized.description}
      </p>

      <div className="mt-8 flex justify-center gap-2">
        <Button onClick={() => router.back()} variant="default" size="lg">
          {dictionary.unauthorized.goBack}
        </Button>
        <Button onClick={() => router.push("/")} variant="ghost" size="lg">
          {dictionary.unauthorized.backToHome}
        </Button>
      </div>
    </div>
  );
}
