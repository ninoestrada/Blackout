"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Space_Mono } from "next/font/google";
import { supabase } from "@/lib/supabase";
import styles from "./page.module.css";
import ConfirmationModal from "./ConfirmationModal";

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
});

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

type Stroke = {
  points: Point[];
  color: string;
  size: number;
};

type StudioSnapshot = {
  blackedOut: Set<number>;
  strokes: Stroke[];
};

type StudioProps = {
  poemId?: string;
  initialPassage?: string;
  initialBlackout?: number[];
};

export default function Studio({
  poemId,
  initialPassage,
  initialBlackout = [],
}: StudioProps) {
  const [passage, setPassage] = useState(initialPassage ?? "");
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
  const [saveMessage, setSaveMessage] = useState("");
  const [tool, setTool] = useState<"select" | "draw">("select");
  const [drawingColor, setDrawingColor] = useState("#505050");
  const [recentColors, setRecentColors] = useState<string[]>(["#505050"]);
  const [markerSize, setMarkerSize] = useState(8);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const [strokes, setStrokes] = useState<Stroke[]>([]);

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
        setBlackedOut(new Set(studioState.blackoutData));
        setStrokes(studioState.strokes ?? []);

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

    getPassage();
  }, [initialPassage]);

  useEffect(() => {
    function saveStudioStateBeforeAuth() {
      if (!passage || poemId) {
        return;
      }

      const studioState = {
        passage,
        blackoutData: Array.from(blackedOut),
        strokes,

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
  }, [passage, blackedOut, strokes, undoStack, redoStack, poemId]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
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
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [undo, redo, tool]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
  }, [passage]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);

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
  }, [strokes, passage]);

  async function getFreshFragment() {
    setError("");
    setIsLoading(true);
    setShowConfirmation(false);

    try {
      const text = await fetchPassage();

      setPassage(text);
      setBlackedOut(new Set());
      setStrokes([]);
      setUndoStack([]);
      setRedoStack([]);
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

    getFreshFragment();
  }

  function confirmFreshFragment() {
    if (dontShowAgain) {
      localStorage.setItem("skipFreshFragmentConfirmation", "true");
    }

    getFreshFragment();
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
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      console.error("You must be signed in to save a poem.");
      setSaveMessage("Sign in to save your poem.");
      return;
    }

    const user = data.user;
    const blackoutData = Array.from(blackedOut);

    let saveError;

    if (poemId) {
      const { error } = await supabase
        .from("poems")
        .update({
          blackout_data: blackoutData,
        })
        .eq("id", poemId);

      saveError = error;
    } else {
      const { error } = await supabase.from("poems").insert({
        user_id: user.id,
        source_text: passage,
        blackout_data: blackoutData,
      });

      saveError = error;
    }

    if (saveError) {
      console.error("Error saving poem:", saveError);
      setSaveMessage(
        poemId ? "Couldn't save your changes." : "Couldn't save your poem.",
      );
      return;
    }

    setSaveMessage(poemId ? "Changes saved." : "Poem saved.");
  }

  const words = passage.split(/(\s+)/);

  function startDrawing(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    // Add the color being used to recent colors
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
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const newStroke: Stroke = {
      points: [{ x, y }],
      color: drawingColor,
      size: markerSize,
    };

    setStrokes((currentStrokes) => [...currentStrokes, newStroke]);

    context.beginPath();
    context.moveTo(x, y);
  }

  function draw(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!isDrawingRef.current) {
      return;
    }

    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

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

    context.lineTo(x, y);
    context.stroke();
  }

  function stopDrawing() {
    isDrawingRef.current = false;
  }

  return (
    <main>
      <section className={styles.content}>
        {isLoading && (
          <p className={`${styles.statusMessage} ${spaceMono.className}`}>
            Loading fragment...
          </p>
        )}

        {error && (
          <div className={styles.statusMessage}>
            <div className={styles.errorContent}>
              <p className={spaceMono.className}>{error}</p>

              <button
                className={`${styles.fragmentButton} ${styles.retryButton} ${spaceMono.className}`}
                onClick={retryPassage}
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {passage && !isLoading && !error && (
          <div className={styles.drawingToolbar}>
            <button
              className={`${styles.fragmentButton} ${
                tool === "select" ? styles.activeTool : ""
              } ${spaceMono.className}`}
              onClick={() => setTool("select")}
            >
              Select
            </button>

            <button
              className={`${styles.fragmentButton} ${
                tool === "draw" ? styles.activeTool : ""
              } ${spaceMono.className}`}
              onClick={() => setTool("draw")}
            >
              Draw
            </button>

            {tool === "draw" && (
              <>
                <div className={styles.colorControl}>
                  <span className={spaceMono.className}>Color</span>

                  <input
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

                <div className={styles.markerSizeControl}>
                  <span className={spaceMono.className}>Size</span>

                  <input
                    className={`${styles.markerSizeInput} ${spaceMono.className}`}
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

                  <span className={spaceMono.className}>px</span>
                </div>
              </>
            )}
          </div>
        )}

        {!isLoading && !error && (
          <div className={styles.passageContainer}>
            <p className={`${styles.passage} ${spaceMono.className}`}>
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
              onPointerMove={draw}
              onPointerUp={stopDrawing}
              onPointerLeave={stopDrawing}
            />
          </div>
        )}

        {passage && !isLoading && !error && (
          <>
            <div className={styles.fragmentActions}>
              <button
                className={`${styles.fragmentButton} ${spaceMono.className}`}
                onClick={handleSave}
              >
                {poemId ? "Save Changes" : "Save"}
              </button>

              <button
                className={`${styles.fragmentButton} ${spaceMono.className}`}
                onClick={undo}
                disabled={undoStack.length === 0}
              >
                Undo
              </button>

              <button
                className={`${styles.fragmentButton} ${spaceMono.className}`}
                onClick={redo}
                disabled={redoStack.length === 0}
              >
                Redo
              </button>

              <button
                className={`${styles.fragmentButton} ${spaceMono.className}`}
                onClick={handleCleanSlate}
              >
                Clean Slate
              </button>

              {!poemId && (
                <button
                  className={`${styles.fragmentButton} ${spaceMono.className}`}
                  onClick={handleFreshFragment}
                >
                  Fresh Fragment
                </button>
              )}
            </div>

            {saveMessage && (
              <p className={spaceMono.className}>{saveMessage}</p>
            )}
          </>
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
