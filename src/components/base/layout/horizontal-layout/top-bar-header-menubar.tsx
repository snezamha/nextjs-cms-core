"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

import type { DictionaryType } from "@/lib/get-dictionary";
import type {
  LocaleType,
  NavigationNestedItem,
  NavigationRootItem,
} from "@/types";

import { navigationsData } from "@/data/navigations";

import { ensureLocalizedPathname } from "@/lib/i18n";
import {
  cn,
  getDictionaryValue,
  isActivePathname,
  titleCaseToCamelCase,
} from "@/lib/utils";

import { Badge } from "@/components/base/ui/badge";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/base/ui/menubar";
import { DynamicIcon } from "@/components/base/dynamic-icon";
import { SignOutButton } from "@/components/base/auth/sign-out-button";
import { useCurrentRole } from "@/hooks/use-current-role";

export function TopBarHeaderMenubar({
  dictionary,
}: {
  dictionary: DictionaryType;
}) {
  const pathname = usePathname();
  const params = useParams();

  const locale = params.lang as LocaleType;
  const { isAdmin, role } = useCurrentRole();

  const renderMenuItem = (item: NavigationRootItem | NavigationNestedItem) => {
    if ("adminOnly" in item && item.adminOnly && !isAdmin) return null;
    if (
      "superAdminOnly" in item &&
      item.superAdminOnly &&
      role !== "super_admin"
    )
      return null;

    const title = getDictionaryValue(
      titleCaseToCamelCase(item.title),
      dictionary.navigation
    );
    const label =
      item.label &&
      getDictionaryValue(
        titleCaseToCamelCase(item.label),
        dictionary.navigation
      );

    if (item.items) {
      const visibleItems = item.items.filter((child) => {
        if ("adminOnly" in child && child.adminOnly && !isAdmin) return false;
        if (
          "superAdminOnly" in child &&
          child.superAdminOnly &&
          role !== "super_admin"
        )
          return false;
        return true;
      });
      if (!visibleItems.length) return null;
      return (
        <MenubarSub>
          <MenubarSubTrigger className="gap-2">
            {"iconName" in item && item.iconName && (
              <DynamicIcon name={item.iconName} className="me-2 h-4 w-4" />
            )}
            <span>{title}</span>
            {"label" in item && <Badge variant="secondary">{label}</Badge>}
          </MenubarSubTrigger>
          <MenubarSubContent className="max-h-[90vh] flex flex-col flex-wrap gap-1">
            {visibleItems.map((subItem: NavigationNestedItem) => (
              <div key={subItem.title}>{renderMenuItem(subItem)}</div>
            ))}
          </MenubarSubContent>
        </MenubarSub>
      );
    }

    if ("action" in item && item.action === "signOut") {
      return (
        <MenubarItem asChild>
          <SignOutButton
            className={cn(
              "w-full gap-2 text-destructive focus:text-destructive",
              "hover:bg-destructive/10 focus:bg-destructive/10",
              item.className
            )}
          >
            {"iconName" in item && item.iconName ? (
              <DynamicIcon name={item.iconName} className="h-4 w-4" />
            ) : (
              <DynamicIcon name="LogOut" className="h-4 w-4" />
            )}
            <span>{title}</span>
          </SignOutButton>
        </MenubarItem>
      );
    }

    if ("href" in item && typeof item.href === "string") {
      const localizedPathname = ensureLocalizedPathname(item.href, locale);
      const isDashboardRoot = localizedPathname.endsWith("/dashboard");
      const isSettingsRoot = localizedPathname.endsWith("/dashboard/settings");
      const isHomeRoot = item.href === "/";
      const exactMatch = isDashboardRoot || isSettingsRoot || isHomeRoot;
      const isActive = isActivePathname(
        localizedPathname,
        pathname,
        exactMatch
      );

      return (
        <MenubarItem asChild>
          <Link
            href={localizedPathname}
            className={cn(
              "w-full gap-2",
              isActive && "bg-accent",
              item.className
            )}
          >
            {"iconName" in item && item.iconName ? (
              <DynamicIcon name={item.iconName} className="h-4 w-4" />
            ) : (
              <DynamicIcon name="Circle" className="h-2 w-2" />
            )}
            <span>{title}</span>
            {"label" in item && <Badge variant="secondary">{label}</Badge>}
          </Link>
        </MenubarItem>
      );
    }
  };

  const rootItems = navigationsData.flatMap((nav) => nav.items);

  const renderRoot = (item: NavigationRootItem) => {
    if ("adminOnly" in item && item.adminOnly && !isAdmin) return null;
    if (
      "superAdminOnly" in item &&
      item.superAdminOnly &&
      role !== "super_admin"
    )
      return null;

    const title = getDictionaryValue(
      titleCaseToCamelCase(item.title),
      dictionary.navigation
    );

    if (item.items) {
      const visibleItems = item.items.filter((child) => {
        if ("adminOnly" in child && child.adminOnly && !isAdmin) return false;
        if (
          "superAdminOnly" in child &&
          child.superAdminOnly &&
          role !== "super_admin"
        )
          return false;
        return true;
      });
      if (!visibleItems.length) return null;

      return (
        <MenubarMenu key={item.title}>
          <MenubarTrigger className="gap-2">
            {"iconName" in item && item.iconName ? (
              <DynamicIcon name={item.iconName} className="h-4 w-4" />
            ) : null}
            <span>{title}</span>
          </MenubarTrigger>
          <MenubarContent className="space-y-1">
            {visibleItems.map((child) => (
              <div key={child.title}>{renderMenuItem(child)}</div>
            ))}
          </MenubarContent>
        </MenubarMenu>
      );
    }

    if ("href" in item && typeof item.href === "string") {
      const localizedPathname = ensureLocalizedPathname(item.href, locale);
      const isDashboardRoot = localizedPathname.endsWith("/dashboard");
      const isHomeRoot = item.href === "/";
      const exactMatch = isDashboardRoot || isHomeRoot;
      const isActive = isActivePathname(
        localizedPathname,
        pathname,
        exactMatch
      );

      return (
        <MenubarMenu key={item.title}>
          <MenubarTrigger asChild>
            <Link
              href={localizedPathname}
              className={cn(
                "flex items-center gap-2",
                isActive && "bg-accent text-accent-foreground",
                item.className
              )}
            >
              {"iconName" in item && item.iconName ? (
                <DynamicIcon name={item.iconName} className="h-4 w-4" />
              ) : null}
              <span>{title}</span>
            </Link>
          </MenubarTrigger>
        </MenubarMenu>
      );
    }

    if ("action" in item && item.action === "signOut") {
      return (
        <MenubarMenu key={item.title}>
          <MenubarTrigger asChild>
            <SignOutButton
              className={cn(
                "flex items-center gap-2 text-destructive hover:bg-destructive/10 focus:bg-destructive/10",
                item.className
              )}
            >
              {"iconName" in item && item.iconName ? (
                <DynamicIcon name={item.iconName} className="h-4 w-4" />
              ) : (
                <DynamicIcon name="LogOut" className="h-4 w-4" />
              )}
              <span>{title}</span>
            </SignOutButton>
          </MenubarTrigger>
        </MenubarMenu>
      );
    }

    return null;
  };

  return (
    <Menubar className="border-0">
      {rootItems.map((item) => renderRoot(item)).filter(Boolean)}
    </Menubar>
  );
}
