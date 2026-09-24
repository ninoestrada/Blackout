"use client";

import { useEffect, useState } from "react";
import { Space_Mono } from "next/font/google";

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

      console.log("Passage:", text);

      setPassage(text);
    }

    getPassage();
  }, []);

  return (
    <main className="studio">
      <section className="studio-content">
        <p className={spaceMono.className}>{passage}</p>
      </section>
    </main>
  );
}
