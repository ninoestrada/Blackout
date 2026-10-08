"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

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

  return (
    <nav className="account-nav" aria-label="Main navigation">
      <Link href="/studio" className="nav-link">
        Studio
      </Link>

      {user && (
        <Link href="/my-blackouts" className="nav-link">
          My Blackouts
        </Link>
      )}

      {user ? (
        <button
          type="button"
          className="landing-button"
          onClick={handleSignOut}
        >
          Sign out
        </button>
      ) : (
        <button type="button" className="landing-button" onClick={handleSignIn}>
          Sign in
        </button>
      )}
    </nav>
  );
}
