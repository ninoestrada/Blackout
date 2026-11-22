/**
 * Blackout's hook for managing saved poems.
 * Handles loading, renaming, and deleting poems, along with errors and notifications.
 */

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

import type { SavedPoem } from "../types";

/**
 * Manages the user's saved poems, including loading, renaming, and deleting them.
 *
 * @returns Saved poems, loading state, modal state, notifications, and action handlers.
 */
export default function useSavedPoems() {
  // Saved poems and loading state
  const [poems, setPoems] = useState<SavedPoem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSignedIn, setIsSignedIn] = useState(true);

  // Rename state
  const [poemToRename, setPoemToRename] = useState<SavedPoem | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameError, setRenameError] = useState<string | null>(null);
  const [renameMessage, setRenameMessage] = useState<string | null>(null);

  // Delete state
  const [poemToDelete, setPoemToDelete] = useState<SavedPoem | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);

  useEffect(() => {
    /**
     * Loads the user's saved poems in order from newest to oldest.
     */
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
        setLoadError("Couldn't load your blackouts.");
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

    const timeoutId = setTimeout(() => {
      setDeleteMessage(null);
      setDeleteError(null);
      setRenameMessage(null);
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [deleteMessage, deleteError, renameMessage]);

  /**
   * Opens the rename modal with the poem's current title.
   *
   * @param poem - The poem to rename.
   */
  function openRenameModal(poem: SavedPoem) {
    setPoemToRename(poem);
    setNewTitle(poem.title ?? "");
    setRenameError(null);
  }

  /**
   * Closes the rename modal unless the new title is being saved.
   */
  function closeRenameModal() {
    if (isRenaming) {
      return;
    }

    setPoemToRename(null);
    setRenameError(null);
  }

  /**
   * Updates the title input and clears any previous rename error.
   *
   * @param title - The title entered by the user.
   */
  function handleTitleChange(title: string) {
    setNewTitle(title);
    setRenameError(null);
  }

  /**
   * Validates and saves the new poem title.
   * Updates the displayed poem title after the change is saved successfully.
   */
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
      closeRenameModal();
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

    const { data: updatedPoem, error } = await supabase
      .from("poems")
      .update({ title: trimmedTitle })
      .eq("id", poemToRename.id)
      .eq("user_id", userData.user.id)
      .select("id, title")
      .single();

    if (error || !updatedPoem) {
      setRenameError("Couldn't rename your blackout. Please try again.");
      setIsRenaming(false);
      return;
    }

    setPoems((currentPoems) =>
      currentPoems.map((poem) =>
        poem.id === updatedPoem.id
          ? { ...poem, title: updatedPoem.title }
          : poem,
      ),
    );

    setIsRenaming(false);
    setPoemToRename(null);
    setRenameMessage("Blackout renamed.");
  }

  /**
   * Opens the modal to confirm deletion of a saved poem.
   *
   * @param poem - The poem to delete.
   */
  function openDeleteModal(poem: SavedPoem) {
    setPoemToDelete(poem);
  }

  /**
   * Closes the delete confirmation modal.
   */
  function closeDeleteModal() {
    setPoemToDelete(null);
  }

  /**
   * Permanently deletes the selected poem from the database.
   * Removes the poem from the My Blackouts page once deleted.
   */
  async function handleDelete() {
    if (!poemToDelete) {
      return;
    }

    setDeleteError(null);
    setDeleteMessage(null);

    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      setDeleteError("Please sign in again to delete your blackout.");
      setPoemToDelete(null);
      return;
    }

    const { data: deletedPoem, error } = await supabase
      .from("poems")
      .delete()
      .eq("id", poemToDelete.id)
      .eq("user_id", userData.user.id)
      .select("id")
      .maybeSingle();

    if (error || !deletedPoem) {
      setDeleteError("Couldn't delete your blackout.");
      setPoemToDelete(null);
      return;
    }

    setPoems((currentPoems) =>
      currentPoems.filter((poem) => poem.id !== deletedPoem.id),
    );

    setPoemToDelete(null);
    setDeleteMessage("Blackout deleted.");
  }

  return {
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
  };
}
