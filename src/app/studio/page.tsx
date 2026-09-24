"use client";

import { useEffect, useState } from "react";

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
    <main>
        <p>{passage}</p>
    </main>
  );
}
