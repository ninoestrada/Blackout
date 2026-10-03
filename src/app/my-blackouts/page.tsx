"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import styles from "./page.module.css";

type SavedPoem = {
  id: string;
  title: string | null;
  source_text: string;
  blackout_data: number[];
  created_at: string;
};

export default function MyBlackouts() {
  const [poems, setPoems] = useState<SavedPoem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSignedIn, setIsSignedIn] = useState(true);

  useEffect(() => {
    async function fetchPoems() {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError || !userData.user) {
        setIsSignedIn(false);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("poems")
        .select("id, title, source_text, blackout_data, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        setError("Couldn't load your blackouts.");
        setIsLoading(false);
        return;
      }

      setPoems(data);
      setIsLoading(false);
    }

    fetchPoems();
  }, []);

  return (
    <main className={styles.content}>
      <h1 className={styles.heading}>My Blackouts</h1>

      {isLoading && (
        <p className={styles.statusMessage}>Loading your blackouts...</p>
      )}

      {!isLoading && !isSignedIn && (
        <p className={styles.statusMessage}>
          Sign in to view your saved blackouts.
        </p>
      )}

      {isSignedIn && error && <p className={styles.statusMessage}>{error}</p>}

      {!isLoading && isSignedIn && !error && poems.length === 0 && (
        <p className={styles.statusMessage}>
          You don&apos;t have any saved blackouts yet.
        </p>
      )}

      {!isLoading && isSignedIn && !error && poems.length > 0 && (
        <div className={styles.poemList}>
          {poems.map((poem) => (
            <Link
              href={`/studio/${poem.id}`}
              className={styles.poem}
              key={poem.id}
            >
              <div className={styles.preview}>
                {poem.source_text.split(/(\s+)/).map((part, index) => (
                  <span
                    key={index}
                    className={
                      poem.blackout_data.includes(index)
                        ? styles.blackedOut
                        : ""
                    }
                  >
                    {part}
                  </span>
                ))}
              </div>

              <h2>{poem.title || "Untitled"}</h2>

              <p>
                {new Date(poem.created_at).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
