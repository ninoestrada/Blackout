/**
 * Blackout's modal for renaming saved poems.
 * Allows users to enter and save a new title.
 */

import { useRef } from "react";

import ConfirmationModal from "../../studio/components/ConfirmationModal";

import styles from "../page.module.css";

type RenamePoemModalProps = {
  /** The poem's new title. */
  newTitle: string;
  /** Whether the new title is being saved. */
  isRenaming: boolean;
  /** Error message if the poem cannot be renamed. */
  renameError: string | null;
  /** Updates the title input. */
  onTitleChange: (title: string) => void;
  /** Closes the rename modal. */
  onCancel: () => void;
  /** Saves the new title. */
  onConfirm: () => void;
};

/**
 * Displays the modal for renaming a saved poem.
 *
 * @returns The rename modal.
 */
export default function RenamePoemModal({
  newTitle,
  isRenaming,
  renameError,
  onTitleChange,
  onCancel,
  onConfirm,
}: RenamePoemModalProps) {
  const renameInputRef = useRef<HTMLInputElement>(null);

  return (
    <ConfirmationModal
      title="Rename blackout"
      message="Enter a new title for your saved blackout."
      confirmLabel="Save"
      onCancel={onCancel}
      onConfirm={onConfirm}
      initialFocusRef={renameInputRef}
      confirmDisabled={!newTitle.trim()}
      isProcessing={isRenaming}
    >
      <div className={styles.renameField}>
        <label htmlFor="rename-input">Title</label>

        <input
          ref={renameInputRef}
          id="rename-input"
          type="text"
          value={newTitle}
          onChange={(event) => onTitleChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onConfirm();
            }
          }}
          maxLength={100}
          disabled={isRenaming}
        />

        {renameError && (
          <p className={styles.renameError} role="alert">
            {renameError}
          </p>
        )}
      </div>
    </ConfirmationModal>
  );
}
