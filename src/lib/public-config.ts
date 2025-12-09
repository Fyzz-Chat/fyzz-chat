import { z } from "zod";

const schema = z.object({
  // Auth
  redirectPath: z.string().default("/chat"),

  // Turnstile
  turnstileSiteKey: z.string().optional(),
});

const envVars = {
  // Auth
  redirectPath: process.env.NEXT_PUBLIC_AUTH_REDIRECT_URL,

  // Turnstile
  turnstileSiteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY,
};

const publicConf = schema.parse(envVars);

export default publicConf;
