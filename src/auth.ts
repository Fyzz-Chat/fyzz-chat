import { sendResetPasswordEmail } from "@/lib/aws/ses";
import conf from "@/lib/config";
import { logger } from "@/lib/logger";
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
    sendResetPassword: async ({ user, url }, _request) => {
      logger.info(`Sending reset password email to ${user.email}`);
      await sendResetPasswordEmail({
        to: user.email,
        name: user.name,
        url: url,
      });
    },
    onPasswordReset: async ({ user }, _request) => {
      logger.info(`Password for user ${user.email} has been reset`);
    },
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
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          logger.info(`Creating user with email ${user.email}`);

          // Add custom fields to the user here
          return {
            data: {
              ...user,
            },
          };
        },
      },
    },
  },
});
