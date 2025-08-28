import MillionLint from "@million/lint";
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

const withMillionLint = (nextConfig) => {
  if (process.env.MILLION_LINT === "true") {
    return MillionLint.next({
      enabled: true,
      rsc: true,
      filter: {
        include: "**/components/*.{mtsx,mjsx,tsx,jsx}",
      },
    })(nextConfig);
  } else {
    return nextConfig;
  }
};

export default withMillionLint(withBundleAnalyzer(nextConfig));
