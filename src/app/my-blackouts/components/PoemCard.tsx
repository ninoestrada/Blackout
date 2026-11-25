/**
 * Blackout's saved poem card.
 * Displays a preview, title, creation date, and options to edit, rename, or delete the poem.
 */

"use client";

import { Ellipsis } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";

import DrawingPreview from "./DrawingPreview";
import PoemMenu from "./PoemMenu";
import type { SavedPoem } from "../types";

import styles from "../page.module.css";

const MotionLink = motion.create(Link);

type PoemCardProps = {
  /** The saved poem to display. */
  poem: SavedPoem;
  /** Whether the poem's options menu is open. */
  isMenuOpen: boolean;
  /** Opens or closes the poem's options menu. */
  onToggleMenu: () => void;
  /** Opens the poem in the Studio. */
  onEdit: () => void;
  /** Opens the modal to rename the poem. */
  onRename: () => void;
  /** Opens the modal to confirm deletion. */
  onDelete: () => void;
};

/**
 * Displays a saved poem with options to edit, rename, or delete it.
 *
 * @returns The saved poem card.
 */
export default function PoemCard({
  poem,
  isMenuOpen,
  onToggleMenu,
  onEdit,
  onRename,
  onDelete,
}: PoemCardProps) {
  const drawingData = poem.drawing_data;
  const drawingStrokes = Array.isArray(drawingData)
    ? drawingData
    : drawingData.strokes;
  const sourceWidth = Array.isArray(drawingData)
    ? undefined
    : drawingData.width;

  return (
    <div className={styles.poemCard}>
      <MotionLink
        href={`/studio/${poem.id}`}
        className={styles.poemLink}
        whileHover={{ y: -3 }}
        transition={{ duration: 0.15 }}
      >
        <div className={styles.poemPreview}>
          {poem.source_text.split(/(\s+)/).map((part, index) => (
            <span
              key={index}
              className={
                poem.blackout_data.includes(index) ? styles.blackedOut : ""
              }
            >
              {part}
            </span>
          ))}

          <DrawingPreview strokes={drawingStrokes} sourceWidth={sourceWidth} />
        </div>

        <h2>{poem.title || "Untitled"}</h2>

        <p>
          {new Date(poem.created_at).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </MotionLink>

      <motion.button
        type="button"
        className={styles.poemMenuButton}
        data-poem-menu={poem.id}
        onClick={onToggleMenu}
        aria-label={`More options for ${poem.title || "Untitled"}`}
        aria-expanded={isMenuOpen}
        aria-haspopup="true"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.15 }}
      >
        <Ellipsis size={20} />
      </motion.button>

      <AnimatePresence>
        {isMenuOpen && (
          <PoemMenu
            key="poem-menu"
            onEdit={onEdit}
            onRename={onRename}
            onDelete={onDelete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
