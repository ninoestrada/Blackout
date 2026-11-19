/**
 * Blackout's shared Studio types.
 * Defines types used across Studio components, hooks, and utilities.
 */

export type StudioTool = "select" | "draw";

export type Point = {
  x: number;
  y: number;
};

export type Stroke = {
  points: Point[];
  color: string;
  size: number;
};

export type DrawingData = {
  width: number;
  height: number;
  strokes: Stroke[];
};

export type StudioSnapshot = {
  /** The positions of the blacked-out words. */
  blackedOut: Set<number>;
  /** The drawing strokes in the snapshot. */
  strokes: Stroke[];
};