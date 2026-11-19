/**
 * Manages drawing on Blackout's Studio canvas.
 * Handles marker movement, drawing strokes, and canvas rendering.
 */

import { useEffect, useRef, useState } from "react";
import type { Dispatch, PointerEvent, SetStateAction } from "react";

import type { Point, Stroke } from "../types";

type UseDrawingProps = {
  /** The poem's current drawing strokes. */
  strokes: Stroke[];
  /** Updates the poem's drawing strokes. */
  setStrokes: Dispatch<SetStateAction<Stroke[]>>;
  /** The saved width of the drawing canvas. */
  initialDrawingWidth?: number;
  /** The saved height of the drawing canvas. */
  initialDrawingHeight?: number;
  /** The current poem passage. */
  passage: string;
  /** Whether the passage is loading. */
  isLoading: boolean;
  /** The selected marker color. */
  drawingColor: string;
  /** The selected marker size. */
  markerSize: number;
  /** Saves the current poem state so drawing changes can be undone. */
  saveSnapshot: () => void;
  /** Updates the list of recently used colors. */
  setRecentColors: Dispatch<SetStateAction<string[]>>;
};

/**
 * Manages drawing strokes, marker movement, and canvas rendering.
 *
 * @returns The drawing state, canvas reference, and functions for drawing.
 */
export default function useDrawing({
  strokes,
  setStrokes,
  initialDrawingWidth,
  initialDrawingHeight,
  passage,
  isLoading,
  drawingColor,
  markerSize,
  saveSnapshot,
  setRecentColors,
}: UseDrawingProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);

  const [drawingWidth, setDrawingWidth] = useState(initialDrawingWidth ?? 0);
  const [drawingHeight, setDrawingHeight] = useState(initialDrawingHeight ?? 0);
  const [cursorPosition, setCursorPosition] = useState<Point | null>(null);

  // Redraw the strokes when the canvas or poem changes.
  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);

    const scaleX = drawingWidth > 0 ? canvas.width / drawingWidth : 1;
    const scaleY = drawingHeight > 0 ? canvas.height / drawingHeight : 1;

    context.save();
    context.scale(scaleX, scaleY);

    for (const stroke of strokes) {
      if (stroke.points.length === 0) {
        continue;
      }

      context.beginPath();
      context.strokeStyle = stroke.color;
      context.lineWidth = stroke.size;
      context.lineCap = "round";
      context.lineJoin = "round";

      context.moveTo(stroke.points[0].x, stroke.points[0].y);

      for (const point of stroke.points.slice(1)) {
        context.lineTo(point.x, point.y);
      }

      context.stroke();
    }

    context.restore();
  }, [strokes, passage, isLoading, drawingWidth, drawingHeight]);

  /**
   * Tracks the marker's position as it moves across the canvas.
   *
   * @param event - Information about the pointer's current position.
   */
  function moveMarkerCursor(event: PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const rect = canvas.getBoundingClientRect();

    setCursorPosition({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  }

  /**
   * Starts a new drawing stroke and saves the previous state for undo.
   *
   * @param event - The mouse or pointer position when drawing begins.
   */
  function startDrawing(event: PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    setRecentColors((colors) =>
      [
        drawingColor,
        ...colors.filter((recentColor) => recentColor !== drawingColor),
      ].slice(0, 5),
    );

    saveSnapshot();

    isDrawingRef.current = true;

    const rect = canvas.getBoundingClientRect();

    const coordinateWidth = drawingWidth || rect.width;
    const coordinateHeight = drawingHeight || rect.height;

    if (drawingWidth === 0) {
      setDrawingWidth(rect.width);
    }

    if (drawingHeight === 0) {
      setDrawingHeight(rect.height);
    }

    const x = ((event.clientX - rect.left) / rect.width) * coordinateWidth;
    const y = ((event.clientY - rect.top) / rect.height) * coordinateHeight;

    const newStroke: Stroke = {
      points: [{ x, y }],
      color: drawingColor,
      size: markerSize,
    };

    setStrokes((currentStrokes) => [...currentStrokes, newStroke]);
  }

  /**
   * Extends the current drawing stroke as the mouse or pointer moves.
   *
   * @param event - The mouse or pointer position while drawing.
   */
  function continueDrawing(event: PointerEvent<HTMLCanvasElement>) {
    if (!isDrawingRef.current) {
      return;
    }

    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const rect = canvas.getBoundingClientRect();

    const coordinateWidth = drawingWidth || rect.width;
    const coordinateHeight = drawingHeight || rect.height;

    const x = ((event.clientX - rect.left) / rect.width) * coordinateWidth;
    const y = ((event.clientY - rect.top) / rect.height) * coordinateHeight;

    setStrokes((currentStrokes) => {
      const updatedStrokes = [...currentStrokes];
      const currentStroke = updatedStrokes[updatedStrokes.length - 1];

      if (!currentStroke) {
        return currentStrokes;
      }

      updatedStrokes[updatedStrokes.length - 1] = {
        ...currentStroke,
        points: [...currentStroke.points, { x, y }],
      };

      return updatedStrokes;
    });
  }

  /**
   * Stops the current drawing stroke.
   */
  function stopDrawing() {
    isDrawingRef.current = false;
  }

  return {
    canvasRef,
    strokes,
    setStrokes,
    drawingWidth,
    setDrawingWidth,
    drawingHeight,
    setDrawingHeight,
    cursorPosition,
    setCursorPosition,
    moveMarkerCursor,
    startDrawing,
    continueDrawing,
    stopDrawing,
  };
}
