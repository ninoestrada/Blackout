"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import html2canvas from "html2canvas";
import styles from "./page.module.css";
import ConfirmationModal from "./ConfirmationModal";
import { Highlighter } from "lucide-react";

async function fetchPassage() {
  const response = await fetch("/api/passage");

  if (!response.ok) {
    throw new Error("Failed to load fragment");
  }

  return response.text();
}

type Point = {
  x: number;
  y: number;
};

export type Stroke = {
  points: Point[];
  color: string;
  size: number;
};

export type DrawingData = {
  width: number;
  height: number;
  strokes: Stroke[];
};

type StudioSnapshot = {
  blackedOut: Set<number>;
  strokes: Stroke[];
};

type StudioProps = {
  poemId?: string;
  initialTitle?: string | null;
  initialPassage?: string;
  initialBlackout?: number[];
  initialDrawing?: Stroke[];
  initialDrawingWidth?: number;
  initialDrawingHeight?: number;
};

export default function Studio({
  poemId,
  initialTitle = null,
  initialPassage = "",
  initialBlackout = [],
  initialDrawing = [],
  initialDrawingWidth,
  initialDrawingHeight,
}: StudioProps) {
  const [passage, setPassage] = useState(initialPassage ?? "");
  const [title, setTitle] = useState(initialTitle ?? "");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [blackedOut, setBlackedOut] = useState<Set<number>>(
    new Set(initialBlackout),
  );

  const [undoStack, setUndoStack] = useState<StudioSnapshot[]>([]);
  const [redoStack, setRedoStack] = useState<StudioSnapshot[]>([]);

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const [showCleanSlateConfirmation, setShowCleanSlateConfirmation] =
    useState(false);

  const [dontShowCleanSlateAgain, setDontShowCleanSlateAgain] = useState(false);

  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Track the poem after its first successful save.
  // Track the poem after its first successful save.
  const [savedPoemId, setSavedPoemId] = useState<string | null>(poemId ?? null);

  console.log("Studio rendered:", { poemId, savedPoemId });

  const [isSaving, setIsSaving] = useState(false);
  const isSavingRef = useRef(false);

  const [tool, setTool] = useState<"select" | "draw">("select");
  const [drawingColor, setDrawingColor] = useState("#505050");
  const [recentColors, setRecentColors] = useState<string[]>(["#505050"]);
  const [markerSize, setMarkerSize] = useState(8);
  const [cursorPosition, setCursorPosition] = useState<Point | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const poemExportRef = useRef<HTMLDivElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const isDrawingRef = useRef(false);

  const [strokes, setStrokes] = useState<Stroke[]>(initialDrawing);
  const [drawingWidth, setDrawingWidth] = useState(initialDrawingWidth ?? 0);
  const [drawingHeight, setDrawingHeight] = useState(initialDrawingHeight ?? 0);

  const undo = useCallback(() => {
    if (undoStack.length === 0) {
      return;
    }

    const previous = undoStack[undoStack.length - 1];

    setRedoStack((history) => [
      ...history,
      {
        blackedOut: new Set(blackedOut),
        strokes,
      },
    ]);

    setBlackedOut(new Set(previous.blackedOut));
    setStrokes(previous.strokes);

    setUndoStack((history) => history.slice(0, -1));
  }, [blackedOut, strokes, undoStack]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) {
      return;
    }

    const next = redoStack[redoStack.length - 1];

    setUndoStack((history) => [
      ...history,
      {
        blackedOut: new Set(blackedOut),
        strokes,
      },
    ]);

    setBlackedOut(new Set(next.blackedOut));
    setStrokes(next.strokes);

    setRedoStack((history) => history.slice(0, -1));
  }, [blackedOut, strokes, redoStack]);

  useEffect(() => {
    if (!saveMessage) {
      return;
    }

    const timeout = setTimeout(() => {
      setSaveMessage(null);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [saveMessage]);

  useEffect(() => {
    if (initialPassage) {
      setIsLoading(false);
      return;
    }

    const authReturn =
      new URLSearchParams(window.location.search).get("authReturn") === "true";

    const savedStudioState = sessionStorage.getItem(
      "blackout:studio-before-auth",
    );

    if (authReturn && savedStudioState) {
      try {
        const studioState = JSON.parse(savedStudioState);

        setPassage(studioState.passage);
        setTitle(studioState.title ?? "");
        setBlackedOut(new Set(studioState.blackoutData));
        setStrokes(studioState.strokes ?? []);
        setDrawingWidth(studioState.drawingWidth ?? 0);
        setDrawingHeight(studioState.drawingHeight ?? 0);

        setSavedPoemId(studioState.savedPoemId ?? null);

        setUndoStack(
          (studioState.undoStack ?? []).map(
            (snapshot: { blackoutData: number[]; strokes: Stroke[] }) => ({
              blackedOut: new Set(snapshot.blackoutData),
              strokes: snapshot.strokes ?? [],
            }),
          ),
        );

        setRedoStack(
          (studioState.redoStack ?? []).map(
            (snapshot: { blackoutData: number[]; strokes: Stroke[] }) => ({
              blackedOut: new Set(snapshot.blackoutData),
              strokes: snapshot.strokes ?? [],
            }),
          ),
        );

        setIsLoading(false);

        setTimeout(() => {
          sessionStorage.removeItem("blackout:studio-before-auth");

          const url = new URL(window.location.href);
          url.searchParams.delete("authReturn");
          window.history.replaceState({}, "", url);
        }, 0);

        return;
      } catch {
        sessionStorage.removeItem("blackout:studio-before-auth");
      }
    }

    async function getPassage() {
      try {
        const text = await fetchPassage();
        setPassage(text);
      } catch {
        setError("Couldn't load a fragment.");
      } finally {
        setIsLoading(false);
      }
    }

    void getPassage();
  }, [initialPassage]);

  useEffect(() => {
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

        undoStack: undoStack.map((snapshot) => ({
          blackoutData: Array.from(snapshot.blackedOut),
          strokes: snapshot.strokes,
        })),

        redoStack: redoStack.map((snapshot) => ({
          blackoutData: Array.from(snapshot.blackedOut),
          strokes: snapshot.strokes,
        })),
      };

      sessionStorage.setItem(
        "blackout:studio-before-auth",
        JSON.stringify(studioState),
      );
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
    blackedOut,
    strokes,
    drawingWidth,
    drawingHeight,
    undoStack,
    redoStack,
    poemId,
    savedPoemId,
  ]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Disable Studio shortcuts while a confirmation dialog is open.
      if (showConfirmation || showCleanSlateConfirmation) {
        return;
      }

      const modifier = event.metaKey || event.ctrlKey;
      const target = event.target as HTMLElement;

      const isTyping =
        target.tagName === "INPUT" || target.tagName === "TEXTAREA";

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
        if (event.key === "[") {
          event.preventDefault();
          setMarkerSize((size) => Math.max(1, size - 1));
        }

        if (event.key === "]") {
          event.preventDefault();
          setMarkerSize((size) => Math.min(100, size + 1));
        }
      }

      if (event.key.toLowerCase() === "s") {
        setTool("select");
      }

      if (event.key.toLowerCase() === "d") {
        setTool("draw");
      }

      if (tool === "draw" && event.key.toLowerCase() === "c") {
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

      if (tool === "draw" && event.key.toLowerCase() === "p") {
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
    showConfirmation,
    showCleanSlateConfirmation,
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);

    const scaleX = drawingWidth > 0 ? canvas.width / drawingWidth : 1;
    const scaleY = drawingHeight > 0 ? canvas.height / drawingHeight : 1;

    context.save();
    context.scale(scaleX, scaleY);

    for (const stroke of strokes) {
      if (stroke.points.length === 0) {
        continue;
      }

      context.beginPath();
      context.strokeStyle = stroke.color;
      context.lineWidth = stroke.size;
      context.lineCap = "round";
      context.lineJoin = "round";

      context.moveTo(stroke.points[0].x, stroke.points[0].y);

      for (const point of stroke.points.slice(1)) {
        context.lineTo(point.x, point.y);
      }

      context.stroke();
    }

    context.restore();
  }, [strokes, passage, isLoading, drawingWidth, drawingHeight]);

  async function getFreshFragment() {
    setError("");
    setIsLoading(true);
    setShowConfirmation(false);

    try {
      const text = await fetchPassage();

      setPassage(text);
      setTitle("");
      setSavedPoemId(null);
      setBlackedOut(new Set());
      setStrokes([]);
      setDrawingWidth(0);
      setDrawingHeight(0);
      setUndoStack([]);
      setRedoStack([]);

      // A fresh fragment starts a new, unsaved poem.
      setSavedPoemId(null);
      setSaveMessage(null);
    } catch {
      setError("Couldn't load a fragment.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleFreshFragment() {
    const skipConfirmation =
      localStorage.getItem("skipFreshFragmentConfirmation") === "true";

    if ((blackedOut.size > 0 || strokes.length > 0) && !skipConfirmation) {
      setShowConfirmation(true);
      return;
    }

    void getFreshFragment();
  }

  function confirmFreshFragment() {
    if (dontShowAgain) {
      localStorage.setItem("skipFreshFragmentConfirmation", "true");
    }

    void getFreshFragment();
  }

  function toggleWord(index: number) {
    const previous: StudioSnapshot = {
      blackedOut: new Set(blackedOut),
      strokes,
    };

    setUndoStack((history) => [...history, previous]);
    setRedoStack([]);

    const updated = new Set(blackedOut);

    if (updated.has(index)) {
      updated.delete(index);
    } else {
      updated.add(index);
    }

    setBlackedOut(updated);
  }

  function cleanSlate() {
    const previous: StudioSnapshot = {
      blackedOut: new Set(blackedOut),
      strokes,
    };

    setUndoStack((history) => [...history, previous]);
    setRedoStack([]);

    setBlackedOut(new Set());
    setStrokes([]);

    setShowCleanSlateConfirmation(false);
  }

  function confirmCleanSlate() {
    if (dontShowCleanSlateAgain) {
      localStorage.setItem("skipCleanSlateConfirmation", "true");
    }

    cleanSlate();
  }

  function handleCleanSlate() {
    if (blackedOut.size === 0 && strokes.length === 0) {
      return;
    }

    const skipConfirmation =
      localStorage.getItem("skipCleanSlateConfirmation") === "true";

    if (!skipConfirmation) {
      setShowCleanSlateConfirmation(true);
      return;
    }

    cleanSlate();
  }

  function closeConfirmation() {
    setShowConfirmation(false);
    setDontShowAgain(false);
  }

  function closeCleanSlateConfirmation() {
    setShowCleanSlateConfirmation(false);
    setDontShowCleanSlateAgain(false);
  }

  async function retryPassage() {
    setError("");
    setIsLoading(true);

    try {
      const text = await fetchPassage();
      setPassage(text);
    } catch {
      setError("Couldn't load a fragment.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave() {
    if (isSavingRef.current) {
      return;
    }

    isSavingRef.current = true;
    setIsSaving(true);

    try {
      const { data, error: authError } = await supabase.auth.getUser();

      if (authError || !data.user) {
        setSaveMessage("Sign in to save your poem.");
        return;
      }

      const user = data.user;
      const blackoutData = Array.from(blackedOut);

      const drawingData: DrawingData = {
        width: drawingWidth,
        height: drawingHeight,
        strokes,
      };

      if (savedPoemId) {
        // UPDATE an existing poem.
        const { data: updatedPoem, error } = await supabase
          .from("poems")
          .update({
            title: title.trim() || null,
            blackout_data: blackoutData,
            drawing_data: drawingData,
          })
          .eq("id", savedPoemId)
          .eq("user_id", user.id)
          .select("id")
          .maybeSingle();

        if (error || !updatedPoem) {
          console.error(
            "Error updating poem:",
            error ?? new Error("No poem was updated."),
          );

          setSaveMessage("Couldn't save your changes.");
          return;
        }

        console.log("UPDATE SUCCESSFUL:", updatedPoem.id);
        setSaveMessage("Changes saved.");
      } else {
        // INSERT a new poem.
        const { data: newPoem, error } = await supabase
          .from("poems")
          .insert({
            user_id: user.id,
            title: title.trim() || null,
            source_text: passage,
            blackout_data: blackoutData,
            drawing_data: drawingData,
          })
          .select("id")
          .single();

        if (error || !newPoem) {
          console.error(
            "Error creating poem:",
            error ?? new Error("No poem was returned."),
          );

          setSaveMessage("Couldn't save your poem.");
          return;
        }

        // Keep this ID so the next save updates the same poem.
        setSavedPoemId(newPoem.id);

        setSaveMessage("Poem saved.");
      }
    } catch (error) {
      console.error("Unexpected error saving poem:", error);
      setSaveMessage("Couldn't save your poem.");
    } finally {
      isSavingRef.current = false;
      setIsSaving(false);
    }
  }

  async function handleExport() {
    const poemElement = poemExportRef.current;

    if (!poemElement) {
      setExportError("Couldn't export your poem. Please try again.");
      return;
    }

    setExportError(null);
    setIsExporting(true);

    try {
      await document.fonts?.ready;

      const backgroundColor =
        getComputedStyle(document.documentElement)
          .getPropertyValue("--color-background")
          .trim() || "#f0f0f0";

      const canvas = await html2canvas(poemElement, {
        backgroundColor,
        scale: 2,
        onclone: (clonedDocument) => {
          const clonedPoem = clonedDocument.querySelector("[data-poem-export]");
          const titleInput = clonedPoem?.querySelector("input");

          if (clonedPoem) {
            const poemBounds = poemElement.getBoundingClientRect();
            clonedPoem.setAttribute(
              "style",
              `box-sizing: content-box; width: ${poemBounds.width}px; padding: 64px 64px 80px;`,
            );
          }

          if (clonedPoem && titleInput) {
            const exportedTitle = clonedDocument.createElement("h1");
            exportedTitle.className = styles.poemExportTitle;
            exportedTitle.textContent = title.trim() || "Untitled";
            titleInput.replaceWith(exportedTitle);
          }

          clonedPoem?.querySelector("[data-poem-ignore]")?.remove();
        },
      });

      const filename =
        title
          .trim()
          .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "-")
          .replace(/[. ]+$/g, "") || "blackout-poem";
      const downloadLink = document.createElement("a");

      downloadLink.download = `${filename}.png`;
      downloadLink.href = canvas.toDataURL("image/png");
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
    } catch (exportError) {
      console.error("Error exporting poem:", exportError);
      setExportError("Couldn't export your poem. Please try again.");
    } finally {
      setIsExporting(false);
    }
  }

  const words = passage.split(/(\s+)/);

  function moveMarkerCursor(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const rect = canvas.getBoundingClientRect();

    setCursorPosition({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  }

  function startDrawing(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    // Add the color being used to recent colors.
    setRecentColors((colors) =>
      [
        drawingColor,
        ...colors.filter((recentColor) => recentColor !== drawingColor),
      ].slice(0, 5),
    );

    const previous: StudioSnapshot = {
      blackedOut: new Set(blackedOut),
      strokes,
    };

    setUndoStack((history) => [...history, previous]);
    setRedoStack([]);

    isDrawingRef.current = true;

    const rect = canvas.getBoundingClientRect();

    const coordinateWidth = drawingWidth || rect.width;
    const coordinateHeight = drawingHeight || rect.height;

    if (drawingWidth === 0) {
      setDrawingWidth(rect.width);
    }

    if (drawingHeight === 0) {
      setDrawingHeight(rect.height);
    }

    const x = ((event.clientX - rect.left) / rect.width) * coordinateWidth;
    const y = ((event.clientY - rect.top) / rect.height) * coordinateHeight;

    const newStroke: Stroke = {
      points: [{ x, y }],
      color: drawingColor,
      size: markerSize,
    };

    setStrokes((currentStrokes) => [...currentStrokes, newStroke]);
  }

  function draw(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!isDrawingRef.current) {
      return;
    }

    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const rect = canvas.getBoundingClientRect();

    const coordinateWidth = drawingWidth || rect.width;
    const coordinateHeight = drawingHeight || rect.height;

    const x = ((event.clientX - rect.left) / rect.width) * coordinateWidth;
    const y = ((event.clientY - rect.top) / rect.height) * coordinateHeight;

    setStrokes((currentStrokes) => {
      const updatedStrokes = [...currentStrokes];
      const currentStroke = updatedStrokes[updatedStrokes.length - 1];

      if (!currentStroke) {
        return currentStrokes;
      }

      updatedStrokes[updatedStrokes.length - 1] = {
        ...currentStroke,
        points: [...currentStroke.points, { x, y }],
      };

      return updatedStrokes;
    });
  }

  function stopDrawing() {
    isDrawingRef.current = false;
  }

  return (
    <main>
      <section className={styles.content}>
        {saveMessage && (
          <div className={styles.toast} role="status">
            {saveMessage}
          </div>
        )}

        {exportError && (
          <div className={styles.toast} role="alert">
            {exportError}
          </div>
        )}

        {isLoading && (
          <p className={styles.statusMessage}>Loading fragment...</p>
        )}

        {error && (
          <div className={styles.statusMessage}>
            <div className={styles.errorContent}>
              <p>{error}</p>

              <button
                className={`${styles.fragmentButton} ${styles.retryButton}`}
                onClick={retryPassage}
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {passage && !isLoading && !error && (
          <div className={styles.studioLayout}>
            <aside className={styles.toolPanel}>
              <div className={styles.toolSection}>
                <span className={styles.toolLabel}>Tools</span>

                <div className={styles.toolButtons}>
                  <button
                    type="button"
                    className={`${styles.toolButton} ${
                      tool === "select" ? styles.activeTool : ""
                    }`}
                    onClick={() => setTool("select")}
                  >
                    Select
                  </button>

                  <button
                    type="button"
                    className={`${styles.toolButton} ${
                      tool === "draw" ? styles.activeTool : ""
                    }`}
                    onClick={() => setTool("draw")}
                  >
                    Draw
                  </button>
                </div>
              </div>

              {tool === "draw" && (
                <>
                  <div className={styles.toolSection}>
                    <span className={styles.toolLabel}>Color</span>

                    <div className={styles.colorControl}>
                      <input
                        ref={colorInputRef}
                        className={styles.colorInput}
                        type="color"
                        value={drawingColor}
                        onChange={(event) => {
                          setDrawingColor(event.target.value);
                        }}
                        aria-label="Drawing color"
                      />

                      <div className={styles.recentColors}>
                        {recentColors.map((color) => (
                          <button
                            key={color}
                            type="button"
                            className={styles.colorSwatch}
                            style={{ backgroundColor: color }}
                            onClick={() => setDrawingColor(color)}
                            aria-label={`Use color ${color}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className={styles.toolSection}>
                    <label className={styles.toolLabel} htmlFor="marker-size">
                      Marker Size
                    </label>

                    <div className={styles.markerSizeControl}>
                      <input
                        id="marker-size"
                        className={styles.markerSizeInput}
                        type="number"
                        min="1"
                        max="100"
                        value={markerSize}
                        onChange={(event) => {
                          const size = Number(event.target.value);

                          if (size >= 1 && size <= 100) {
                            setMarkerSize(size);
                          }
                        }}
                        aria-label="Marker size"
                      />

                      <span>px</span>
                    </div>
                  </div>
                </>
              )}

              <div className={styles.toolSection}>
                <span className={styles.toolLabel}>History</span>

                <div className={styles.historyButtons}>
                  <button
                    type="button"
                    className={styles.toolButton}
                    onClick={undo}
                    disabled={undoStack.length === 0}
                  >
                    Undo
                  </button>

                  <button
                    type="button"
                    className={styles.toolButton}
                    onClick={redo}
                    disabled={redoStack.length === 0}
                  >
                    Redo
                  </button>
                </div>
              </div>
            </aside>

            <div className={styles.workspace}>
              <div
                ref={poemExportRef}
                className={styles.poemExport}
                data-poem-export
              >
                <div className={styles.poemTitleContainer}>
                  <input
                    type="text"
                    className={styles.poemTitleInput}
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Untitled"
                    aria-label="Poem title"
                    maxLength={100}
                  />
                </div>

                <div className={styles.passageContainer}>
                  <p className={styles.passage}>
                    {words.map((word, index) => (
                      <span
                        key={index}
                        className={blackedOut.has(index) ? styles.blackedOut : ""}
                        onClick={() => {
                          if (tool === "select") {
                            toggleWord(index);
                          }
                        }}
                      >
                        {word}
                      </span>
                    ))}
                  </p>

                  <canvas
                    ref={canvasRef}
                    className={`${styles.drawingCanvas} ${
                      tool === "draw" ? styles.drawingCanvasActive : ""
                    }`}
                    onPointerDown={startDrawing}
                    onPointerMove={(event) => {
                      moveMarkerCursor(event);
                      draw(event);
                    }}
                    onPointerUp={stopDrawing}
                    onPointerLeave={() => {
                      stopDrawing();
                      setCursorPosition(null);
                    }}
                  />

                  {tool === "draw" && cursorPosition && (
                    <Highlighter
                      className={styles.markerCursor}
                      size={24}
                      style={{
                        left: cursorPosition.x,
                        top: cursorPosition.y,
                        color: drawingColor,
                      }}
                      data-poem-ignore
                    />
                  )}
                </div>
              </div>

              <div className={styles.fragmentActions}>
                {!poemId && (
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={handleFreshFragment}
                    disabled={isSaving}
                  >
                    Fresh Fragment
                  </button>
                )}

                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={handleCleanSlate}
                  disabled={isSaving}
                >
                  Clean Slate
                </button>

                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving
                    ? "Saving..."
                    : savedPoemId
                      ? "Save Changes"
                      : "Save"}
                </button>

                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={handleExport}
                  disabled={isExporting}
                >
                  {isExporting ? "Exporting..." : "Export PNG"}
                </button>
              </div>
            </div>
          </div>
        )}

        {showConfirmation && (
          <ConfirmationModal
            title="Start a fresh fragment?"
            message="Your current blackout poem will be cleared."
            dontShowAgain={dontShowAgain}
            onDontShowAgainChange={setDontShowAgain}
            onCancel={closeConfirmation}
            onConfirm={confirmFreshFragment}
          />
        )}

        {showCleanSlateConfirmation && (
          <ConfirmationModal
            title="Clear your blackout?"
            message="Your current blackout marks will be cleared."
            dontShowAgain={dontShowCleanSlateAgain}
            onDontShowAgainChange={setDontShowCleanSlateAgain}
            onCancel={closeCleanSlateConfirmation}
            onConfirm={confirmCleanSlate}
          />
        )}
      </section>
    </main>
  );
}
