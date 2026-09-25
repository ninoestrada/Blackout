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

  useEffect(() => {
    async function getPassage() {
      const response = await fetch("/api/passage");
      const text = await response.text();

      setPassage(text);
    }

    getPassage();
  }, []);

  return (
    <main>
      <section className={styles.content}>
        <p className={`${styles.passage} ${spaceMono.className}`}>{passage}</p>
      </section>
    </main>
  );
}
