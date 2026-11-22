/**
 * Blackout's My Blackouts page.
 * Displays saved poems and allows users to edit, rename, and delete them.
 */

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import ConfirmationModal from "../studio/components/ConfirmationModal";
import PoemCard from "./components/PoemCard";
import RenamePoemModal from "./components/RenamePoemModal";
import useSavedPoems from "./hooks/useSavedPoems";

import styles from "./page.module.css";

/**
 * Displays the user's saved blackout poems with options to edit, rename, or delete them.
 *
 * @returns The My Blackouts page.
 */
export default function MyBlackouts() {
  const router = useRouter();

  const [activeMenuPoemId, setActiveMenuPoemId] = useState<string | null>(null);

  const {
    // Saved poems and loading state
    poems,
    isLoading,
    loadError,
    isSignedIn,

    // Rename state and handlers
    poemToRename,
    newTitle,
    isRenaming,
    renameError,
    renameMessage,
    openRenameModal,
    closeRenameModal,
    handleTitleChange,
    handleRename,

    // Delete state and handlers
    poemToDelete,
    deleteError,
    deleteMessage,
    openDeleteModal,
    closeDeleteModal,
    handleDelete,
  } = useSavedPoems();

  const canDisplayPoems = !isLoading && isSignedIn && !loadError;

  return (
    <main className={styles.content}>
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

      {isSignedIn && loadError && (
        <p className={styles.statusMessage}>{loadError}</p>
      )}

      {canDisplayPoems && poems.length === 0 && (
        <p className={styles.statusMessage}>
          You don&apos;t have any saved blackouts yet.
        </p>
      )}

      {canDisplayPoems && poems.length > 0 && (
        <div className={styles.poemList}>
          {poems.map((poem) => (
            <PoemCard
              key={poem.id}
              poem={poem}
              isMenuOpen={activeMenuPoemId === poem.id}
              onToggleMenu={() =>
                setActiveMenuPoemId((currentId) =>
                  currentId === poem.id ? null : poem.id,
                )
              }
              onEdit={() => {
                setActiveMenuPoemId(null);
                router.push(`/studio/${poem.id}`);
              }}
              onRename={() => {
                openRenameModal(poem);
                setActiveMenuPoemId(null);
              }}
              onDelete={() => {
                openDeleteModal(poem);
                setActiveMenuPoemId(null);
              }}
            />
          ))}
        </div>
      )}

      {poemToRename && (
        <RenamePoemModal
          newTitle={newTitle}
          isRenaming={isRenaming}
          renameError={renameError}
          onTitleChange={handleTitleChange}
          onCancel={closeRenameModal}
          onConfirm={() => void handleRename()}
        />
      )}

      {poemToDelete && (
        <ConfirmationModal
          title="Delete blackout?"
          message="This blackout will be permanently deleted."
          confirmLabel="Delete"
          onCancel={closeDeleteModal}
          onConfirm={handleDelete}
        />
      )}
    </main>
  );
}
