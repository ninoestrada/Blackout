/**
 * Blackout's Studio workspace.
 * Lets users create, edit, save, and export blackout poetry.
 */

"use client";

// React
import { AnimatePresence } from "motion/react";
import { useEffect, useRef, useState } from "react";

// Components
import ConfirmationModal from "./components/ConfirmationModal";
import PoemWorkspace from "./components/PoemWorkspace";
import StudioActions from "./components/StudioActions";
import StudioMessages from "./components/StudioMessages";
import StudioSidebar from "./components/StudioSidebar";

// Hooks
import useConfirmations from "./hooks/useConfirmations";
import useDrawing from "./hooks/useDrawing";
import useExportPoem from "./hooks/useExportPoem";
import useFragment from "./hooks/useFragment";
import useKeyboardShortcuts from "./hooks/useKeyboardShortcuts";
import useSavePoem from "./hooks/useSavePoem";
import useSignInRecovery from "./hooks/useSignInRecovery";
import useUndoRedo from "./hooks/useUndoRedo";

// Styles
import styles from "./page.module.css";

// Types
import type { Stroke, StudioTool } from "./types";

type StudioProps = {
  /** ID of the poem being edited. */
  poemId?: string;
  /** The saved poem's title, if it has one. */
  initialTitle?: string | null;
  /** The passage used to create the poem. */
  initialPassage?: string;
  /** Positions of the previously blacked-out words. */
  initialBlackout?: number[];
  /** Drawings previously saved with the poem. */
  initialDrawing?: Stroke[];
  /** Width of the canvas when the poem was saved. */
  initialDrawingWidth?: number;
  /** Height of the canvas when the poem was saved. */
  initialDrawingHeight?: number;
};

/**
 * Renders the Studio editor and its tools.
 *
 * @returns The Studio.
 */
