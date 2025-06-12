import NextBundleAnalyzer from "@next/bundle-analyzer";

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals = [...config.externals, "bcrypt"];
    return config;
  },
  output: "standalone",
  images: {
    remotePatterns: [
      {
        hostname: "cdn.fyzz.chat",
        protocol: "https",
      },
    ],
  },
  turbopack: {
    resolveAlias: {
      "@": "./src",
      "@components": "./src/components",
      "@lib": "./src/lib",
      "@hooks": "./src/hooks",
      "@types": "./src/types",
      "@stores": "./src/stores",
      "@prisma": "./prisma",
    },
  },
  experimental: {
    viewTransition: true,
  },
};

const withBundleAnalyzer = NextBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

export default withBundleAnalyzer(nextConfig);
