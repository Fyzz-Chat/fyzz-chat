import NextBundleAnalyzer from "@next/bundle-analyzer";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use `bun run build:standalone` if you are using Docker
  output: process.env.EXPORT_MODE,
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
};

const withBundleAnalyzer = (nextConfig) => {
  if (process.env.ANALYZE === "true") {
    return NextBundleAnalyzer({
      enabled: true,
    })(nextConfig);
  } else {
    return nextConfig;
  }
};

export default withBundleAnalyzer(nextConfig);
