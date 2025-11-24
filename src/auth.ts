import conf from "@/lib/config";
import prisma from "@/lib/prisma/prisma";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      enabled: Boolean(conf.githubId) && Boolean(conf.githubSecret),
      clientId: conf.githubId || "",
      clientSecret: conf.githubSecret,
    },
    google: {
      enabled: Boolean(conf.googleId) && Boolean(conf.googleSecret),
      clientId: conf.googleId || "",
      clientSecret: conf.googleSecret,
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "github"],
    },
  },
  plugins: [nextCookies()],
});
