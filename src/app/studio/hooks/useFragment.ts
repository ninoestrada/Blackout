/**
 * Manages the text used in Blackout's Studio to create blackout poems.
 * Handles fetching new passages from an API, loading status, and errors.
 */

import { useCallback, useRef, useState } from "react";

import fetchPassage from "../utils/fetchPassage";

type UseFragmentOptions = {
  /** The text initially provided to the Studio. */
  initialPassage: string;
};

/**
 * Manages the current passage and loads new passages when requested.
 *
 * @returns The passage, loading status, error message, and functions
 * for updating or loading passages.
 */
export default function useFragment({ initialPassage }: UseFragmentOptions) {
  const [passage, setPassage] = useState(initialPassage);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const requestIdRef = useRef(0);

  /**
   * Fetches a new passage from the API and updates the current passage.
   * Handles loading errors and ignores responses from older requests.
   *
   * @returns The new passage, or null if the request fails or is outdated.
   */
  const loadPassage = useCallback(async (): Promise<string | null> => {
    const requestId = ++requestIdRef.current;

    setError("");
    setIsLoading(true);

    try {
      const newPassage = await fetchPassage();

      if (requestId !== requestIdRef.current) {
        return null;
      }

      setPassage(newPassage);
      return newPassage;
    } catch {
      if (requestId !== requestIdRef.current) {
        return null;
      }

      setError("Couldn't load a fragment.");
      return null;
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  return {
    passage,
    setPassage,
    isLoading,
    setIsLoading,
    error,
    setError,
    loadPassage,
  };
}
