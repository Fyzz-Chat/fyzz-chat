import "server-only";

import { z } from "zod";

const schema = z.object({
  // General
  environment: z.enum(["development", "stage", "production"]).default("development"),
  logLevel: z.enum(["error", "warn", "info", "debug"]).default("info"),
  logDrainUrl: z.string().default(""),
  scheme: z.string().default("https"),
  authority: z.string().default("localhost:3000"),
  host: z.string().url(),

  // Auth
  githubId: z.string().optional(),
  githubSecret: z.string().optional(),
  googleId: z.string().optional(),
  googleSecret: z.string().optional(),

  // AWS
  awsRegion: z.string().default("eu-central-1"),
  awsUploadsBucket: z.string().default(""),
  awsCloudfrontKeyPairId: z.string().default(""),
  awsCloudfrontPrivateKey: z.string().default(""),
});

const envVars = {
  // General
  environment: process.env.ENVIRONMENT,
  logLevel: process.env.LOG_LEVEL,
  logDrainUrl: process.env.LOG_DRAIN_URL,
  scheme: process.env.SCHEME,
  authority: process.env.AUTHORITY,
  host: `${process.env.SCHEME || "https"}://${process.env.AUTHORITY}`,

  // Auth
  githubId: process.env.AUTH_GITHUB_ID,
  githubSecret: process.env.AUTH_GITHUB_SECRET,
  googleId: process.env.AUTH_GOOGLE_ID,
  googleSecret: process.env.AUTH_GOOGLE_SECRET,

  // AWS
  awsRegion: process.env.AWS_REGION,
  awsUploadsBucket: process.env.AWS_UPLOADS_BUCKET,
  awsCloudfrontKeyPairId: process.env.AWS_CLOUDFRONT_KEY_PAIR_ID,
  awsCloudfrontPrivateKey: process.env.AWS_CLOUDFRONT_PRIVATE_KEY,
};

const conf = schema.parse(envVars);

export default conf;
