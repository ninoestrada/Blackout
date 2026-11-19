/**
 * Manages Blackout's Studio poem saving.
 * Handles authentication, save requests, and save status messages.
 */

import { useEffect, useRef, useState } from "react";

import { supabase } from "@/lib/supabase";

import savePoem from "../utils/savePoem";
import type { DrawingData, Stroke } from "../types";

type UseSavePoemProps = {
  /** The ID of an existing poem, if one is being edited. */
  poemId?: string;
  /** The current poem's title. */
  title: string;
  /** The current poem's passage. */
  passage: string;
  /** The positions of the blacked-out words. */
  blackedOut: Set<number>;
  /** The drawing strokes added to the poem. */
  strokes: Stroke[];
  /** The width of the drawing canvas. */
  drawingWidth: number;
  /** The height of the drawing canvas. */
  drawingHeight: number;
};

/**
 * Manages saving new poems and updating existing ones.
 *
 * @returns The saved poem ID, save status, message, and functions
 * for saving poems and updating save-related state.
 */
export default function useSavePoem({
  poemId,
  title,
  passage,
  blackedOut,
  strokes,
  drawingWidth,
  drawingHeight,
}: UseSavePoemProps) {
  const [savedPoemId, setSavedPoemId] = useState<string | null>(poemId ?? null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const isSavingRef = useRef(false);

  useEffect(() => {
    if (!saveMessage) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setSaveMessage(null);
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [saveMessage]);

  /**
   * Saves a new poem or updates an existing one.
   * Checks authentication and prevents duplicate save requests.
   */
  async function handleSave(): Promise<void> {
    if (isSavingRef.current) return;

    isSavingRef.current = true;
    setIsSaving(true);

    try {
      const { data, error: authError } = await supabase.auth.getUser();

      if (authError || !data.user) {
        setSaveMessage("Sign in to save your poem.");
        return;
      }

      const drawingData: DrawingData = {
        width: drawingWidth,
        height: drawingHeight,
        strokes,
      };

      const updatedPoemId = await savePoem({
        userId: data.user.id,
        poemId: savedPoemId,
        title,
        passage,
        blackedOut,
        drawingData,
      });

      if (savedPoemId) {
        setSaveMessage("Changes saved.");
      } else {
        setSavedPoemId(updatedPoemId);
        setSaveMessage("Poem saved.");
      }
    } catch (error) {
      console.error("Error saving poem:", error);

      setSaveMessage(
        savedPoemId
          ? "Couldn't save your changes."
          : "Couldn't save your poem.",
      );
    } finally {
      isSavingRef.current = false;
      setIsSaving(false);
    }
  }

  return {
    savedPoemId,
    setSavedPoemId,
    saveMessage,
    setSaveMessage,
    isSaving,
    handleSave,
  };
}
