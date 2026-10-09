"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Ellipsis, Pencil, Trash2, SquarePen } from "lucide-react";
import { useRouter } from "next/navigation";
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
  const [poemToRename, setPoemToRename] = useState<SavedPoem | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameError, setRenameError] = useState<string | null>(null);

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [renameMessage, setRenameMessage] = useState<string | null>(null);

  const renameInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

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

    void fetchPoems();
  }, []);

  useEffect(() => {
    if (!deleteMessage && !deleteError && !renameMessage) {
      return;
    }

    const timeout = setTimeout(() => {
      setDeleteMessage(null);
      setDeleteError(null);
      setRenameMessage(null);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [deleteMessage, deleteError, renameMessage]);

  function openRenameDialog(poem: SavedPoem) {
    setPoemToRename(poem);
    setNewTitle(poem.title ?? "");
    setRenameError(null);
    setOpenMenuId(null);
  }

  function closeRenameDialog() {
    if (isRenaming) {
      return;
    }

    setPoemToRename(null);
    setRenameError(null);
  }

  async function handleRename() {
    if (!poemToRename || isRenaming) {
      return;
    }

    const trimmedTitle = newTitle.trim();

    if (!trimmedTitle) {
      setRenameError("Please enter a title.");
      return;
    }

    if (trimmedTitle.length > 100) {
      setRenameError("Title must be 100 characters or fewer.");
      return;
    }

    if (trimmedTitle === poemToRename.title) {
      closeRenameDialog();
      return;
    }

    setIsRenaming(true);
    setRenameError(null);
    setRenameMessage(null);

    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      setRenameError("Please sign in again to rename your blackout.");
      setIsRenaming(false);
      return;
    }

    const { data, error } = await supabase
      .from("poems")
      .update({ title: trimmedTitle })
      .eq("id", poemToRename.id)
      .eq("user_id", userData.user.id)
      .select("id, title")
      .single();

    if (error || !data) {
      setRenameError("Couldn't rename your blackout. Please try again.");
      setIsRenaming(false);
      return;
    }

    setPoems((currentPoems) =>
      currentPoems.map((poem) =>
        poem.id === data.id ? { ...poem, title: data.title } : poem,
      ),
    );

    setIsRenaming(false);
    setPoemToRename(null);
    setRenameMessage("Blackout renamed.");
  }

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

      {renameMessage && (
        <div className={styles.toast} role="status">
          {renameMessage}
        </div>
      )}

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
                  />
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
                data-poem-menu={poem.id}
                onClick={() =>
                  setOpenMenuId((currentId) =>
                    currentId === poem.id ? null : poem.id,
                  )
                }
                aria-label={`More options for ${poem.title || "Untitled"}`}
                aria-expanded={openMenuId === poem.id}
                aria-haspopup="true"
              >
                <Ellipsis size={20} />
              </button>

              {openMenuId === poem.id && (
                <div className={styles.poemMenu}>
                  <button
                    type="button"
                    onClick={() => {
                      setOpenMenuId(null);
                      router.push(`/studio/${poem.id}`);
                    }}
                  >
                    <SquarePen size={14} />
                    Edit
                  </button>

                  <button type="button" onClick={() => openRenameDialog(poem)}>
                    <Pencil size={14} />
                    Rename
                  </button>

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

      {poemToRename && (
        <ConfirmationModal
          title="Rename blackout"
          message="Enter a new title for your saved blackout."
          confirmLabel="Save"
          onCancel={closeRenameDialog}
          onConfirm={() => void handleRename()}
          initialFocusRef={renameInputRef}
          confirmDisabled={!newTitle.trim()}
          isProcessing={isRenaming}
        >
          <div className={styles.renameField}>
            <label htmlFor="rename-input">Title</label>

            <input
              ref={renameInputRef}
              id="rename-input"
              type="text"
              value={newTitle}
              onChange={(event) => {
                setNewTitle(event.target.value);
                setRenameError(null);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void handleRename();
                }
              }}
              maxLength={100}
              disabled={isRenaming}
            />

            {renameError && (
              <p className={styles.renameError} role="alert">
                {renameError}
              </p>
            )}
          </div>
        </ConfirmationModal>
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
