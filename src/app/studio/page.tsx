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

  useEffect(() => {
    async function getPassage() {
      const response = await fetch("/api/passage");
      const text = await response.text();

      setPassage(text);
    }

    getPassage();
  }, []);

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
      </section>
    </main>
  );
}
