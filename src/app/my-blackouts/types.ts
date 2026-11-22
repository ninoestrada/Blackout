/**
 * Blackout's shared types for the My Blackouts page.
 * Defines the structure of saved poems retrieved from the database.
 */

import type { DrawingData, Stroke } from "../studio/types";

export type SavedPoem = {
  /** Unique identifier of the poem. */
  id: string;

  /** Title of the poem, if provided. */
  title: string | null;

  /** Original passage used to create the poem. */
  source_text: string;

  /** Indices of the blacked-out words. */
  blackout_data: number[];

  /** Drawing data saved with the poem. */
  drawing_data: Stroke[] | DrawingData;

  /** Date and time the poem was created. */
  created_at: string;
};
