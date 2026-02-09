import { ApiError } from "./errors";

async function safeReadJson(res: Response): Promise<unknown> {
  const text = await res.text().catch(() => "");
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

export async function fetchJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
    credentials: init?.credentials ?? "include",
  });

  const body = await safeReadJson(res);
  if (!res.ok) {
    const message =
      (body as { error?: unknown } | null)?.error?.toString?.() ||
      `Request failed (${res.status})`;
    throw new ApiError(message, { status: res.status, body });
  }

  return body as T;
}
