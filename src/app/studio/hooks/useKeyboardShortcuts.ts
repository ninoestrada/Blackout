/**
 * Manages Blackout's Studio keyboard shortcuts.
 * Handles undo, redo, tool selection, marker settings, and colors.
 */

import { useEffect } from "react";
import type { Dispatch, RefObject, SetStateAction } from "react";

import type { StudioTool } from "../types";

type UseKeyboardShortcutsProps = {
  /** Undoes the most recent change. */
  undo: () => void;
  /** Redoes the last undone change. */
  redo: () => void;
  /** The currently selected Studio tool. */
  tool: StudioTool;
  /** Updates the selected Studio tool. */
  setTool: Dispatch<SetStateAction<StudioTool>>;
  /** Updates the marker size. */
  setMarkerSize: Dispatch<SetStateAction<number>>;
  /** The currently selected marker color. */
  drawingColor: string;
  /** Updates the selected marker color. */
  setDrawingColor: Dispatch<SetStateAction<string>>;
  /** The recently used marker colors. */
  recentColors: string[];
  /** Reference to the color picker used to choose a marker color. */
  colorInputRef: RefObject<HTMLInputElement | null>;
  /** Whether the confirmation modal for starting a new poem is open. */
  showFreshFragmentConfirmation: boolean;
  /** Whether the confirmation modal for clearing the poem is open. */
  showCleanSlateConfirmation: boolean;
};

/**
 * Sets up keyboard shortcuts for editing poems in the Studio.
 * Disables shortcuts while typing or when a confirmation modal is open.
 */
export default function useKeyboardShortcuts({
  undo,
  redo,
  tool,
  setTool,
  setMarkerSize,
  drawingColor,
  setDrawingColor,
  recentColors,
  colorInputRef,
  showFreshFragmentConfirmation,
  showCleanSlateConfirmation,
}: UseKeyboardShortcutsProps) {
  useEffect(() => {
    /**
     * Handles keyboard shortcuts for editing poems in the Studio.
     *
     * @param event - Information about the key being pressed.
     */
    function handleKeyDown(event: KeyboardEvent) {
      // Ignore keyboard shortcuts while a confirmation modal is open.
      if (showFreshFragmentConfirmation || showCleanSlateConfirmation) {
        return;
      }

      const modifier = event.metaKey || event.ctrlKey;
      const target = event.target as HTMLElement;

      const isTyping =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if (isTyping) {
        return;
      }

      if (modifier && event.key.toLowerCase() === "z") {
        event.preventDefault();

        if (event.shiftKey) {
          redo();
        } else {
          undo();
        }
      }

      if (tool === "draw") {
        if (!modifier && event.key === "[") {
          event.preventDefault();
          setMarkerSize((size) => Math.max(1, size - 1));
        }

        if (!modifier && event.key === "]") {
          event.preventDefault();
          setMarkerSize((size) => Math.min(100, size + 1));
        }
      }

      if (!modifier && event.key.toLowerCase() === "s") {
        setTool("select");
      }

      if (!modifier && event.key.toLowerCase() === "d") {
        setTool("draw");
      }

      if (tool === "draw" && !modifier && event.key.toLowerCase() === "c") {
        if (recentColors.length === 0) {
          return;
        }

        const currentIndex = recentColors.indexOf(drawingColor);

        if (event.shiftKey) {
          const previousIndex =
            currentIndex <= 0 ? recentColors.length - 1 : currentIndex - 1;

          setDrawingColor(recentColors[previousIndex]);
        } else {
          const nextIndex =
            currentIndex === -1 || currentIndex === recentColors.length - 1
              ? 0
              : currentIndex + 1;

          setDrawingColor(recentColors[nextIndex]);
        }
      }

      if (tool === "draw" && !modifier && event.key.toLowerCase() === "p") {
        event.preventDefault();
        colorInputRef.current?.click();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    undo,
    redo,
    tool,
    recentColors,
    drawingColor,
    showFreshFragmentConfirmation,
    showCleanSlateConfirmation,
    setTool,
    setMarkerSize,
    setDrawingColor,
    colorInputRef,
  ]);
}
