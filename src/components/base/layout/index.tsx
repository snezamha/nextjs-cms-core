"use client";

import type { DictionaryType } from "@/lib/get-dictionary";
import type { ReactNode } from "react";

import { useIsVertical } from "@/hooks/use-is-vertical";
import { SidebarProvider } from "@/components/base/ui/sidebar";
import { Customizer } from "./customizer";
import { HorizontalLayout } from "./horizontal-layout";
import { VerticalLayout } from "./vertical-layout";

export function Layout({
  children,
  dictionary,
}: {
  children: ReactNode;
  dictionary: DictionaryType;
}) {
  const isVertical = useIsVertical();

  return (
    <>
      <SidebarProvider>
        <Customizer dictionary={dictionary} />
        {isVertical ? (
          <VerticalLayout dictionary={dictionary}>{children}</VerticalLayout>
        ) : (
          <HorizontalLayout dictionary={dictionary}>
            {children}
          </HorizontalLayout>
        )}
      </SidebarProvider>
    </>
  );
}
