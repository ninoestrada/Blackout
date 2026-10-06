"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Ellipsis, Trash2 } from "lucide-react";
import styles from "./page.module.css";
import ConfirmationModal from "../studio/ConfirmationModal";
import { type DrawingData, type Stroke } from "../studio/Studio";
import { Space_Mono } from "next/font/google";
import DrawingPreview from "./DrawingPreview";

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
});

type SavedPoem = {
  id: string;
  title: string | null;
  source_text: string;
  blackout_data: number[];
  drawing_data: Stroke[] | DrawingData;
  created_at: string;
};

export default function MyBlackouts() {
  const [poems, setPoems] = useState<SavedPoem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSignedIn, setIsSignedIn] = useState(true);
  const [poemToDelete, setPoemToDelete] = useState<SavedPoem | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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
        .select(
          "id, title, source_text, blackout_data, drawing_data, created_at",
        )
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

  useEffect(() => {
    if (!deleteMessage && !deleteError) {
      return;
    }

    const timeout = setTimeout(() => {
      setDeleteMessage(null);
      setDeleteError(null);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [deleteMessage, deleteError]);

  async function handleDelete() {
    if (!poemToDelete) {
      return;
    }

    setDeleteError(null);
    setDeleteMessage(null);

    const { error } = await supabase
      .from("poems")
      .delete()
      .eq("id", poemToDelete.id);

    if (error) {
      setDeleteError("Couldn't delete your blackout.");
      setPoemToDelete(null);
      return;
    }

    setPoems((currentPoems) =>
      currentPoems.filter((poem) => poem.id !== poemToDelete.id),
    );

    setPoemToDelete(null);
    setDeleteMessage("Blackout deleted.");
  }

  return (
    <main className={`${styles.content} ${spaceMono.className}`}>
      <h1 className={styles.heading}>My Blackouts</h1>

      {deleteMessage && (
        <div className={styles.toast} role="status">
          {deleteMessage}
        </div>
      )}

      {deleteError && (
        <div className={styles.toast} role="alert">
          {deleteError}
        </div>
      )}

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
            <div className={styles.poem} key={poem.id}>
              <Link href={`/studio/${poem.id}`} className={styles.poemLink}>
                <div className={styles.preview}>
                  <div className={styles.previewArtwork}>
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

                    <DrawingPreview
                      strokes={
                        Array.isArray(poem.drawing_data)
                          ? poem.drawing_data
                          : poem.drawing_data.strokes
                      }
                      sourceWidth={
                        Array.isArray(poem.drawing_data)
                          ? undefined
                          : poem.drawing_data.width
                      }
                      sourceHeight={
                        Array.isArray(poem.drawing_data)
                          ? undefined
                          : poem.drawing_data.height
                      }
                    />
                  </div>
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

              <button
                type="button"
                className={styles.menuButton}
                onClick={() =>
                  setOpenMenuId((currentId) =>
                    currentId === poem.id ? null : poem.id,
                  )
                }
                aria-label="More options"
              >
                <Ellipsis size={20} />
              </button>

              {openMenuId === poem.id && (
                <div className={styles.poemMenu}>
                  <button
                    type="button"
                    onClick={() => {
                      setPoemToDelete(poem);
                      setOpenMenuId(null);
                    }}
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {poemToDelete && (
        <ConfirmationModal
          title="Delete blackout?"
          message="This blackout will be permanently deleted."
          confirmLabel="Delete"
          onCancel={() => setPoemToDelete(null)}
          onConfirm={handleDelete}
        />
      )}
    </main>
  );
}
