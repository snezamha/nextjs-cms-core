"use client";

import type { DictionaryType } from "@/lib/get-dictionary";

import { TopBarHeaderMenubar } from "./top-bar-header-menubar";

export function TopBarHeader({ dictionary }: { dictionary: DictionaryType }) {
  return (
    <div className="container hidden justify-between items-center py-1 lg:flex">
      <TopBarHeaderMenubar dictionary={dictionary} />
    </div>
  );
}
