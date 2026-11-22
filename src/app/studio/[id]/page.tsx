/**
 * Loads saved poems into Blackout's Studio.
 * Restores the poem's text, blacked-out words, and drawings for editing.
 */

"use client";

import { use, useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

import Studio from "../Studio";
import type { DrawingData, Stroke } from "../types";

type SavedPoem = {
  /** Unique ID of the saved poem. */
  id: string;
  /** Title of the poem, if provided. */
  title: string | null;
  /** Original text used to create the poem. */
  source_text: string;
  /** Positions of the words that have been blacked out. */
  blackout_data: number[];
  /** Drawings saved with the poem, including their strokes and canvas dimensions when available. */
  drawing_data: Stroke[] | DrawingData;
};

/**
 * Loads a saved poem and displays it in the Studio editor.
 *
 * @returns The Studio editor, a loading or error message, or null.
 */
export default function SavedStudio({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [poem, setPoem] = useState<SavedPoem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchPoem() {
      const { data, error } = await supabase
        .from("poems")
        .select("id, title, source_text, blackout_data, drawing_data")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error loading poem:", error);
        setError("Couldn't load this blackout.");
        setIsLoading(false);
        return;
      }

      setPoem(data);
      setIsLoading(false);
    }

    void fetchPoem();
  }, [id]);

  if (isLoading) {
    return <p>Loading blackout...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!poem) {
    return null;
  }

  const initialDrawing = Array.isArray(poem.drawing_data)
    ? poem.drawing_data
    : poem.drawing_data.strokes;

  const initialDrawingWidth = Array.isArray(poem.drawing_data)
    ? 800
    : poem.drawing_data.width;

  const initialDrawingHeight = Array.isArray(poem.drawing_data)
    ? undefined
    : poem.drawing_data.height;

  return (
    <Studio
      poemId={poem.id}
      initialTitle={poem.title}
      initialPassage={poem.source_text}
      initialBlackout={poem.blackout_data}
      initialDrawing={initialDrawing}
      initialDrawingWidth={initialDrawingWidth}
      initialDrawingHeight={initialDrawingHeight}
    />
  );
}
