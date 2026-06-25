import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // @ts-expect-error - Turbopack root is a valid but sometimes untyped experimental feature
    turbopack: {
      root: ".",
    },
  },
};

export default nextConfig;
