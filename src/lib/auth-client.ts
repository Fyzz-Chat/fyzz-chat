"use client";

import { lastLoginMethodClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const {
  signIn,
  signOut,
  useSession,
  changePassword,
  resetPassword,
  getLastUsedLoginMethod,
} = createAuthClient({
  plugins: [lastLoginMethodClient()],
});
