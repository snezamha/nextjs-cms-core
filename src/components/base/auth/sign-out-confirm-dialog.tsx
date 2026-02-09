"use client";

import type { DictionaryType } from "@/lib/get-dictionary";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
} from "@/components/base/ui/alert-dialog";

export function SignOutConfirmDialog({
  open,
  onOpenChange,
  dictionary,
  dir,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dictionary: DictionaryType;
  dir?: "ltr" | "rtl";
  onConfirm: () => void | Promise<void>;
}) {
  const confirmDict = (
    dictionary.navigation as unknown as {
      signOutConfirm?: {
        title?: string;
        message?: string;
        cancel?: string;
        confirm?: string;
      };
    }
  ).signOutConfirm;

  const title =
    confirmDict?.title ?? dictionary.navigation.signOut ?? "Sign Out";
  const message = confirmDict?.message ?? "Are you sure you want to sign out?";
  const cancel = confirmDict?.cancel ?? "Cancel";
  const confirm = confirmDict?.confirm ?? "Yes, sign out";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent dir={dir} className="sm:max-w-md">
        <AlertDialogHeader className="text-center">
          <AlertDialogTitle className="text-2xl">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="grid grid-cols-2 gap-3 sm:grid-cols-2">
          <AlertDialogCancel className="w-full">{cancel}</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            className="w-full"
            onClick={onConfirm}
          >
            {confirm}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
