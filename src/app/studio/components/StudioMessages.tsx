/**
 * Displays messages and notifications in Blackout's Studio.
 * Includes save confirmations, export errors, and passage loading states.
 */

import styles from "../page.module.css";

/**
 * Properties used to display Studio messages.
 */
type StudioMessagesProps = {
  saveMessage: string | null;
  exportError: string | null;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void | Promise<string | null>;
};

/**
 * Displays feedback about saving, exporting, and loading passages.
 *
 * @param props - The messages, loading state, and retry callback.
 * @returns The Studio's message and notification elements.
 */
export default function StudioMessages({
  saveMessage,
  exportError,
  isLoading,
  error,
  onRetry,
}: StudioMessagesProps) {
  return (
    <>
      {saveMessage && (
        <div className={styles.toast} role="status">
          {saveMessage}
        </div>
      )}

      {exportError && (
        <div className={styles.toast} role="alert">
          {exportError}
        </div>
      )}

      {isLoading && <p className={styles.statusMessage}>Loading fragment...</p>}

      {error && (
        <div className={styles.statusMessage}>
          <div className={styles.errorContent}>
            <p>{error}</p>

            <button
              className={`${styles.fragmentButton} ${styles.retryButton}`}
              onClick={() => {
                void onRetry();
              }}
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </>
  );
}
