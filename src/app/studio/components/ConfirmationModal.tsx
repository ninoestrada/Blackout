/**
 * Blackout's confirmation modal.
 * Asks users to confirm actions, such as deleting or renaming a poem.
 */

"use client";

import { motion, useIsPresent } from "motion/react";
import {
  useEffect,
  useId,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";

import styles from "../page.module.css";

type ConfirmationModalProps = {
  /** The modal's title. */
  title: string;
  /** Explains what the user is being asked to confirm. */
  message: string;
  /** Optional content shown below the message. */
  children?: ReactNode;
  /** The text on the confirmation button. */
  confirmLabel?: string;
  /** Whether to disable the confirmation button. */
  confirmDisabled?: boolean;
  /** Whether the action is still in progress. */
  isProcessing?: boolean;
  /** Whether the user has checked "Don't show this again". */
  dontShowAgain?: boolean;
  /** Called when the user changes the checkbox selection. */
  onDontShowAgainChange?: (checked: boolean) => void;
  /** Reference to the input field to focus when the modal opens. */
  initialFocusRef?: RefObject<HTMLInputElement | null>;
  /** Called when the user cancels the action. */
  onCancel: () => void;
  /** Called when the user confirms the action. */
  onConfirm: () => void;
};

/**
 * Displays a confirmation modal with options to confirm or cancel an action.
 * Supports keyboard navigation and keeps focus inside the modal until it closes.
 *
 * @returns The confirmation modal.
 */
export default function ConfirmationModal({
  title,
  message,
  children,
  confirmLabel = "Continue",
  confirmDisabled = false,
  isProcessing = false,
  dontShowAgain,
  onDontShowAgainChange,
  initialFocusRef,
  onCancel,
  onConfirm,
}: ConfirmationModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const isPresent = useIsPresent();

  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const onCancelRef = useRef(onCancel);
  const latestInitialFocusRef = useRef(initialFocusRef);
  const isProcessingRef = useRef(isProcessing);

  const isConfirmDisabled = confirmDisabled || isProcessing;

  // Keep the values used by the keyboard handler up to date.
  useEffect(() => {
    onCancelRef.current = onCancel;
    latestInitialFocusRef.current = initialFocusRef;
    isProcessingRef.current = isProcessing;
  }, [onCancel, initialFocusRef, isProcessing]);

  useEffect(() => {
    if (!isPresent) {
      return;
    }

    const previouslyFocusedElement = document.activeElement;

    // Focus Cancel by default to prevent accidental confirmation.
    if (latestInitialFocusRef.current?.current) {
      latestInitialFocusRef.current.current.focus();
      latestInitialFocusRef.current.current.select();
    } else {
      cancelButtonRef.current?.focus();
    }

    /**
     * Handles keyboard input while the modal is open.
     * Lets users close the modal with Escape and move between its controls using Tab.
     *
     * @param event - The keyboard event.
     */
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();

        if (!isProcessingRef.current) {
          onCancelRef.current();
        }

        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const dialog = dialogRef.current;

      if (!dialog) {
        return;
      }

      const focusableElements = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          "button:not(:disabled), input:not(:disabled), " +
            "a[href], select:not(:disabled), textarea:not(:disabled), " +
            '[tabindex]:not([tabindex="-1"])',
        ),
      );

      if (focusableElements.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (!dialog.contains(document.activeElement)) {
        event.preventDefault();
        (event.shiftKey ? lastElement : firstElement).focus();
      } else if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);

      if (
        previouslyFocusedElement instanceof HTMLElement &&
        previouslyFocusedElement.isConnected
      ) {
        previouslyFocusedElement.focus();
      }
    };
  }, [isPresent]);

  return (
    <motion.div
      className={styles.modalOverlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      inert={!isPresent}
      style={{ pointerEvents: isPresent ? "auto" : "none" }}
    >
      <motion.div
        ref={dialogRef}
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.2 }}
      >
        <motion.button
          type="button"
          className={styles.closeButton}
          onClick={onCancel}
          disabled={isProcessing}
          aria-label="Close"
          whileHover={!isProcessing ? { scale: 1.1 } : undefined}
          whileTap={!isProcessing ? { scale: 0.95 } : undefined}
          transition={{ duration: 0.15 }}
        >
          ×
        </motion.button>

        <h2 id={titleId}>{title}</h2>

        <p id={descriptionId}>{message}</p>

        {children}

        {dontShowAgain !== undefined && onDontShowAgainChange && (
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(event) => onDontShowAgainChange(event.target.checked)}
            />
            Don&apos;t show this again
          </label>
        )}

        <div className={styles.modalActions}>
          <motion.button
            ref={cancelButtonRef}
            type="button"
            className={styles.modalButton}
            onClick={onCancel}
            disabled={isProcessing}
            whileHover={!isProcessing ? { scale: 1.03 } : undefined}
            whileTap={!isProcessing ? { scale: 0.97 } : undefined}
            transition={{ duration: 0.15 }}
          >
            Cancel
          </motion.button>

          <motion.button
            type="button"
            className={styles.modalButton}
            onClick={onConfirm}
            disabled={isConfirmDisabled}
            whileHover={!isConfirmDisabled ? { scale: 1.03 } : undefined}
            whileTap={!isConfirmDisabled ? { scale: 0.97 } : undefined}
            transition={{ duration: 0.15 }}
          >
            {isProcessing ? "Saving..." : confirmLabel}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
