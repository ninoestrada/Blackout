/**
 * Manages Blackout's Studio poem exports.
 * Handles exporting poems as images, loading state, and errors.
 */

import { useRef, useState } from "react";

import exportPoem from "../utils/exportPoem";

type UseExportPoemProps = {
  /** The poem's title, used to name the exported image. */
  title: string;
};

/**
 * Manages exporting the current blackout poem as an image.
 *
 * @returns The poem element reference, export status, any errors,
 * and the function used to export the poem.
 */
export default function useExportPoem({ title }: UseExportPoemProps) {
  const poemExportRef = useRef<HTMLDivElement>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  /**
   * Exports the current poem as an image.
   * Displays an error message if the export fails.
   */
  async function handleExport(): Promise<void> {
    const poemElement = poemExportRef.current;

    if (!poemElement) {
      setExportError("Couldn't export your blackout poem. Please try again.");
      return;
    }

    setExportError(null);
    setIsExporting(true);

    try {
      await exportPoem({ poemElement, title });
    } catch (error) {
      console.error("Error exporting blackout poem:", error);
      setExportError("Couldn't export your blackout poem. Please try again.");
    } finally {
      setIsExporting(false);
    }
  }

  return {
    poemExportRef,
    exportError,
    isExporting,
    handleExport,
  };
}
