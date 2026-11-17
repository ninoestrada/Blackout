"use client";

/**
 * Blackout's navigation bar.
 * Displays the site's links and authentication button.
 */

import Link from "next/link";
import { useEffect, useState } from "react";

import type { User } from "@supabase/supabase-js";

import AuthButton from "@/components/AuthButton";
import { supabase } from "@/lib/supabase";

/**
 * Renders Blackout's header and navigation bar.
 * Shows the "My Blackouts" link only when the user is signed in.
 *
 * @returns The navigation bar JSX.
 */
export default function Navbar() {
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

  return (
    <header className="site-header">
      <Link href="/" className="site-title">
        <span className="marked-word">black</span>out
      </Link>

      <nav className="site-nav" aria-label="Main navigation">
        <Link href="/studio" className="nav-link">
          Studio
        </Link>

        {user && (
          <Link href="/my-blackouts" className="nav-link">
            My Blackouts
          </Link>
        )}

        <AuthButton isSignedIn={user !== null} />
      </nav>
    </header>
  );
}
