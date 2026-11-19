/**
 * Manages Blackout's Studio confirmation modal.
 * Handles starting a new poem and clearing the current poem's edits.
 */

import { useState } from "react";

type UseConfirmationsOptions = {
  /** Whether the poem has blackout selections or drawings. */
  hasEdits: boolean;
  /** Starts a new poem with a different passage. */
  onFreshFragment: () => void;
  /** Clears blackout selections and drawings. */
  onCleanSlate: () => void;
};

/**
 * Handles confirmation dialogs and user preferences for starting
 * a new poem or clearing the current one.
 *
 * @returns The state and functions for managing confirmation dialogs.
 */
export default function useConfirmations({
  hasEdits,
  onFreshFragment,
  onCleanSlate,
}: UseConfirmationsOptions) {
  // New poem confirmation
  const [showFreshFragmentConfirmation, setShowFreshFragmentConfirmation] =
    useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // Clear poem confirmation
  const [showCleanSlateConfirmation, setShowCleanSlateConfirmation] =
    useState(false);
  const [dontShowCleanSlateAgain, setDontShowCleanSlateAgain] = useState(false);

  /**
   * Starts a new poem or asks for confirmation if the current poem has edits.
   */
  function handleFreshFragment() {
    const skipConfirmation =
      localStorage.getItem("skipFreshFragmentConfirmation") === "true";

    if (hasEdits && !skipConfirmation) {
      setShowFreshFragmentConfirmation(true);
      return;
    }

    onFreshFragment();
  }

  /**
   * Confirms starting a new poem and saves the user's confirmation preference.
   */
  function confirmFreshFragment() {
    if (dontShowAgain) {
      localStorage.setItem("skipFreshFragmentConfirmation", "true");
    }

    setShowFreshFragmentConfirmation(false);
    onFreshFragment();
  }

  /**
   * Closes the new poem confirmation dialog and resets its checkbox.
   */
  function closeFreshFragmentConfirmation() {
    setShowFreshFragmentConfirmation(false);
    setDontShowAgain(false);
  }

  /**
   * Clears blackout selections and drawings, asking for confirmation if needed.
   */
  function handleCleanSlate() {
    if (!hasEdits) return;

    const skipConfirmation =
      localStorage.getItem("skipCleanSlateConfirmation") === "true";

    if (!skipConfirmation) {
      setShowCleanSlateConfirmation(true);
      return;
    }

    onCleanSlate();
  }

  /**
   * Confirms clearing the poem's edits and saves the user's confirmation preference.
   */
  function confirmCleanSlate() {
    if (dontShowCleanSlateAgain) {
      localStorage.setItem("skipCleanSlateConfirmation", "true");
    }

    setShowCleanSlateConfirmation(false);
    onCleanSlate();
  }

  /**
   * Closes the clear poem confirmation dialog and resets its checkbox.
   */
  function closeCleanSlateConfirmation() {
    setShowCleanSlateConfirmation(false);
    setDontShowCleanSlateAgain(false);
  }

  return {
    showFreshFragmentConfirmation,
    dontShowAgain,
    setDontShowAgain,
    showCleanSlateConfirmation,
    dontShowCleanSlateAgain,
    setDontShowCleanSlateAgain,
    handleFreshFragment,
    confirmFreshFragment,
    closeFreshFragmentConfirmation,
    handleCleanSlate,
    confirmCleanSlate,
    closeCleanSlateConfirmation,
  };
}
