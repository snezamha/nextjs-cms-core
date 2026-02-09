"use client";

import { useEffect, useState } from "react";

type Role = "super_admin" | "admin" | "user";

export function useCurrentRole() {
  const [role, setRole] = useState<Role>("user");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/me", { method: "GET" });
        const data = (await res.json()) as
          | { authenticated: false }
          | { authenticated: true; role?: Role };
        if (cancelled) return;
        setRole(
          data && "authenticated" in data && data.authenticated
            ? (data.role ?? "user")
            : "user"
        );
      } catch (_e) {
        if (!cancelled) setRole("user");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    role,
    isAdmin: role === "admin" || role === "super_admin",
    isLoading,
  };
}
