"use client";

import { useEffect, useRef } from "react";
import { type Stroke } from "../studio/Studio";
import styles from "./page.module.css";

type DrawingPreviewProps = {
  strokes: Stroke[];
  sourceWidth?: number;
};

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

    const preview = canvas.parentElement;

    if (!preview) {
      return;
    }

    const width = preview.clientWidth;
    const height = preview.clientHeight;

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    context.clearRect(0, 0, width, height);

    const originalWidth = sourceWidth ?? 800;
    const scale = width / originalWidth;

    context.save();
    context.scale(scale, scale);

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
