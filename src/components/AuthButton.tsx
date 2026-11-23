/**
 * Blackout's authentication button.
 * Handles Google sign-in and sign-out.
 */

"use client";

import { supabase } from "@/lib/supabase";

type AuthButtonProps = {
  isSignedIn: boolean;
};

/**
 * Renders a sign-in or sign-out button based on the user's authentication state.
 *
 * @returns The authentication button JSX.
 */
export default function AuthButton({ isSignedIn }: AuthButtonProps) {
  /**
   * Starts Google sign-in and remembers which page to return to after signing in.
   */
  async function handleSignIn() {
    const returnPath = window.location.pathname + window.location.search;

    window.dispatchEvent(new Event("blackout:before-auth"));

    const callbackUrl = new URL("/auth/callback", window.location.origin);
    callbackUrl.searchParams.set("next", returnPath);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl.toString(),
      },
    });

    if (error) {
      console.error("Error signing in:", error.message);
    }
  }

  /**
   * Signs out the current user.
   */
  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error signing out:", error.message);
    }
  }

  return isSignedIn ? (
    <button type="button" className="primary-button" onClick={handleSignOut}>
      Sign out
    </button>
  ) : (
    <button type="button" className="primary-button" onClick={handleSignIn}>
      Sign in
    </button>
  );
}
