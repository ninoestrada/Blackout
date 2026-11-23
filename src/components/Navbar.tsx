/**
 * Blackout's navigation bar.
 * Displays the site's links and authentication button.
 */

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { User } from "@supabase/supabase-js";
import { motion } from "motion/react";

import AuthButton from "@/components/AuthButton";
import { supabase } from "@/lib/supabase";

const MotionLink = motion.create(Link);

/**
 * Renders Blackout's header and navigation bar.
 * Shows the "My Blackouts" link only when the user is signed in.
 *
 * @returns The navigation bar.
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
        <MotionLink
          href="/studio"
          className="nav-link"
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.15 }}
        >
          Studio
        </MotionLink>

        {user && (
          <MotionLink
            href="/my-blackouts"
            className="nav-link"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.15 }}
          >
            My Blackouts
          </MotionLink>
        )}

        <AuthButton isSignedIn={user !== null} />
      </nav>
    </header>
  );
}
