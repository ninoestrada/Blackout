/**
 * Manages Blackout's Studio editing history.
 * Saves previous poem states and handles undo and redo actions.
 */

import {
  useCallback,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

import type { StudioSnapshot, Stroke } from "../types";

type UseUndoRedoProps = {
  /** The indices of words that have been blacked out. */
  blackedOut: Set<number>;
  /** Updates the blacked-out word indices. */
  setBlackedOut: Dispatch<SetStateAction<Set<number>>>;
  /** The drawing strokes added to the poem. */
  strokes: Stroke[];
  /** Updates the drawing strokes. */
  setStrokes: Dispatch<SetStateAction<Stroke[]>>;
};

/**
 * Tracks changes to the poem and manages its undo and redo history.
 *
 * @returns The editing history, undo and redo functions, and their availability.
 */
export default function useUndoRedo({
  blackedOut,
  setBlackedOut,
  strokes,
  setStrokes,
}: UseUndoRedoProps) {
  const [undoStack, setUndoStack] = useState<StudioSnapshot[]>([]);
  const [redoStack, setRedoStack] = useState<StudioSnapshot[]>([]);

  /**
   * Saves the current blackout selections and drawings so changes can be undone.
   */
  const saveSnapshot = useCallback(() => {
    const snapshot: StudioSnapshot = {
      blackedOut: new Set(blackedOut),
      strokes,
    };

    setUndoStack((history) => [...history, snapshot]);
    setRedoStack([]);
  }, [blackedOut, strokes]);

  /**
   * Restores the previous poem state and saves the current state for redo.
   */
  const undo = useCallback(() => {
    if (undoStack.length === 0) {
      return;
    }

    const previousSnapshot = undoStack[undoStack.length - 1];

    setRedoStack((history) => [
      ...history,
      {
        blackedOut: new Set(blackedOut),
        strokes,
      },
    ]);

    setBlackedOut(new Set(previousSnapshot.blackedOut));
    setStrokes(previousSnapshot.strokes);

    setUndoStack((history) => history.slice(0, -1));
  }, [blackedOut, strokes, undoStack, setBlackedOut, setStrokes]);

  /**
   * Redoes the last undone change and saves the previous state so it can be undone again.
   */
  const redo = useCallback(() => {
    if (redoStack.length === 0) {
      return;
    }

    const nextSnapshot = redoStack[redoStack.length - 1];

    setUndoStack((history) => [
      ...history,
      {
        blackedOut: new Set(blackedOut),
        strokes,
      },
    ]);

    setBlackedOut(new Set(nextSnapshot.blackedOut));
    setStrokes(nextSnapshot.strokes);

    setRedoStack((history) => history.slice(0, -1));
  }, [blackedOut, strokes, redoStack, setBlackedOut, setStrokes]);

  return {
    undoStack,
    setUndoStack,
    redoStack,
    setRedoStack,
    saveSnapshot,
    undo,
    redo,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
  };
}
