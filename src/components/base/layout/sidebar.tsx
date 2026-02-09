"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";

import { useClerk } from "@clerk/nextjs";

import type { DictionaryType } from "@/lib/get-dictionary";
import type {
  LocaleType,
  NavigationNestedItem,
  NavigationRootItem,
} from "@/types";

import { navigationsData } from "@/data/navigations";

import { i18n } from "@/configs/i18n";
import { ensureLocalizedPathname } from "@/lib/i18n";
import {
  getDictionaryValue,
  isActivePathname,
  titleCaseToCamelCase,
} from "@/lib/utils";
import { cn } from "@/lib/utils";

import { useSettings } from "@/hooks/use-settings";
import { Badge } from "@/components/base/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/base/ui/collapsible";
import { ScrollArea } from "@/components/base/ui/scroll-area";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  Sidebar as SidebarWrapper,
  useSidebar,
} from "@/components/base/ui/sidebar";
import { DynamicIcon } from "@/components/base/dynamic-icon";
import { PageTitle } from "./page-title";
import { SignOutConfirmDialog } from "@/components/base/auth/sign-out-confirm-dialog";
import { useCurrentRole } from "@/hooks/use-current-role";

export function Sidebar({ dictionary }: { dictionary: DictionaryType }) {
  const { signOut } = useClerk();
  const pathname = usePathname();
  const params = useParams();
  const { openMobile, setOpenMobile, isMobile } = useSidebar();
  const { settings } = useSettings();
  const { isAdmin, role } = useCurrentRole();
  const [signOutOpen, setSignOutOpen] = useState(false);

  const locale = params.lang as LocaleType;
  const direction = i18n.localeDirection[locale];
  const isRTL = direction === "rtl";
  const isHoizontalAndDesktop = settings.layout === "horizontal" && !isMobile;

  if (isHoizontalAndDesktop) return null;

  const isNavItemActive = (item: NavigationRootItem | NavigationNestedItem) => {
    if ("items" in item && item.items?.length) {
      return item.items.some(isNavItemActive);
    }

    if ("href" in item && typeof item.href === "string") {
      const localizedPathname = ensureLocalizedPathname(item.href, locale);
      const isDashboardRoot = localizedPathname.endsWith("/dashboard");
      return isActivePathname(localizedPathname, pathname, isDashboardRoot);
    }

    return false;
  };

  const renderMenuItem = (item: NavigationRootItem | NavigationNestedItem) => {
    if ("adminOnly" in item && item.adminOnly && !isAdmin) {
      return null;
    }
    if (
      "superAdminOnly" in item &&
      item.superAdminOnly &&
      role !== "super_admin"
    ) {
      return null;
    }

    const title = getDictionaryValue(
      titleCaseToCamelCase(item.title),
      dictionary.navigation
    );
    const label =
      "label" in item && item.label
        ? getDictionaryValue(
            titleCaseToCamelCase(item.label),
            dictionary.navigation
          )
        : undefined;

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
        <CollapsibleMenuItem
          item={{ ...item, items: visibleItems } as NavigationRootItem}
          title={title}
          label={label}
        />
      );
    }

    if ("action" in item && item.action === "signOut") {
      return (
        <SidebarMenuButton
          asChild
          className={cn(
            "text-destructive hover:text-destructive",
            "hover:bg-destructive/10 data-[active=true]:bg-destructive/10",
            item.className
          )}
        >
          <button
            type="button"
            onClick={() => setSignOutOpen(true)}
            className="flex w-full items-center gap-2"
          >
            {"iconName" in item && item.iconName ? (
              <DynamicIcon name={item.iconName} className="h-4 w-4" />
            ) : (
              <DynamicIcon name="LogOut" className="h-4 w-4" />
            )}
            <span>{title}</span>
          </button>
        </SidebarMenuButton>
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
        <SidebarMenuButton
          className={item.className}
          isActive={isActive}
          onClick={() => setOpenMobile(!openMobile)}
          asChild
        >
          <Link href={localizedPathname}>
            {"iconName" in item && item.iconName && (
              <DynamicIcon name={item.iconName} className="h-4 w-4" />
            )}
            <span>{title}</span>
            {"label" in item && item.label && (
              <Badge variant="secondary">{label}</Badge>
            )}
          </Link>
        </SidebarMenuButton>
      );
    }
  };

  const CollapsibleMenuItem = ({
    item,
    title,
    label,
  }: {
    item: NavigationRootItem;
    title: string;
    label?: string;
  }) => {
    const hasActiveChild = item.items?.some(isNavItemActive) ?? false;
    const [manualOpen, setManualOpen] = useState(false);

    useEffect(() => {
      if (!hasActiveChild) setManualOpen(false);
    }, [hasActiveChild]);

    const isOpen = hasActiveChild || manualOpen;

    return (
      <Collapsible
        className="group/collapsible"
        open={isOpen}
        onOpenChange={(nextOpen) => {
          if (hasActiveChild) return;
          setManualOpen(nextOpen);
        }}
      >
        <CollapsibleTrigger asChild>
          <SidebarMenuButton className="w-full justify-between [&[data-state=open]>svg]:rotate-180">
            <span className="flex items-center">
              {"iconName" in item && item.iconName && (
                <DynamicIcon name={item.iconName} className="me-2 h-4 w-4" />
              )}
              <span>{title}</span>
              {label && (
                <Badge variant="secondary" className="me-2">
                  {label}
                </Badge>
              )}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
          <SidebarMenuSub>
            {item.items?.map((subItem: NavigationNestedItem) => (
              <SidebarMenuItem key={subItem.title}>
                {renderMenuItem(subItem)}
              </SidebarMenuItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    );
  };

  return (
    <>
      <SidebarWrapper side={isRTL ? "right" : "left"}>
        <SidebarHeader>
          <div className="flex justify-center items-center h-16 w-full">
            <PageTitle dictionary={dictionary} />
          </div>
        </SidebarHeader>
        <ScrollArea>
          <SidebarContent className="gap-0">
            {navigationsData.map((nav) => {
              const title = getDictionaryValue(
                titleCaseToCamelCase(nav.title),
                dictionary.navigation
              );

              return (
                <SidebarGroup key={nav.title}>
                  <SidebarGroupLabel>{title}</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {nav.items
                        .map((item) => {
                          const rendered = renderMenuItem(item);
                          if (!rendered) return null;
                          return (
                            <SidebarMenuItem key={item.title}>
                              {rendered}
                            </SidebarMenuItem>
                          );
                        })
                        .filter(Boolean)}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              );
            })}
          </SidebarContent>
        </ScrollArea>
      </SidebarWrapper>

      <SignOutConfirmDialog
        open={signOutOpen}
        onOpenChange={setSignOutOpen}
        dictionary={dictionary}
        dir={direction}
        onConfirm={async () => {
          setSignOutOpen(false);
          setOpenMobile(false);
          await signOut({ redirectUrl: `/${locale}/auth` });
        }}
      />
    </>
  );
}
