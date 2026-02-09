import type { NavigationType } from "@/types";

export const navigationsData: NavigationType[] = [
  {
    title: "mainmenu",
    items: [
      {
        title: "main page",
        href: "/",
        iconName: "House",
      },
      {
        title: "dashboard",
        href: "/dashboard",
        iconName: "ChartPie",
      },
      {
        title: "users",
        iconName: "Users",
        items: [
          {
            title: "profile",
            href: "/dashboard/profile",
            iconName: "User",
          },
          {
            title: "user management",
            href: "/dashboard/users",
            iconName: "Users",
            adminOnly: true,
          },
        ],
      },
      {
        title: "settings",
        iconName: "Settings",
        superAdminOnly: true,
        items: [
          {
            title: "general",
            href: "/dashboard/settings",
            iconName: "SlidersHorizontal",
          },
          {
            title: "appearance",
            href: "/dashboard/settings/appearance",
            iconName: "Palette",
            superAdminOnly: true,
          },
        ],
      },
      {
        title: "sign out",
        action: "signOut",
        iconName: "LogOut",
        className: "text-destructive",
      },
    ],
  },
];
