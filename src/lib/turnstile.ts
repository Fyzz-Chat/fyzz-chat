import conf from "@/lib/config";
import { logger } from "@/lib/logger";

export const turnstileFailedResponse = {
  message: "Validation failed",
  description: "Please verify you are human.",
  success: false,
};

export async function verifyTurnstile(response?: string): Promise<boolean> {
  if (!conf.turnstileSecretKey) {
    logger.debug("Turnstile verification bypassed: secret key not configured");
    return true;
  }

  if (!response) {
    logger.debug("Turnstile verification failed: no response provided");
    return false;
  }

  try {
    const verifyRes = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret: conf.turnstileSecretKey,
          response: response,
        }),
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!verifyRes.ok) {
      return false;
    }

    const verifyJson = await verifyRes.json();

    return verifyJson?.success === true;
  } catch (error) {
    logger.error("Turnstile verification error", error);
    return false;
  }
}
