"use client";

import { useEffect, useState } from "react";
import { Space_Mono } from "next/font/google";
import styles from "./page.module.css";

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default function Studio() {
  const [passage, setPassage] = useState("");
  const [blackedOut, setBlackedOut] = useState<Set<number>>(new Set());
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [showCleanSlateConfirmation, setShowCleanSlateConfirmation] =
    useState(false);
  const [dontShowCleanSlateAgain, setDontShowCleanSlateAgain] = useState(false);

  useEffect(() => {
    async function getPassage() {
      const response = await fetch("/api/passage");
      const text = await response.text();

      setPassage(text);
    }

    getPassage();
  }, []);

  async function getFreshFragment() {
    const response = await fetch("/api/passage");
    const text = await response.text();

    setPassage(text);
    setBlackedOut(new Set());
    setShowConfirmation(false);
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

  return (
    <main>
      <section className={styles.content}>
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

        {passage && (
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
          <div className={styles.modalOverlay}>
            <div className={`${styles.modal} ${spaceMono.className}`}>
              <button
                className={styles.closeButton}
                onClick={closeConfirmation}
                aria-label="Close"
              >
                ×
              </button>

              <h2>Start a fresh fragment?</h2>

              <p>Your current blackout poem will be cleared.</p>

              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={dontShowAgain}
                  onChange={(event) => setDontShowAgain(event.target.checked)}
                />
                Don&apos;t show this again
              </label>

              <div className={styles.modalActions}>
                <button
                  className={`${styles.modalButton} ${spaceMono.className}`}
                  onClick={closeConfirmation}
                >
                  Cancel
                </button>

                <button
                  className={`${styles.modalButton} ${spaceMono.className}`}
                  onClick={confirmFreshFragment}
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {showCleanSlateConfirmation && (
          <div className={styles.modalOverlay}>
            <div className={`${styles.modal} ${spaceMono.className}`}>
              <button
                className={styles.closeButton}
                onClick={closeCleanSlateConfirmation}
                aria-label="Close"
              >
                ×
              </button>

              <h2>Clear your blackout?</h2>

              <p>Your current blackout marks will be cleared.</p>

              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={dontShowCleanSlateAgain}
                  onChange={(event) =>
                    setDontShowCleanSlateAgain(event.target.checked)
                  }
                />
                Don&apos;t show this again
              </label>

              <div className={styles.modalActions}>
                <button
                  className={`${styles.modalButton} ${spaceMono.className}`}
                  onClick={closeCleanSlateConfirmation}
                >
                  Cancel
                </button>

                <button
                  className={`${styles.modalButton} ${spaceMono.className}`}
                  onClick={confirmCleanSlate}
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
