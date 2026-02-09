import { clsx } from "clsx";
import type { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function ensureWithPrefix(value: string, prefix: string) {
  return value.startsWith(prefix) ? value : `${prefix}${value}`;
}

export function ensureWithSuffix(value: string, suffix: string) {
  return value.endsWith(suffix) ? value : `${value}${suffix}`;
}

export function ensureWithoutSuffix(value: string, suffix: string) {
  return value.endsWith(suffix) ? value.slice(0, -suffix.length) : value;
}

export function ensureWithoutPrefix(value: string, prefix: string) {
  return value.startsWith(prefix) ? value.slice(prefix.length) : value;
}

export function ensureRedirectPathname(
  basePathname: string,
  redirectPathname: string
) {
  const searchParams = new URLSearchParams({
    redirectTo: ensureWithoutSuffix(redirectPathname, "/"),
  });

  return ensureWithSuffix(basePathname, "?" + searchParams.toString());
}

export function getDictionaryValue(
  key: string,
  section: Record<string, unknown>
) {
  const value = section[key];

  if (typeof value !== "string") {
    return key;
  }

  return value;
}

export function isActivePathname(
  basePathname: string,
  currentPathname: string,
  exactMatch: boolean = false
) {
  if (typeof basePathname !== "string" || typeof currentPathname !== "string") {
    throw new Error("Both basePathname and currentPathname must be strings");
  }

  if (exactMatch) {
    return basePathname === currentPathname;
  }

  return (
    currentPathname === basePathname ||
    currentPathname.startsWith(basePathname + "/")
  );
}

export function titleCaseToCamelCase(titleCaseStr: string) {
  const camelCaseStr = titleCaseStr
    .toLowerCase()
    .replace(/\s+(.)/g, (_, char) => char.toUpperCase());

  return camelCaseStr;
}

export function normalizePathname(pathname: string, locale?: string) {
  if (!pathname) return "/";
  let result = pathname;
  if (result.length > 1 && result.endsWith("/")) {
    result = result.slice(0, -1);
  }
  if (locale && !result.startsWith(`/${locale}`)) {
    result = `/${locale}${result.startsWith("/") ? "" : "/"}${result.replace(/^\/+/, "")}`;
  }
  return result;
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
