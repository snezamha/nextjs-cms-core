"use client";

import { useRouter } from "next/navigation";
import { AlertTriangle, RefreshCw } from "lucide-react";

import type { DictionaryType } from "@/lib/get-dictionary";

import { Button } from "@/components/base/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/base/ui/card";

export function ServerError500({ dictionary }: { dictionary: DictionaryType }) {
  const router = useRouter();
  const strings =
    (
      dictionary as unknown as {
        serverError?: {
          title?: string;
          description?: string;
          reload?: string;
          backToHome?: string;
        };
      }
    ).serverError ?? {};

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {strings.title ?? "Server error"}
          </CardTitle>
          <CardDescription>
            {strings.description ?? "Something went wrong. Please try again."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <AlertTriangle className="h-10 w-10 text-destructive" />
        </CardContent>
        <CardFooter className="grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={() => router.refresh()}>
            <RefreshCw className="me-2 h-4 w-4" />
            {strings.reload ?? "Reload"}
          </Button>
          <Button onClick={() => router.push("/")}>
            {strings.backToHome ?? "Back to home"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
