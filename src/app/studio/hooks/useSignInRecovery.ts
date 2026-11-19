/**
 * Manages Blackout's Studio state during sign-in.
 * Saves unfinished poems before sign-in and restores them when the user returns.
 */

import {
  useCallback,
  useEffect,
  type Dispatch,
  type SetStateAction,
} from "react";

import type { StudioSnapshot, Stroke } from "../types";

type StoredStudioSnapshot = {
  /** The indices of blacked-out words stored as an array. */
  blackoutData: number[];
  /** The drawing strokes in the stored snapshot. */
  strokes: Stroke[];
};

type UseSignInRecoveryProps = {
  /** The text initially provided to the Studio. */
  initialPassage?: string | null;
  /** The current poem's text. */
  passage: string;
  /** The current poem's title. */
  title: string;
  /** The ID of an existing poem, if one is being edited. */
  poemId?: string;
  /** The ID of the currently saved poem. */
  savedPoemId: string | null;
  /** The positions of the blacked-out words. */
  blackedOut: Set<number>;
  /** The drawing strokes added to the poem. */
  strokes: Stroke[];
  /** The width of the drawing canvas. */
  drawingWidth: number;
  /** The height of the drawing canvas. */
  drawingHeight: number;
  /** The previous poem states available for undo. */
  undoStack: StudioSnapshot[];
  /** The previously undone states available for redo. */
  redoStack: StudioSnapshot[];
  /** Updates the current text. */
  setPassage: Dispatch<SetStateAction<string>>;
  /** Updates the poem's title. */
  setTitle: Dispatch<SetStateAction<string>>;
  /** Updates the blacked-out word indices. */
  setBlackedOut: Dispatch<SetStateAction<Set<number>>>;
  /** Updates the drawing strokes. */
  setStrokes: Dispatch<SetStateAction<Stroke[]>>;
  /** Updates the drawing canvas width. */
  setDrawingWidth: Dispatch<SetStateAction<number>>;
  /** Updates the drawing canvas height. */
  setDrawingHeight: Dispatch<SetStateAction<number>>;
  /** Updates the saved poem ID. */
  setSavedPoemId: Dispatch<SetStateAction<string | null>>;
  /** Updates the undo history. */
  setUndoStack: Dispatch<SetStateAction<StudioSnapshot[]>>;
  /** Updates the redo history. */
  setRedoStack: Dispatch<SetStateAction<StudioSnapshot[]>>;
  /** Updates the text loading status. */
  setIsLoading: Dispatch<SetStateAction<boolean>>;
};

const STORAGE_KEY = "blackout:studio-before-auth";

/**
 * Prepares a poem snapshot for session storage.
 *
 * @param snapshot - The poem state to save.
 * @returns The snapshot with blacked-out word indices converted to an array.
 */
function serializeSnapshot(snapshot: StudioSnapshot): StoredStudioSnapshot {
  return {
    blackoutData: Array.from(snapshot.blackedOut),
    strokes: snapshot.strokes,
  };
}

/**
 * Converts a saved poem snapshot back into a format the Studio can use.
 *
 * @param snapshot - The saved poem state to restore.
 * @returns The snapshot with blacked-out word indices converted back to a Set.
 */
function deserializeSnapshot(snapshot: StoredStudioSnapshot): StudioSnapshot {
  return {
    blackedOut: new Set(snapshot.blackoutData),
    strokes: snapshot.strokes ?? [],
  };
}

/**
 * Saves unfinished poems before sign-in and restores them when the user returns.
 *
 * @returns A function for restoring the saved Studio state.
 */
export default function useSignInRecovery({
  initialPassage,
  passage,
  title,
  poemId,
  savedPoemId,
  blackedOut,
  strokes,
  drawingWidth,
  drawingHeight,
  undoStack,
  redoStack,
  setPassage,
  setTitle,
  setBlackedOut,
  setStrokes,
  setDrawingWidth,
  setDrawingHeight,
  setSavedPoemId,
  setUndoStack,
  setRedoStack,
  setIsLoading,
}: UseSignInRecoveryProps) {
  useEffect(() => {
    /**
     * Saves the unfinished poem before the user signs in.
     */
    function saveStudioStateBeforeAuth() {
      if (!passage || poemId) {
        return;
      }

      const studioState = {
        passage,
        title,
        savedPoemId,
        blackoutData: Array.from(blackedOut),
        strokes,
        drawingWidth,
        drawingHeight,
        undoStack: undoStack.map(serializeSnapshot),
        redoStack: redoStack.map(serializeSnapshot),
      };

      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(studioState));
    }

    window.addEventListener("blackout:before-auth", saveStudioStateBeforeAuth);

    return () => {
      window.removeEventListener(
        "blackout:before-auth",
        saveStudioStateBeforeAuth,
      );
    };
  }, [
    passage,
    title,
    poemId,
    savedPoemId,
    blackedOut,
    strokes,
    drawingWidth,
    drawingHeight,
    undoStack,
    redoStack,
  ]);

  /**
   * Restores the unfinished poem and its editing history after sign-in.
   *
   * @returns True if the poem was restored, otherwise false.
   */
  const restoreStudioState = useCallback((): boolean => {
    if (initialPassage) {
      return false;
    }

    const isAuthReturn =
      new URLSearchParams(window.location.search).get("authReturn") === "true";

    const savedStudioState = sessionStorage.getItem(STORAGE_KEY);

    if (!isAuthReturn || !savedStudioState) {
      return false;
    }

    try {
      const studioState = JSON.parse(savedStudioState);

      setPassage(studioState.passage);
      setTitle(studioState.title ?? "");
      setBlackedOut(new Set(studioState.blackoutData));
      setStrokes(studioState.strokes ?? []);
      setDrawingWidth(studioState.drawingWidth ?? 0);
      setDrawingHeight(studioState.drawingHeight ?? 0);
      setSavedPoemId(studioState.savedPoemId ?? null);

      setUndoStack((studioState.undoStack ?? []).map(deserializeSnapshot));

      setRedoStack((studioState.redoStack ?? []).map(deserializeSnapshot));

      setIsLoading(false);

      setTimeout(() => {
        sessionStorage.removeItem(STORAGE_KEY);

        const url = new URL(window.location.href);
        url.searchParams.delete("authReturn");
        window.history.replaceState({}, "", url);
      }, 0);

      return true;
    } catch {
      sessionStorage.removeItem(STORAGE_KEY);
      return false;
    }
  }, [
    initialPassage,
    setPassage,
    setTitle,
    setBlackedOut,
    setStrokes,
    setDrawingWidth,
    setDrawingHeight,
    setSavedPoemId,
    setUndoStack,
    setRedoStack,
    setIsLoading,
  ]);

  return { restoreStudioState };
}
