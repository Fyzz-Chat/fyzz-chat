import { sendResetPasswordEmail } from "@/lib/aws/ses";
import conf from "@/lib/config";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma/prisma";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { after } from "next/server";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }, _request) => {
      after(
        sendResetPasswordEmail({
          to: user.email,
          name: user.name,
          url: url,
        })
      );
    },
    onPasswordReset: async ({ user }, _request) => {
      logger.info(`Password for user ${user.id} has been reset`);
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
  user: {
    additionalFields: {
      password: {
        type: "string",
        required: false,
      },
      subscription: {
        type: "string",
        required: true,
        defaultValue: "free",
      },
      customerId: {
        type: "string",
        required: false,
      },
      freeMessages: {
        type: "number",
        required: true,
        defaultValue: 10,
      },
      memory: {
        type: "string",
        required: false,
      },
      memoryEnabled: {
        type: "boolean",
        required: true,
        defaultValue: false,
      },
      mcpServers: {
        type: "json",
        required: false,
      },
      defaultModel: {
        type: "string",
        required: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          logger.info(`Creating user with id ${user.id}`);

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
