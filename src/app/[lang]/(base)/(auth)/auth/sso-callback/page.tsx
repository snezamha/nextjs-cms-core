"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

import { useDictionary } from "@/contexts/dictionary-context";

import { Spinner } from "@/components/base/ui/spinner";
import { Card, CardContent } from "@/components/base/ui/card";

export default function Page() {
  const dictionary = useDictionary();

  return (
    <>
      <main className="min-h-[calc(100svh-0px)] flex items-center justify-center px-4 py-10">
        <Card className="w-full max-w-md border-border/60 bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Spinner className="size-4" />
              <span>{dictionary.auth.signIn.redirecting}</span>
            </div>
          </CardContent>
        </Card>
      </main>
      <AuthenticateWithRedirectCallback />
      {/* Required for sign-up flows: Clerk's bot sign-up protection */}
      <div id="clerk-captcha" />
    </>
  );
}
