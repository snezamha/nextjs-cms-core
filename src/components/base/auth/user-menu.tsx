"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { User as UserIcon } from "lucide-react";

import { useClerk, useUser } from "@clerk/nextjs";

import type { LocaleType } from "@/types";
import { i18n } from "@/configs/i18n";
import { ensureLocalizedPathname } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { useDictionary } from "@/contexts/dictionary-context";
import { SignOutConfirmDialog } from "@/components/base/auth/sign-out-confirm-dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/base/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/base/ui/dropdown-menu";

function isLikelyInitialsAvatarUrl(url: string) {
  const u = url.toLowerCase();
  return (
    u.includes("default-user") ||
    u.includes("avatar?") ||
    u.includes("initials") ||
    u.includes("monogram")
  );
}

export function UserMenu({ className }: { className?: string }) {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const params = useParams();
  const locale = params.lang as LocaleType;
  const dictionary = useDictionary();
  const [signOutOpen, setSignOutOpen] = useState(false);

  const fullName = user?.fullName?.trim() || "";
  const email = user?.primaryEmailAddress?.emailAddress || "";
  const imageUrl = user?.imageUrl || "";
  const externalAccountImageUrls = (user?.externalAccounts || [])
    .map((account) => account?.imageUrl || "")
    .filter(Boolean);

  const shouldTreatAsNoPhoto =
    isLikelyInitialsAvatarUrl(imageUrl) ||
    externalAccountImageUrls.some((url) => isLikelyInitialsAvatarUrl(url));

  const hasImage = Boolean(user?.hasImage && imageUrl) && !shouldTreatAsNoPhoto;

  const displayName =
    fullName ||
    (email ? email.split("@")[0] : "") ||
    dictionary.navigation.profile;

  if (!isLoaded) return null;

  const profileHref = ensureLocalizedPathname("/dashboard/profile", locale);
  const direction = i18n.localeDirection[locale];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center rounded-full p-0 transition-colors focus-visible:outline-none",
            className
          )}
          aria-label={dictionary.navigation.profile}
        >
          <Avatar size="sm">
            {hasImage ? <AvatarImage src={imageUrl} alt={displayName} /> : null}
            <AvatarFallback>
              <UserIcon className="h-3.5 w-3.5" />
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="p-2">
          <div className="flex items-center gap-3">
            <Avatar size="default">
              {hasImage ? (
                <AvatarImage src={imageUrl} alt={displayName} />
              ) : null}
              <AvatarFallback>
                <UserIcon className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">
                {displayName}
              </div>
              {email ? (
                <div className="truncate text-xs text-muted-foreground">
                  {email}
                </div>
              ) : null}
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href={profileHref}>
            <span>{dictionary.navigation.profile}</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem
          variant="destructive"
          onSelect={() => setSignOutOpen(true)}
        >
          {dictionary.navigation.signOut}
        </DropdownMenuItem>
      </DropdownMenuContent>

      <SignOutConfirmDialog
        open={signOutOpen}
        onOpenChange={setSignOutOpen}
        dictionary={dictionary}
        dir={direction}
        onConfirm={async () => {
          setSignOutOpen(false);
          await signOut({ redirectUrl: `/${locale}/auth` });
        }}
      />
    </DropdownMenu>
  );
}
