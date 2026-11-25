/**
 * Blackout's drawing controls.
 * Provides color and marker size settings for the Draw tool.
 */

"use client";

import { useLayoutEffect, useRef } from "react";
import type { RefObject } from "react";

import { motion, useIsPresent } from "motion/react";

import styles from "../page.module.css";

type DrawingControlsProps = {
  drawingColor: string;
  setDrawingColor: (color: string) => void;
  recentColors: string[];
  colorInputRef: RefObject<HTMLInputElement | null>;

  markerSize: number;
  setMarkerSize: (size: number) => void;

  selectButtonRef: RefObject<HTMLButtonElement | null>;
};

/**
 * Displays the drawing color and marker size controls.
 * Disables the controls as they animate out.
 *
 * @returns The drawing controls.
 */
export default function DrawingControls({
  drawingColor,
  setDrawingColor,
  recentColors,
  colorInputRef,
  markerSize,
  setMarkerSize,
  selectButtonRef,
}: DrawingControlsProps) {
  const isPresent = useIsPresent();

  const colorSectionRef = useRef<HTMLDivElement>(null);
  const markerSectionRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const sections = [colorSectionRef.current, markerSectionRef.current];

    // Move focus to the Select button before disabling the draw controls.
    if (!isPresent) {
      const activeElement = document.activeElement;

      if (sections.some((section) => section?.contains(activeElement))) {
        selectButtonRef.current?.focus();
      }
    }

    sections.forEach((section) => {
      if (section) {
        section.inert = !isPresent;
      }
    });
  }, [isPresent, selectButtonRef]);

  return (
    <>
      <motion.div
        ref={colorSectionRef}
        className={styles.toolSection}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.15 }}
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

      <motion.div
        ref={markerSectionRef}
        className={styles.toolSection}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.15 }}
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
    </>
  );
}
