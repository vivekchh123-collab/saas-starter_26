import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Your other root configuration options */

  turbopack: {
    resolveAlias: {
      "@prisma/client/runtime/client": "@prisma/client/runtime/library",
    },
  },
};

export default nextConfig;
