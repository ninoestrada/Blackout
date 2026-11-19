/**
 * Manages Blackout's poem saving.
 * Saves new poems or updates previously saved poems.
 */

import { supabase } from "@/lib/supabase";

import type { DrawingData } from "../types";

type SavePoemOptions = {
  /** The ID of the user saving the poem. */
  userId: string;
  /** The ID of an existing poem, or null for a new poem. */
  poemId: string | null;
  /** The poem's title. */
  title: string;
  /** The original text used to create the poem. */
  passage: string;
  /** The positions of the blacked-out words. */
  blackedOut: Set<number>;
  /** The poem's drawing data. */
  drawingData: DrawingData;
};

/**
 * Saves a poem for the first time or updates a previously saved poem.
 *
 * @returns The ID of the saved poem.
 * @throws If the poem cannot be saved.
 */
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
