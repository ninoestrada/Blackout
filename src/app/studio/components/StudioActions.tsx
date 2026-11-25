/**
 * Blackout's Studio action buttons.
 * Lets users load new text, clear their edits, save poems, and export them as PNGs.
 */

"use client";

import { motion } from "motion/react";

import styles from "../page.module.css";

type StudioActionsProps = {
  poemId?: string;
  savedPoemId: string | null;

  isSaving: boolean;
  isExporting: boolean;

  onFreshFragment: () => void;
  onCleanSlate: () => void;
  onSave: () => void;
  onExport: () => void;
};

/**
 * Displays the Studio's main action buttons.
 *
 * @returns The Studio actions.
 */
export default function StudioActions({
  poemId,
  savedPoemId,
  isSaving,
  isExporting,
  onFreshFragment,
  onCleanSlate,
  onSave,
  onExport,
}: StudioActionsProps) {
  return (
    <div className={styles.studioActions}>
      {!poemId && (
        <motion.button
          type="button"
          className={styles.secondaryButton}
          onClick={onFreshFragment}
          disabled={isSaving}
          whileHover={!isSaving ? { scale: 1.03 } : undefined}
          whileTap={!isSaving ? { scale: 0.97 } : undefined}
          transition={{ duration: 0.15 }}
        >
          Fresh Fragment
        </motion.button>
      )}

      <motion.button
        type="button"
        className={styles.secondaryButton}
        onClick={onCleanSlate}
        disabled={isSaving}
        whileHover={!isSaving ? { scale: 1.03 } : undefined}
        whileTap={!isSaving ? { scale: 0.97 } : undefined}
        transition={{ duration: 0.15 }}
      >
        Clean Slate
      </motion.button>

      <motion.button
        type="button"
        className={styles.primaryButton}
        onClick={onSave}
        disabled={isSaving}
        whileHover={!isSaving ? { scale: 1.03 } : undefined}
        whileTap={!isSaving ? { scale: 0.97 } : undefined}
        transition={{ duration: 0.15 }}
      >
        {isSaving ? "Saving..." : savedPoemId ? "Save Changes" : "Save"}
      </motion.button>

      <motion.button
        type="button"
        className={styles.secondaryButton}
        onClick={onExport}
        disabled={isExporting}
        whileHover={!isExporting ? { scale: 1.03 } : undefined}
        whileTap={!isExporting ? { scale: 0.97 } : undefined}
        transition={{ duration: 0.15 }}
      >
        {isExporting ? "Exporting..." : "Export PNG"}
      </motion.button>
    </div>
  );
}
