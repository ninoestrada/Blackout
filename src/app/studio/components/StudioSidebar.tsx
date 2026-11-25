/**
 * Blackout's Studio sidebar.
 * Provides tools for selecting, drawing, and managing edit history.
 */

"use client";

import { useRef } from "react";
import type { RefObject } from "react";

import { AnimatePresence, motion } from "motion/react";

import { buttonAnimation } from "@/lib/animations";

import DrawingControls from "./DrawingControls";
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
  const selectButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <aside className={styles.toolPanel}>
      <div className={styles.toolSection}>
        <span className={styles.toolLabel}>Tools</span>

        <div className={styles.toolButtons}>
          <motion.button
            ref={selectButtonRef}
            type="button"
            aria-pressed={tool === "select"}
            className={`${styles.toolButton} ${
              tool === "select" ? styles.activeTool : ""
            }`}
            onClick={() => setTool("select")}
            {...buttonAnimation()}
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
            {...buttonAnimation()}
          >
            Draw
          </motion.button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {tool === "draw" && (
          <DrawingControls
            key="drawing-controls"
            drawingColor={drawingColor}
            setDrawingColor={setDrawingColor}
            recentColors={recentColors}
            colorInputRef={colorInputRef}
            markerSize={markerSize}
            setMarkerSize={setMarkerSize}
            selectButtonRef={selectButtonRef}
          />
        )}
      </AnimatePresence>

      <motion.div
        layout="position"
        className={styles.toolSection}
        transition={{ layout: { duration: 0.2, ease: "easeInOut" } }}
      >
        <span className={styles.toolLabel}>History</span>

        <div className={styles.historyButtons}>
          <motion.button
            type="button"
            className={styles.toolButton}
            onClick={undo}
            disabled={!canUndo}
            {...buttonAnimation(!canUndo)}
          >
            Undo
          </motion.button>

          <motion.button
            type="button"
            className={styles.toolButton}
            onClick={redo}
            disabled={!canRedo}
            {...buttonAnimation(!canRedo)}
          >
            Redo
          </motion.button>
        </div>
      </motion.div>
    </aside>
  );
}
