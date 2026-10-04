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
};

export default function ConfirmationModal({
  title,
  message,
  dontShowAgain,
  onDontShowAgainChange,
  confirmLabel = "Continue",
  onCancel,
  onConfirm,
}: ConfirmationModalProps) {
  return (
    <div className={styles.modalOverlay}>
      <div className={`${styles.modal} ${spaceMono.className}`}>
        <button
          className={styles.closeButton}
          onClick={onCancel}
          aria-label="Close"
        >
          ×
        </button>

        <h2>{title}</h2>

        <p>{message}</p>

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
            className={`${styles.modalButton} ${spaceMono.className}`}
            onClick={onCancel}
          >
            Cancel
          </button>

          <button
            className={`${styles.modalButton} ${spaceMono.className}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
