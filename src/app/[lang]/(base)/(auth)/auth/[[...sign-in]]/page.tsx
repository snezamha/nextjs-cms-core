"use client";

import GoogleBtn from "@/components/base/google-btn";
import { useDictionary } from "@/contexts/dictionary-context";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/base/ui/card";

export default function Page() {
  const dictionary = useDictionary();

  return (
    <main className="min-h-[calc(100svh-0px)] flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md border-border/60 bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {dictionary.auth.signIn.title}
          </CardTitle>
          <CardDescription>{dictionary.auth.signIn.subtitle}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <GoogleBtn />
          {/* Required placeholder: Clerk will mount the CAPTCHA here */}
          <div id="clerk-captcha" />
        </CardContent>
      </Card>
    </main>
  );
}
