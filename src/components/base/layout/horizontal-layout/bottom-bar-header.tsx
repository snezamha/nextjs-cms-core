"use client";

import type { DictionaryType } from "@/lib/get-dictionary";

import { LanguageDropdown } from "@/components/base/language-dropdown";
import { FullscreenToggle } from "@/components/base/layout/full-screen-toggle";
import { ModeDropdown } from "@/components/base/layout/mode-dropdown";
import { PageTitle } from "../page-title";
import { ToggleMobileSidebar } from "../toggle-mobile-sidebar";
import { UserMenu } from "@/components/base/auth/user-menu";

export function BottomBarHeader({
  dictionary,
}: {
  dictionary: DictionaryType;
}) {
  return (
    <div className="container flex h-14 justify-between items-center gap-4">
      <ToggleMobileSidebar />
      <PageTitle dictionary={dictionary} />
      <div className="flex gap-2">
        <LanguageDropdown dictionary={dictionary} />
        <ModeDropdown dictionary={dictionary} />
        <FullscreenToggle />
        <UserMenu />
      </div>
    </div>
  );
}
