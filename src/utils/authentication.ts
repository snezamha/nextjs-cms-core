import type { SignInResource } from "@clerk/types";

export const handleGoogleSignIn = async (
  isLoaded: boolean,
  signIn: SignInResource | undefined,
  locale: string
) => {
  if (!isLoaded || !signIn) return;
  console.log("Attempting Google Sign In");
  try {
    const resolvedLocale = (locale || "en").toString();
    const params = {
      strategy: "oauth_google",
      redirectUrl: `/${resolvedLocale}/auth/sso-callback`,
      redirectUrlComplete: `/${resolvedLocale}/dashboard`,
      additionalParameters: {
        prompt: "select_account",
      },
    } as unknown as Parameters<SignInResource["authenticateWithRedirect"]>[0];

    await signIn.authenticateWithRedirect(params);
  } catch (error) {
    console.error("Google Sign In failed:", error);
  }
};
