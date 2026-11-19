/**
 * Blackout's Studio action buttons.
 * Lets users load new text, clear their edits, save poems, and export them as PNGs.
 */

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
 * @returns The Studio actions JSX.
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
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={onFreshFragment}
          disabled={isSaving}
        >
          Fresh Fragment
        </button>
      )}

      <button
        type="button"
        className={styles.secondaryButton}
        onClick={onCleanSlate}
        disabled={isSaving}
      >
        Clean Slate
      </button>

      <button
        type="button"
        className={styles.primaryButton}
        onClick={onSave}
        disabled={isSaving}
      >
        {isSaving ? "Saving..." : savedPoemId ? "Save Changes" : "Save"}
      </button>

      <button
        type="button"
        className={styles.secondaryButton}
        onClick={onExport}
        disabled={isExporting}
      >
        {isExporting ? "Exporting..." : "Export PNG"}
      </button>
    </div>
  );
}
