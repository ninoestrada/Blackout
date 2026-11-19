/**
 * Creates or updates a blackout poem in Supabase.
 */

import { supabase } from "@/lib/supabase";
import type { DrawingData } from "../types";

type SavePoemOptions = {
  userId: string;
  poemId: string | null;
  title: string;
  passage: string;
  blackedOut: Set<number>;
  drawingData: DrawingData;
};

export default async function savePoem({
  userId,
  poemId,
  title,
  passage,
  blackedOut,
  drawingData,
}: SavePoemOptions): Promise<string> {
  const blackoutData = Array.from(blackedOut);

  if (poemId) {
    // Update an existing poem.
    const { data, error } = await supabase
      .from("poems")
      .update({
        title: title.trim() || null,
        blackout_data: blackoutData,
        drawing_data: drawingData,
      })
      .eq("id", poemId)
      .eq("user_id", userId)
      .select("id")
      .maybeSingle();

    if (error || !data) {
      throw error ?? new Error("No poem was updated.");
    }

    return data.id;
  }

  // Create a new poem.
  const { data, error } = await supabase
    .from("poems")
    .insert({
      user_id: userId,
      title: title.trim() || null,
      source_text: passage,
      blackout_data: blackoutData,
      drawing_data: drawingData,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw error ?? new Error("No poem was returned.");
  }

  return data.id;
}
