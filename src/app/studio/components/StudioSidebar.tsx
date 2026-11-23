/**
 * Blackout's Studio sidebar.
 * Provides tools for selecting, drawing, and managing edit history.
 */

"use client";

import type { RefObject } from "react";

import { AnimatePresence, motion } from "motion/react";

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
 * @returns The Studio sidebar.
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
          <motion.button
            type="button"
            aria-pressed={tool === "select"}
            className={`${styles.toolButton} ${
              tool === "select" ? styles.activeTool : ""
            }`}
            onClick={() => setTool("select")}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.15 }}
          >
            Select
          </motion.button>

          <motion.button
            type="button"
            aria-pressed={tool === "draw"}
            className={`${styles.toolButton} ${
              tool === "draw" ? styles.activeTool : ""
            }`}
            onClick={() => setTool("draw")}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.15 }}
          >
            Draw
          </motion.button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {tool === "draw" && (
          <motion.div
            key="color-controls"
            className={styles.toolSection}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            inert={tool !== "draw"}
          >
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
                  <motion.button
                    key={color}
                    type="button"
                    className={styles.colorSwatch}
                    style={{ backgroundColor: color }}
                    onClick={() => setDrawingColor(color)}
                    aria-label={`Use color ${color}`}
                    aria-pressed={drawingColor === color}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {tool === "draw" && (
          <motion.div
            key="marker-controls"
            className={styles.toolSection}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            inert={tool !== "draw"}
          >
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
          </motion.div>
        )}
      </AnimatePresence>

      <div className={styles.toolSection}>
        <span className={styles.toolLabel}>History</span>

        <div className={styles.historyButtons}>
          <motion.button
            type="button"
            className={styles.toolButton}
            onClick={undo}
            disabled={!canUndo}
            whileHover={canUndo ? { scale: 1.03 } : undefined}
            whileTap={canUndo ? { scale: 0.97 } : undefined}
            transition={{ duration: 0.15 }}
          >
            Undo
          </motion.button>

          <motion.button
            type="button"
            className={styles.toolButton}
            onClick={redo}
            disabled={!canRedo}
            whileHover={canRedo ? { scale: 1.03 } : undefined}
            whileTap={canRedo ? { scale: 0.97 } : undefined}
            transition={{ duration: 0.15 }}
          >
            Redo
          </motion.button>
        </div>
      </div>
    </aside>
  );
}
