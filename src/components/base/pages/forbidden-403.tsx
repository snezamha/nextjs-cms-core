"use client";

import { useRouter } from "next/navigation";

import type { DictionaryType } from "@/lib/get-dictionary";

import { Button } from "@/components/base/ui/button";

export function Forbidden403({ dictionary }: { dictionary: DictionaryType }) {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center gap-6 px-4 py-10 text-center text-foreground bg-background">
      <div className="flex flex-col-reverse items-center justify-center gap-6 md:flex-row md:text-start">
        <div className="md:mr-6">
          <h1 className="text-5xl sm:text-6xl font-black">
            403
            <span className="block text-2xl sm:text-3xl font-semibold mt-2">
              {dictionary.forbidden.title}
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
              d="M376,216H360V176a104,104,0,0,0-208,0v40H136a24,24,0,0,0-24,24V424a24,24,0,0,0,24,24H376a24,24,0,0,0,24-24V240A24,24,0,0,0,376,216ZM184,176a72,72,0,0,1,144,0v40H184ZM368,416H144V248H368Z"
            />
            <path
              fill="currentColor"
              d="M256,280a32,32,0,0,0-16,59.71V368a16,16,0,0,0,32,0V339.71A32,32,0,0,0,256,280Z"
            />
          </svg>
        </div>
      </div>

      <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
        {dictionary.forbidden.description}
      </p>

      <div className="mt-8 flex justify-center gap-2">
        <Button onClick={() => router.back()} variant="default" size="lg">
          {dictionary.forbidden.goBack}
        </Button>
        <Button onClick={() => router.push("/")} variant="ghost" size="lg">
          {dictionary.forbidden.backToHome}
        </Button>
      </div>
    </div>
  );
}
