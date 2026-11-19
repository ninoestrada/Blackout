"use client";

/**
 * Blackout's poem workspace.
 * Displays the editable poem, blackout selections, and drawing canvas.
 */

import type { PointerEvent, RefObject } from "react";
import { Highlighter } from "lucide-react";

import type { Point, StudioTool } from "../types";
import styles from "../page.module.css";

type PoemWorkspaceProps = {
  title: string;
  setTitle: (title: string) => void;

  words: string[];
  blackedOut: Set<number>;
  tool: StudioTool;
  toggleWord: (index: number) => void;

  poemExportRef: RefObject<HTMLDivElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;

  cursorPosition: Point | null;
  setCursorPosition: (position: Point | null) => void;
  drawingColor: string;

  startDrawing: (event: PointerEvent<HTMLCanvasElement>) => void;
  moveMarkerCursor: (event: PointerEvent<HTMLCanvasElement>) => void;
  continueDrawing: (event: PointerEvent<HTMLCanvasElement>) => void;
  stopDrawing: () => void;
};

/**
 * Displays the poem's editable text and drawing canvas.
 *
 * @returns The poem workspace JSX.
 */
export default function PoemWorkspace({
  title,
  setTitle,
  words,
  blackedOut,
  tool,
  toggleWord,
  poemExportRef,
  canvasRef,
  cursorPosition,
  setCursorPosition,
  drawingColor,
  startDrawing,
  moveMarkerCursor,
  continueDrawing,
  stopDrawing,
}: PoemWorkspaceProps) {
  return (
    <div ref={poemExportRef} className={styles.poemExport} data-poem-export>
      <div className={styles.poemTitleContainer}>
        <input
          type="text"
          className={styles.poemTitleInput}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Untitled"
          aria-label="Poem title"
          maxLength={100}
        />
      </div>

      <div className={styles.passageContainer}>
        <p className={styles.passage}>
          {words.map((word, index) => (
            <span
              key={index}
              className={blackedOut.has(index) ? styles.blackedOut : ""}
              onClick={() => {
                if (tool === "select") {
                  toggleWord(index);
                }
              }}
            >
              {word}
            </span>
          ))}
        </p>

        <canvas
          ref={canvasRef}
          className={`${styles.drawingCanvas} ${
            tool === "draw" ? styles.drawingCanvasActive : ""
          }`}
          onPointerDown={startDrawing}
          onPointerMove={(event) => {
            moveMarkerCursor(event);
            continueDrawing(event);
          }}
          onPointerUp={stopDrawing}
          onPointerLeave={() => {
            stopDrawing();
            setCursorPosition(null);
          }}
        />

        {tool === "draw" && cursorPosition && (
          <Highlighter
            className={styles.markerCursor}
            size={24}
            style={{
              left: cursorPosition.x,
              top: cursorPosition.y,
              color: drawingColor,
            }}
            data-poem-ignore
          />
        )}
      </div>
    </div>
  );
}
