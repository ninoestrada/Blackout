"use client";

import { useMemo, useState } from "react";

export default function Studio() {
  const sampleText = `
Music has the power to transform a room.
In the quiet spaces between notes,
we often find ourselves searching for meaning.
`;

  return (
    <div>
      <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
        Studio Page.
      </h1>

      <p>{sampleText}</p>
    </div>
  );
}
