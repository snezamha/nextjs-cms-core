"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

import type { LocaleType } from "@/types";

import { linksData } from "../_data/nav-list-links";

import { ensureLocalizedPathname } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { DynamicIcon } from "@/components/base/dynamic-icon";
import { useCurrentRole } from "@/hooks/use-current-role";
import { useDictionary } from "@/contexts/dictionary-context";

export function NavList() {
  const params = useParams();
  const pathname = usePathname();
  const dictionary = useDictionary();
  const { role } = useCurrentRole();

  const locale = params.lang as LocaleType;

  const visibleLinks = linksData.filter(
    (link) =>
      !("superAdminOnly" in link && link.superAdminOnly) ||
      role === "super_admin"
  );

  return (
    <nav className="flex flex-wrap gap-4 text-sm text-muted-foreground md:flex-col">
      {visibleLinks.map((link) => {
        const localizedPathname = ensureLocalizedPathname(link.href, locale);
        const title =
          link.href === "/dashboard/settings"
            ? dictionary.settings.general.title
            : link.href === "/dashboard/settings/appearance"
              ? dictionary.settings.appearance.title
              : dictionary.settings.dashboardFooter.title;

        return (
          <Link
            key={link.title}
            href={localizedPathname}
            className={cn(
              "flex items-center gap-2",
              pathname === localizedPathname && "font-semibold text-primary"
            )}
            aria-current={pathname === localizedPathname ? "page" : undefined}
          >
            <DynamicIcon name={link.iconName} className="h-4 w-4 shrink-0" />
            {title}
          </Link>
        );
      })}
    </nav>
  );
}
