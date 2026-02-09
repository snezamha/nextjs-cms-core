import type { DynamicIconNameType } from "@/types";

export const linksData: {
  href: string;
  title: string;
  iconName: DynamicIconNameType;
  superAdminOnly?: boolean;
}[] = [
  {
    href: "/dashboard/settings",
    title: "General",
    iconName: "SlidersHorizontal",
  },
  {
    href: "/dashboard/settings/appearance",
    title: "Appearance",
    iconName: "Palette",
    superAdminOnly: true,
  },
];
