"use client";

import { usePathname } from "next/navigation";

import type { DictionaryType } from "@/lib/get-dictionary";

import { getDictionaryValue, titleCaseToCamelCase } from "@/lib/utils";

interface PageTitleProps {
  dictionary: DictionaryType;
}

export function PageTitle({ dictionary }: PageTitleProps) {
  const pathname = usePathname();
  const pathSegments = pathname.split("/");
  const currentPath = pathSegments[pathSegments.length - 1] || "dashboard";

  const title = getDictionaryValue(
    titleCaseToCamelCase(currentPath),
    dictionary.pageTitle
  );

  return <h1 className="text-lg font-semibold text-foreground">{title}</h1>;
}
