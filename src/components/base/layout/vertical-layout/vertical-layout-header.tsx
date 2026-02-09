"use client";

import type { DictionaryType } from "@/lib/get-dictionary";

import { SidebarTrigger } from "@/components/base/ui/sidebar";
import { LanguageDropdown } from "@/components/base/language-dropdown";
import { FullscreenToggle } from "@/components/base/layout/full-screen-toggle";
import { ModeDropdown } from "@/components/base/layout/mode-dropdown";
import { ToggleMobileSidebar } from "../toggle-mobile-sidebar";
import { UserMenu } from "@/components/base/auth/user-menu";

export function VerticalLayoutHeader({
  dictionary,
}: {
  dictionary: DictionaryType;
}) {
  return (
    <header className="sticky top-0 z-50 w-full bg-background border-b border-sidebar-border">
      <div className="container flex h-14 justify-between items-center gap-4">
        <ToggleMobileSidebar />
        <div className="grow flex justify-end gap-2">
          <SidebarTrigger className="hidden lg:flex lg:me-auto" />
          <LanguageDropdown dictionary={dictionary} />
          <ModeDropdown dictionary={dictionary} />
          <FullscreenToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
