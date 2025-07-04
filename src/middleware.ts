import type { Locale } from "@/types/locale";
import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import { type NextRequest, NextResponse } from "next/server";

const locales: Locale[] = ["en", "hu"];
const defaultLocale = "en";

function getLocale(request: NextRequest) {
  const acceptLanguage = request.headers.get("accept-language");

  if (!acceptLanguage) {
    return defaultLocale;
  }

  const languages = new Negotiator({
    headers: { "accept-language": acceptLanguage },
  }).languages();
  return match(languages, locales, defaultLocale);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  const locale = getLocale(request);

  return NextResponse.next({
    headers: { "Set-Cookie": `locale=${locale}; Path=/; HttpOnly; SameSite=Lax` },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
