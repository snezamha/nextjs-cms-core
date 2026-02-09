import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  serverExternalPackages: ["@prisma/client", "prisma"],
  webpack: async (config, { isServer }) => {
    if (isServer) {
      try {
        const pluginModuleName: string =
          "@prisma/nextjs-monorepo-workaround-plugin";
        const mod = (await import(pluginModuleName)) as {
          PrismaPlugin?: new () => unknown;
        };
        const { PrismaPlugin } = mod;

        if (PrismaPlugin) {
          config.plugins = config.plugins || [];
          config.plugins.push(new PrismaPlugin());
        }
      } catch {}
    }
    return config;
  },
  // No Prisma engines with engineType = "client" (driver adapter) — keeps serverless under 250 MB
  turbopack: {},
};

export default nextConfig;
