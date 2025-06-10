import { z } from "zod";

const schema = z.object({
  // Auth
  redirectPath: z.string().default("/chat"),
});

const envVars = {
  // Auth
  redirectPath: process.env.NEXT_PUBLIC_AUTH_REDIRECT_URL,
};

const publicConf = schema.parse(envVars);

export default publicConf;
