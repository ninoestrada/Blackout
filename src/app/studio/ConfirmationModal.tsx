"use client";

import {
  useEffect,
  useId,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";
import { Space_Mono } from "next/font/google";
import styles from "./page.module.css";

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
});

type ConfirmationModalProps = {
  title: string;
  message: string;
  dontShowAgain?: boolean;
  onDontShowAgainChange?: (checked: boolean) => void;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
  children?: ReactNode;
  initialFocusRef?: RefObject<HTMLInputElement | null>;
  confirmDisabled?: boolean;
  isProcessing?: boolean;
};

export default function ConfirmationModal({
  title,
  message,
  dontShowAgain,
  onDontShowAgainChange,
  confirmLabel = "Continue",
  onCancel,
  onConfirm,
  children,
  initialFocusRef,
  confirmDisabled = false,
  isProcessing = false,
}: ConfirmationModalProps) {
  const titleId = useId();
  const descriptionId = useId();

  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const onCancelRef = useRef(onCancel);
  const initialFocusRefRef = useRef(initialFocusRef);
  const isProcessingRef = useRef(isProcessing);

  useEffect(() => {
    onCancelRef.current = onCancel;
    initialFocusRefRef.current = initialFocusRef;
    isProcessingRef.current = isProcessing;
  }, [onCancel, initialFocusRef, isProcessing]);

  useEffect(() => {
    const previouslyFocusedElement = document.activeElement;

    // Focus the input for Rename, otherwise focus Cancel.
    if (initialFocusRefRef.current?.current) {
      initialFocusRefRef.current.current.focus();
      initialFocusRefRef.current.current.select();
    } else {
      cancelButtonRef.current?.focus();
    }

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
  }, []);

  return (
    <div className={styles.modalOverlay}>
      <div
        ref={dialogRef}
        className={`${styles.modal} ${spaceMono.className}`}
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
            className={`${styles.modalButton} ${spaceMono.className}`}
            onClick={onCancel}
            disabled={isProcessing}
          >
            Cancel
          </button>

          <button
            type="button"
            className={`${styles.modalButton} ${spaceMono.className}`}
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
