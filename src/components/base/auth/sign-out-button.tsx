"use client";

import { useClerk } from "@clerk/nextjs";
import { useParams } from "next/navigation";

import type { LocaleType } from "@/types";
import { cn } from "@/lib/utils";

export function SignOutButton({
  children,
  className,
  onBeforeSignOut,
  onClick,
  ...buttonProps
}: React.ComponentPropsWithoutRef<"button"> & {
  onBeforeSignOut?: () => void;
}) {
  const { signOut } = useClerk();
  const params = useParams();
  const locale = params.lang as LocaleType;

  const handleSignOut = async () => {
    onBeforeSignOut?.();
    await signOut({ redirectUrl: `/${locale}/auth` });
  };

  return (
    <button
      type="button"
      onClick={async (e) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        await handleSignOut();
      }}
      className={cn("flex items-center", className)}
      {...buttonProps}
    >
      {children}
    </button>
  );
}
