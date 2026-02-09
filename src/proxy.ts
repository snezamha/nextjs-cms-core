import { NextResponse } from "next/server";

import type { NextFetchEvent, NextRequest } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

import { i18n } from "./configs/i18n";
import {
  ensureLocalizedPathname,
  getPreferredLocale,
  isPathnameMissingLocale,
} from "./lib/i18n";

const isApiRoute = createRouteMatcher(["/api(.*)", "/trpc(.*)"]);

function redirect(pathname: string, request: NextRequest) {
  const { search, hash } = request.nextUrl;
  let resolvedPathname = pathname;

  if (isPathnameMissingLocale(pathname)) {
    const preferredLocale = getPreferredLocale(request);
    resolvedPathname = ensureLocalizedPathname(pathname, preferredLocale);
  }
  if (search) {
    resolvedPathname += search;
  }
  if (hash) {
    resolvedPathname += hash;
  }

  const redirectUrl = new URL(resolvedPathname, request.url).toString();
  return NextResponse.redirect(redirectUrl);
}

const isClerkPublicRoute = createRouteMatcher([
  "/auth(.*)",
  "/unauthorized(.*)",
  "/forbidden(.*)",
  "/server-error(.*)",
  ...i18n.locales.flatMap((locale) => [`/${locale}/auth(.*)`]),
  ...i18n.locales.flatMap((locale) => [
    `/${locale}/unauthorized(.*)`,
    `/${locale}/forbidden(.*)`,
    `/${locale}/server-error(.*)`,
  ]),
]);

const clerk = clerkMiddleware(
  async (auth, request) => {
    const { pathname } = request.nextUrl;
    const isLocaleHome = i18n.locales.some(
      (locale) => pathname === `/${locale}`
    );
    const isHome = pathname === "/" || isLocaleHome;
    const isPublic = isHome || isClerkPublicRoute(request);

    if (!isPublic) {
      const resolvedAuth = typeof auth === "function" ? await auth() : auth;

      if (!resolvedAuth?.isAuthenticated) {
        if (typeof resolvedAuth?.redirectToSignIn === "function") {
          return resolvedAuth.redirectToSignIn();
        }
        return NextResponse.redirect(new URL("/auth", request.url));
      }
    }

    return NextResponse.next();
  },
  (req) => {
    const { pathname } = req.nextUrl;
    const locale = i18n.locales.find(
      (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)
    );

    if (!locale) return {};

    return {
      signInUrl: `/${locale}/auth`,
      signUpUrl: `/${locale}/auth`,
    };
  }
);

export async function proxy(request: NextRequest, event: NextFetchEvent) {
  const { pathname } = request.nextUrl;

  if (isPathnameMissingLocale(pathname) && !isApiRoute(request)) {
    return redirect(pathname, request);
  }

  return clerk(request, event);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
