"use client";

/**
 * Blackout's drawing preview for saved poems.
 * Displays and scales drawings from saved blackout poems.
 */

import { useEffect, useRef } from "react";

import type { Stroke } from "../../studio/types";

import styles from "../page.module.css";

type DrawingPreviewProps = {
  /** Strokes that make up the saved drawing. */
  strokes: Stroke[];
  /** Width of the original canvas. */
  sourceWidth?: number;
};

/**
 * Renders the saved poem's drawings and scales them to fit the preview.
 *
 * @returns The drawing preview canvas.
 */
export default function DrawingPreview({
  strokes,
  sourceWidth,
}: DrawingPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas || strokes.length === 0) {
      return;
    }

    const previewContainer = canvas.parentElement;

    if (!previewContainer) {
      return;
    }

    const width = previewContainer.clientWidth;
    const height = previewContainer.clientHeight;

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    context.clearRect(0, 0, width, height);

    const originalWidth = sourceWidth ?? 800;
    const scaleFactor = width / originalWidth;

    context.save();
    context.scale(scaleFactor, scaleFactor);

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
  }, [strokes, sourceWidth]);

  return <canvas ref={canvasRef} className={styles.drawingPreview} />;
}
