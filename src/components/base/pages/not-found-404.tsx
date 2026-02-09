"use client";

import { useRouter } from "next/navigation";

import type { DictionaryType } from "@/lib/get-dictionary";

import { Button } from "@/components/base/ui/button";

export function NotFound404({ dictionary }: { dictionary: DictionaryType }) {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center gap-6 px-4 py-10 text-center text-foreground bg-background">
      <div className="flex flex-col-reverse items-center justify-center gap-6 md:flex-row md:text-start">
        <div className="md:mr-6">
          <h1 className="text-5xl sm:text-6xl font-black">
            404
            <span className="block text-2xl sm:text-3xl font-semibold mt-2">
              {dictionary.notFound.title}
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
              d="M256,16C123.452,16,16,123.452,16,256S123.452,496,256,496,496,388.548,496,256,388.548,16,256,16ZM403.078,403.078a207.253,207.253,0,1,1,44.589-66.125A207.332,207.332,0,0,1,403.078,403.078Z"
            ></path>
            <rect
              width="176"
              height="32"
              x="168"
              y="320"
              fill="currentColor"
            ></rect>
            <polygon
              fill="currentColor"
              points="210.63 228.042 186.588 206.671 207.958 182.63 184.042 161.37 162.671 185.412 138.63 164.042 117.37 187.958 141.412 209.329 120.042 233.37 143.958 254.63 165.329 230.588 189.37 251.958 210.63 228.042"
            ></polygon>
            <polygon
              fill="currentColor"
              points="383.958 182.63 360.042 161.37 338.671 185.412 314.63 164.042 293.37 187.958 317.412 209.329 296.042 233.37 319.958 254.63 341.329 230.588 365.37 251.958 386.63 228.042 362.588 206.671 383.958 182.63"
            ></polygon>
          </svg>
        </div>
      </div>

      <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
        {dictionary.notFound.description}
      </p>
      <div className="mt-8 flex justify-center gap-2">
        <Button onClick={() => router.back()} variant="default" size="lg">
          {dictionary.notFound.goBack}
        </Button>
        <Button onClick={() => router.push("/")} variant="ghost" size="lg">
          {dictionary.notFound.backToHome}
        </Button>
      </div>
    </div>
  );
}
