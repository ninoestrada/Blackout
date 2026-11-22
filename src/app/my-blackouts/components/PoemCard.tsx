/**
 * Blackout's saved poem card.
 * Displays a preview, title, creation date, and options to edit, rename, or delete the poem.
 */

import { Ellipsis, Pencil, SquarePen, Trash2 } from "lucide-react";
import Link from "next/link";

import DrawingPreview from "./DrawingPreview";
import type { SavedPoem } from "../types";

import styles from "../page.module.css";

type PoemCardProps = {
  /** The saved poem to display. */
  poem: SavedPoem;
  /** Whether the poem's options menu is open. */
  isMenuOpen: boolean;
  /** Opens or closes the poem's options menu. */
  onToggleMenu: () => void;
  /** Opens the poem in the Studio. */
  onEdit: () => void;
  /** Opens the modal to rename the poem. */
  onRename: () => void;
  /** Opens the modal to confirm deletion. */
  onDelete: () => void;
};

/**
 * Displays a saved poem with options to edit, rename, or delete it.
 *
 * @returns The saved poem card.
 */
export default function PoemCard({
  poem,
  isMenuOpen,
  onToggleMenu,
  onEdit,
  onRename,
  onDelete,
}: PoemCardProps) {
  const drawingData = poem.drawing_data;
  const drawingStrokes = Array.isArray(drawingData)
    ? drawingData
    : drawingData.strokes;
  const sourceWidth = Array.isArray(drawingData)
    ? undefined
    : drawingData.width;

  return (
    <div className={styles.poem}>
      <Link href={`/studio/${poem.id}`} className={styles.poemLink}>
        <div className={styles.preview}>
          {poem.source_text.split(/(\s+)/).map((part, index) => (
            <span
              key={index}
              className={
                poem.blackout_data.includes(index) ? styles.blackedOut : ""
              }
            >
              {part}
            </span>
          ))}

          <DrawingPreview strokes={drawingStrokes} sourceWidth={sourceWidth} />
        </div>

        <h2>{poem.title || "Untitled"}</h2>

        <p>
          {new Date(poem.created_at).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </Link>

      <button
        type="button"
        className={styles.menuButton}
        data-poem-menu={poem.id}
        onClick={onToggleMenu}
        aria-label={`More options for ${poem.title || "Untitled"}`}
        aria-expanded={isMenuOpen}
        aria-haspopup="true"
      >
        <Ellipsis size={20} />
      </button>

      {isMenuOpen && (
        <div className={styles.poemMenu}>
          <button type="button" onClick={onEdit}>
            <SquarePen size={14} />
            Edit
          </button>

          <button type="button" onClick={onRename}>
            <Pencil size={14} />
            Rename
          </button>

          <button type="button" onClick={onDelete}>
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