export default function Studio({
  poemId,
  initialTitle = null,
  initialPassage = "",
  initialBlackout = [],
  initialDrawing = [],
  initialDrawingWidth,
  initialDrawingHeight,
}: StudioProps) {
  // ---------------------------------------- Poem State ----------------------------------------

  const { passage, setPassage, isLoading, setIsLoading, error, loadPassage } =
    useFragment({
      initialPassage: initialPassage ?? "",
    });

  const [title, setTitle] = useState(initialTitle ?? "");
  const [blackedOut, setBlackedOut] = useState<Set<number>>(
    new Set(initialBlackout),
  );
  const [strokes, setStrokes] = useState<Stroke[]>(initialDrawing);

  // ---------------------------------------- Drawing Tools ----------------------------------------

  const [tool, setTool] = useState<StudioTool>("select");
  const [drawingColor, setDrawingColor] = useState("#505050");
  const [recentColors, setRecentColors] = useState<string[]>(["#505050"]);
  const [markerSize, setMarkerSize] = useState(8);

  const colorInputRef = useRef<HTMLInputElement>(null);

  // ---------------------------------------- Undo/Redo & Drawing ----------------------------------------

  const {
    undoStack,
    setUndoStack,
    redoStack,
    setRedoStack,
    saveSnapshot,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useUndoRedo({
    blackedOut,
    setBlackedOut,
    strokes,
    setStrokes,
  });

  const {
    canvasRef,
    drawingWidth,
    setDrawingWidth,
    drawingHeight,
    setDrawingHeight,
    cursorPosition,
    setCursorPosition,
    moveMarkerCursor,
    startDrawing,
    continueDrawing,
    stopDrawing,
  } = useDrawing({
    strokes,
    setStrokes,
    initialDrawingWidth,
    initialDrawingHeight,
    passage,
    isLoading,
    drawingColor,
    markerSize,
    saveSnapshot,
    setRecentColors,
  });

  // ---------------------------------------- Saving & Exporting ----------------------------------------

  const {
    savedPoemId,
    setSavedPoemId,
    saveMessage,
    setSaveMessage,
    isSaving,
    handleSave,
  } = useSavePoem({
    poemId,
    title,
    passage,
    blackedOut,
    strokes,
    drawingWidth,
    drawingHeight,
  });

  const { poemExportRef, exportError, isExporting, handleExport } =
    useExportPoem({
      title,
    });

  // ---------------------------------------- Sign-In Recovery ----------------------------------------

  const { restoreStudioState } = useSignInRecovery({
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
  });

  // ---------------------------------------- Load or Restore Studio ----------------------------------------

  useEffect(() => {
    if (initialPassage) {
      setIsLoading(false);
      return;
    }

    if (restoreStudioState()) return;

    void loadPassage();
  }, [initialPassage, restoreStudioState, loadPassage, setIsLoading]);

  // ---------------------------------------- Editor Actions ----------------------------------------

  /**
   * Loads a new passage and clears the previous marks and drawings
   * if the new passage loads successfully.
   */
  async function getFreshFragment() {
    const text = await loadPassage();

    if (text === null) return;

    setTitle("");
    setSavedPoemId(null);
    setBlackedOut(new Set());
    setStrokes([]);
    setDrawingWidth(0);
    setDrawingHeight(0);
    setUndoStack([]);
    setRedoStack([]);

    setSaveMessage(null);
  }

  /**
   * Blacks out or restores a word and saves the previous state for undo.
   *
   * @param index - The position of the word in the passage.
   */
  function toggleWord(index: number) {
    saveSnapshot();

    const updated = new Set(blackedOut);

    if (updated.has(index)) {
      updated.delete(index);
    } else {
      updated.add(index);
    }

    setBlackedOut(updated);
  }

  /**
   * Clears the blacked-out words and drawings without changing the passage.
   * Saves the previous state so they can be restored with Undo.
   */
  function cleanSlate() {
    saveSnapshot();

    setBlackedOut(new Set());
    setStrokes([]);
  }

  // ---------------------------------------- Confirmations & Keyboard Shortcuts ----------------------------------------

  const {
    showFreshFragmentConfirmation,
    dontShowAgain,
    setDontShowAgain,
    showCleanSlateConfirmation,
    dontShowCleanSlateAgain,
    setDontShowCleanSlateAgain,
    handleFreshFragment,
    confirmFreshFragment,
    closeFreshFragmentConfirmation,
    handleCleanSlate,
    confirmCleanSlate,
    closeCleanSlateConfirmation,
  } = useConfirmations({
    hasEdits: blackedOut.size > 0 || strokes.length > 0,
    onFreshFragment: () => {
      void getFreshFragment();
    },
    onCleanSlate: cleanSlate,
  });

  useKeyboardShortcuts({
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
  });

  const words = passage.split(/(\s+)/);

  // ---------------------------------------- Studio Layout ----------------------------------------

  return (
    <main>
      <section className={styles.content}>
        <StudioMessages
          saveMessage={saveMessage}
          exportError={exportError}
          isLoading={isLoading}
          error={error}
          onRetry={loadPassage}
        />

        {passage && !isLoading && !error && (
          <div className={styles.studioLayout}>
            <StudioSidebar
              tool={tool}
              setTool={setTool}
              drawingColor={drawingColor}
              setDrawingColor={setDrawingColor}
              recentColors={recentColors}
              colorInputRef={colorInputRef}
              markerSize={markerSize}
              setMarkerSize={setMarkerSize}
              undo={undo}
              redo={redo}
              canUndo={canUndo}
              canRedo={canRedo}
            />

            <div className={styles.workspace}>
              <PoemWorkspace
                title={title}
                setTitle={setTitle}
                words={words}
                blackedOut={blackedOut}
                tool={tool}
                toggleWord={toggleWord}
                poemExportRef={poemExportRef}
                canvasRef={canvasRef}
                startDrawing={startDrawing}
                moveMarkerCursor={moveMarkerCursor}
                continueDrawing={continueDrawing}
                stopDrawing={stopDrawing}
                cursorPosition={cursorPosition}
                setCursorPosition={setCursorPosition}
                drawingColor={drawingColor}
              />

              <StudioActions
                poemId={poemId}
                savedPoemId={savedPoemId}
                isSaving={isSaving}
                isExporting={isExporting}
                onFreshFragment={handleFreshFragment}
                onCleanSlate={handleCleanSlate}
                onSave={handleSave}
                onExport={handleExport}
              />
            </div>
          </div>
        )}

        <AnimatePresence>
          {showFreshFragmentConfirmation && (
            <ConfirmationModal
              key="fresh-fragment"
              title="Start a fresh fragment?"
              message="Your current blackout poem will be cleared."
              dontShowAgain={dontShowAgain}
              onDontShowAgainChange={setDontShowAgain}
              onCancel={closeFreshFragmentConfirmation}
              onConfirm={confirmFreshFragment}
            />
          )}

          {showCleanSlateConfirmation && (
            <ConfirmationModal
              key="clean-slate"
              title="Clear your blackout?"
              message="Your current blackout marks will be cleared."
              dontShowAgain={dontShowCleanSlateAgain}
              onDontShowAgainChange={setDontShowCleanSlateAgain}
              onCancel={closeCleanSlateConfirmation}
              onConfirm={confirmCleanSlate}
            />
          )}
        </AnimatePresence>
      </section>
    </main>
  );
}
