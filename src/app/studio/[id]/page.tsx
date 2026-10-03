"use client";

import { use, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Studio from "../Studio";

type SavedPoem = {
  id: string;
  source_text: string;
  blackout_data: number[];
};

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
        .select("id, source_text, blackout_data")
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

    fetchPoem();
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

  return (
    <Studio
      initialPassage={poem.source_text}
      initialBlackout={poem.blackout_data}
    />
  );
}
