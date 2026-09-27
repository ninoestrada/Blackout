"use client";

import { useEffect, useState } from "react";
import { Space_Mono } from "next/font/google";
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
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [showCleanSlateConfirmation, setShowCleanSlateConfirmation] =
    useState(false);
  const [dontShowCleanSlateAgain, setDontShowCleanSlateAgain] = useState(false);

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

  async function getFreshFragment() {
    setError("");
    setIsLoading(true);
    setShowConfirmation(false);

    try {
      const text = await fetchPassage();

      setPassage(text);
      setBlackedOut(new Set());
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

  const words = passage.split(/(\s+)/);

  function toggleWord(index: number) {
    setBlackedOut((previous) => {
      const updated = new Set(previous);

      if (updated.has(index)) {
        updated.delete(index);
      } else {
        updated.add(index);
      }

      return updated;
    });
  }

  function cleanSlate() {
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
    const skipConfirmation =
      localStorage.getItem("skipCleanSlateConfirmation") === "true";

    if (blackedOut.size > 0 && !skipConfirmation) {
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
          <div className={styles.fragmentActions}>
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
