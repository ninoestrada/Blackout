/**
 * Manages Blackout's options menu for saved poems.
 * Provides actions to edit, rename, or delete a poem.
 */

"use client";

import { Pencil, SquarePen, Trash2 } from "lucide-react";
import { motion, useIsPresent } from "motion/react";

import styles from "../page.module.css";

type PoemMenuProps = {
  /** Opens the poem in the Studio. */
  onEdit: () => void;
  /** Opens the modal to rename the poem. */
  onRename: () => void;
  /** Opens the modal to confirm deletion. */
  onDelete: () => void;
};

/**
 * Displays the available actions for a saved poem.
 *
 * @returns The poem options menu.
 */
export default function PoemMenu({
  onEdit,
  onRename,
  onDelete,
}: PoemMenuProps) {
  const isPresent = useIsPresent();

  return (
    <motion.div
      className={styles.poemMenu}
      inert={!isPresent}
      style={{ pointerEvents: isPresent ? "auto" : "none" }}
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.15 }}
    >
      <button type="button" onClick={onEdit}>
        <SquarePen size={14} />
        Edit
      </button>

      <button type="button" onClick={onRename}>
        <Pencil size={14} />
        Rename
      </button>

      <button type="button" onClick={onDelete}>
        <Trash2 size={14} />
        Delete
      </button>
    </motion.div>
  );
}
