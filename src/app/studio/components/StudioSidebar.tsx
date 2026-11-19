"use client";

/**
 * Blackout's Studio sidebar.
 * Provides tools for selecting, drawing, and managing edit history.
 */

import type { RefObject } from "react";

import styles from "../page.module.css";

import type { StudioTool } from "../types";

type StudioSidebarProps = {
  tool: StudioTool;
  setTool: (tool: StudioTool) => void;

  drawingColor: string;
  setDrawingColor: (color: string) => void;
  recentColors: string[];
  colorInputRef: RefObject<HTMLInputElement | null>;

  markerSize: number;
  setMarkerSize: (size: number) => void;

  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
};

/**
 * Displays the Studio's editing tools and history controls.
 *
 * @returns The Studio sidebar JSX.
 */
export default function StudioSidebar({
  tool,
  setTool,
  drawingColor,
  setDrawingColor,
  recentColors,
  colorInputRef,
  markerSize,
  setMarkerSize,
  undo,
  redo,
  canUndo,
  canRedo,
}: StudioSidebarProps) {
  return (
    <aside className={styles.toolPanel}>
      <div className={styles.toolSection}>
        <span className={styles.toolLabel}>Tools</span>

        <div className={styles.toolButtons}>
          <button
            type="button"
            aria-pressed={tool === "select"}
            className={`${styles.toolButton} ${
              tool === "select" ? styles.activeTool : ""
            }`}
            onClick={() => setTool("select")}
          >
            Select
          </button>

          <button
            type="button"
            aria-pressed={tool === "draw"}
            className={`${styles.toolButton} ${
              tool === "draw" ? styles.activeTool : ""
            }`}
            onClick={() => setTool("draw")}
          >
            Draw
          </button>
        </div>
      </div>

      {tool === "draw" && (
        <>
          <div className={styles.toolSection}>
            <span className={styles.toolLabel}>Color</span>

            <div className={styles.colorControl}>
              <input
                ref={colorInputRef}
                className={styles.colorInput}
                type="color"
                value={drawingColor}
                onChange={(event) => setDrawingColor(event.target.value)}
                aria-label="Drawing color"
              />

              <div className={styles.recentColors}>
                {recentColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={styles.colorSwatch}
                    style={{ backgroundColor: color }}
                    onClick={() => setDrawingColor(color)}
                    aria-label={`Use color ${color}`}
                    aria-pressed={drawingColor === color}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className={styles.toolSection}>
            <label className={styles.toolLabel} htmlFor="marker-size">
              Marker Size
            </label>

            <div className={styles.markerSizeControl}>
              <input
                id="marker-size"
                className={styles.markerSizeInput}
                type="number"
                min="1"
                max="100"
                value={markerSize}
                onChange={(event) => {
                  const size = Number(event.target.value);

                  if (size >= 1 && size <= 100) {
                    setMarkerSize(size);
                  }
                }}
                aria-label="Marker size"
              />

              <span>px</span>
            </div>
          </div>
        </>
      )}

      <div className={styles.toolSection}>
        <span className={styles.toolLabel}>History</span>

        <div className={styles.historyButtons}>
          <button
            type="button"
            className={styles.toolButton}
            onClick={undo}
            disabled={!canUndo}
          >
            Undo
          </button>

          <button
            type="button"
            className={styles.toolButton}
            onClick={redo}
            disabled={!canRedo}
          >
            Redo
          </button>
        </div>
      </div>
    </aside>
  );
}
