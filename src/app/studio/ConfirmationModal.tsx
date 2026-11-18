"use client";

/**
 * Blackout's confirmation modal.
 * Asks users to confirm actions, such as deleting or renaming a poem.
 */

import {
  useEffect,
  useId,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";

import styles from "./page.module.css";

type ConfirmationModalProps = {
  title: string;
  message: string;
  children?: ReactNode;

  confirmLabel?: string;
  confirmDisabled?: boolean;
  isProcessing?: boolean;

  dontShowAgain?: boolean;
  onDontShowAgainChange?: (checked: boolean) => void;

  initialFocusRef?: RefObject<HTMLInputElement | null>;

  onCancel: () => void;
  onConfirm: () => void;
};

/**
 * Displays a confirmation modal with options to confirm or cancel an action.
 * Allows users to navigate the modal with their keyboard and keeps the focus inside it until it closes.
 *
 * @returns The confirmation modal JSX.
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

  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const onCancelRef = useRef(onCancel);
  const latestInitialFocusRef = useRef(initialFocusRef);
  const isProcessingRef = useRef(isProcessing);

  // Keep the modal's values up to date so keyboard actions work correctly.
  useEffect(() => {
    onCancelRef.current = onCancel;
    latestInitialFocusRef.current = initialFocusRef;
    isProcessingRef.current = isProcessing;
  }, [onCancel, initialFocusRef, isProcessing]);

  useEffect(() => {
    const previouslyFocusedElement = document.activeElement;

    // Focus the name field when renaming a poem; otherwise, focus the Cancel button.
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

    // Stop handling keyboard input and return focus to where it was before the modal opened.
    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);

      if (
        previouslyFocusedElement instanceof HTMLElement &&
        previouslyFocusedElement.isConnected
      ) {
        previouslyFocusedElement.focus();
      }
    };
  }, []);

  return (
    <div className={styles.modalOverlay}>
      <div
        ref={dialogRef}
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
      >
        <button
          type="button"
          className={styles.closeButton}
          onClick={onCancel}
          disabled={isProcessing}
          aria-label="Close"
        >
          ×
        </button>

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
          <button
            ref={cancelButtonRef}
            type="button"
            className={styles.modalButton}
            onClick={onCancel}
            disabled={isProcessing}
          >
            Cancel
          </button>

          <button
            type="button"
            className={styles.modalButton}
            onClick={onConfirm}
            disabled={confirmDisabled || isProcessing}
          >
            {isProcessing ? "Saving..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
