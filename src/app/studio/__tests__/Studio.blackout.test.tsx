/**
 * Tests Blackout's Studio blackout editing.
 * Covers selecting, restoring, undoing, and redoing blacked-out words.
 */

import "./studioTestSetup";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import Studio from "../Studio";
import styles from "../page.module.css";

describe("Studio - Blackout editing", () => {
  it("blacks out a word when the user clicks it", async () => {
    const user = userEvent.setup();

    render(<Studio initialPassage="The moon crossed the quiet water" />);

    const word = screen.getByText("moon");

    await user.click(word);

    expect(word.className).toContain(styles.blackedOut);
  });

  it("restores a blacked out word when the user clicks it again", async () => {
    const user = userEvent.setup();

    render(<Studio initialPassage="The moon crossed the quiet water" />);

    const word = screen.getByText("moon");

    await user.click(word);
    await user.click(word);

    expect(word.className).not.toContain(styles.blackedOut);
  });

  it("undoes and redoes a blackout", async () => {
    const user = userEvent.setup();

    render(<Studio initialPassage="The moon crossed the quiet water" />);

    const word = screen.getByText("moon");
    const undoButton = screen.getByRole("button", { name: "Undo" });
    const redoButton = screen.getByRole("button", { name: "Redo" });

    await user.click(word);

    expect(word.className).toContain(styles.blackedOut);

    await user.click(undoButton);

    expect(word.className).not.toContain(styles.blackedOut);

    await user.click(redoButton);

    expect(word.className).toContain(styles.blackedOut);
  });
});
