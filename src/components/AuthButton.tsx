"use client";

import { useEffect, useState } from "react";
import { Space_Mono } from "next/font/google";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error signing out:", error.message);
    }
  }

  if (user) {
    return (
      <button
        className={`landing-button ${spaceMono.className}`}
        onClick={handleSignOut}
      >
        Sign out
      </button>
    );
  }

  return (
    <button
      className={`landing-button ${spaceMono.className}`}
      onClick={handleSignIn}
    >
      Sign in
    </button>
  );
}
