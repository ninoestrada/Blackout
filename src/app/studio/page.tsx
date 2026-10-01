"use client";

import { useCallback, useEffect, useState } from "react";
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

export default function Studio() {
  const [passage, setPassage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [blackedOut, setBlackedOut] = useState<Set<number>>(new Set());
  const [undoStack, setUndoStack] = useState<Set<number>[]>([]);
  const [redoStack, setRedoStack] = useState<Set<number>[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [showCleanSlateConfirmation, setShowCleanSlateConfirmation] =
    useState(false);
  const [dontShowCleanSlateAgain, setDontShowCleanSlateAgain] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const undo = useCallback(() => {
    if (undoStack.length === 0) {
      return;
    }

    const previous = undoStack[undoStack.length - 1];

    setRedoStack((history) => [...history, new Set(blackedOut)]);

    setBlackedOut(new Set(previous));

    setUndoStack((history) => history.slice(0, -1));
  }, [blackedOut, undoStack]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) {
      return;
    }

    const next = redoStack[redoStack.length - 1];

    setUndoStack((history) => [...history, new Set(blackedOut)]);

    setBlackedOut(new Set(next));

    setRedoStack((history) => history.slice(0, -1));
  }, [blackedOut, redoStack]);

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const modifier = event.metaKey || event.ctrlKey;

      if (modifier && event.key.toLowerCase() === "z") {
        event.preventDefault();

        if (event.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [undo, redo]);

  async function getFreshFragment() {
    setError("");
    setIsLoading(true);
    setShowConfirmation(false);

    try {
      const text = await fetchPassage();

      setPassage(text);
      setBlackedOut(new Set());
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

    if (blackedOut.size > 0 && !skipConfirmation) {
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
    const previous = new Set(blackedOut);

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
    setUndoStack((history) => [...history, new Set(blackedOut)]);

    setRedoStack([]);

    setBlackedOut(new Set());
    setShowCleanSlateConfirmation(false);
  }

  function confirmCleanSlate() {
    if (dontShowCleanSlateAgain) {
      localStorage.setItem("skipCleanSlateConfirmation", "true");
    }

    cleanSlate();
  }

  function handleCleanSlate() {
    if (blackedOut.size === 0) {
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

    const { error: saveError } = await supabase.from("poems").insert({
      user_id: user.id,
      source_text: passage,
      blackout_data: blackoutData,
    });

    if (saveError) {
      console.error("Error saving poem:", saveError);
      setSaveMessage("Couldn't save your poem.");
      return;
    }

    setSaveMessage("Poem saved.");
  }

  const words = passage.split(/(\s+)/);

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

        {!isLoading && !error && (
          <p className={`${styles.passage} ${spaceMono.className}`}>
            {words.map((word, index) => (
              <span
                key={index}
                className={blackedOut.has(index) ? styles.blackedOut : ""}
                onClick={() => toggleWord(index)}
              >
                {word}
              </span>
            ))}
          </p>
        )}

        {passage && !isLoading && !error && (
          <>
            <div className={styles.fragmentActions}>
              <button
                className={`${styles.fragmentButton} ${spaceMono.className}`}
                onClick={handleSave}
              >
                Save
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

              <button
                className={`${styles.fragmentButton} ${spaceMono.className}`}
                onClick={handleFreshFragment}
              >
                Fresh Fragment
              </button>
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
