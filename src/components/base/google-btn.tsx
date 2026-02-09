"use client";

import { useSignIn } from "@clerk/nextjs";
import type { SignInResource } from "@clerk/types";
import { useParams } from "next/navigation";

import { handleGoogleSignIn } from "@/utils/authentication";
import { useDictionary } from "@/contexts/dictionary-context";
import type { LocaleType } from "@/types";

const GoogleBtn = () => {
  const { signIn, isLoaded } = useSignIn();
  const dictionary = useDictionary();
  const params = useParams();
  const locale = params.lang as LocaleType;

  return (
    <div className="grid w-full items-center justify-center">
      <button
        type="button"
        onClick={() =>
          handleGoogleSignIn(
            isLoaded,
            signIn as SignInResource | undefined,
            locale
          )
        }
        className="group relative flex w-full items-center justify-center gap-2 rounded-md border border-border bg-background/80 px-3 py-2 text-sm font-medium text-foreground shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
      >
        <span className="pointer-events-none absolute inset-0 rounded-md bg-gradient-to-r from-transparent via-primary/10 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100 motion-reduce:transition-none" />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 48"
          className="h-3.5 w-3.5 transition-transform duration-200 group-hover:scale-110 motion-reduce:transition-none"
          aria-hidden
        >
          <path
            fill="#EA4335"
            d="M24 9.5c3.54 0 6.74 1.22 9.26 3.62l6.9-6.9C36.05 2.45 30.4 0 24 0 14.64 0 6.61 5.38 2.64 13.22l8.03 6.24C12.55 13.03 17.82 9.5 24 9.5z"
          />
          <path
            fill="#4285F4"
            d="M46.1 24.5c0-1.64-.15-3.22-.43-4.74H24v9h12.4c-.54 2.9-2.14 5.36-4.56 7.02l7.02 5.45c4.1-3.78 6.24-9.34 6.24-16.73z"
          />
          <path
            fill="#FBBC05"
            d="M10.67 28.54A14.5 14.5 0 0 1 9.9 24c0-1.58.27-3.1.77-4.54l-8.03-6.24A23.99 23.99 0 0 0 0 24c0 3.9.93 7.58 2.64 10.78l8.03-6.24z"
          />
          <path
            fill="#34A853"
            d="M24 48c6.4 0 12.05-2.12 16.06-5.77l-7.02-5.45c-1.95 1.31-4.45 2.09-9.04 2.09-6.18 0-11.45-3.53-13.33-8.96l-8.03 6.24C6.61 42.62 14.64 48 24 48z"
          />
        </svg>
        <span className="relative leading-none">
          {dictionary.auth.signIn.google}
        </span>
      </button>
    </div>
  );
};

export default GoogleBtn;
