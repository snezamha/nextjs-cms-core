export const DEFAULT_DASHBOARD_FOOTER: { line1: string; line2: string } = {
  line1: "© 2026 Next.js Starter Kit",
  line2: "Designed & Developed by: Nezam Aghda",
};

export const DEFAULT_SITE_METADATA: {
  title: string;
  description: string;
  keywords: string[];
  authors: Array<{ name: string; url: string }>;
} = {
  title: "Next.js Starter Kit",
  description: "Next.js CMS Core",
  keywords: ["nextjs", "cms", "starter kit"],
  authors: [{ name: "Nezam Aghda", url: "https://github.com/snezamha" }],
};

export const DEFAULT_SETTINGS_GENERAL_LOCALE = {
  metadata: DEFAULT_SITE_METADATA,
  dashboardFooter: DEFAULT_DASHBOARD_FOOTER,
};

export function getDefaultSettingsGeneralLocale() {
  return {
    metadata: {
      title: DEFAULT_SITE_METADATA.title,
      description: DEFAULT_SITE_METADATA.description,
      keywords: [...DEFAULT_SITE_METADATA.keywords],
      authors: DEFAULT_SITE_METADATA.authors.map((a) => ({ ...a })),
    },
    dashboardFooter: {
      line1: DEFAULT_DASHBOARD_FOOTER.line1,
      line2: DEFAULT_DASHBOARD_FOOTER.line2,
    },
  };
}
