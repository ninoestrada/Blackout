import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import Studio from "../Studio";
import styles from "../page.module.css";

const { mockGetUser, mockInsert } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockInsert: vi.fn(),
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getUser: mockGetUser,
    },
    from: vi.fn(() => ({
      insert: mockInsert,
    })),
  },
}));

vi.mock("next/font/google", () => ({
  Space_Mono: () => ({
    className: "mock-space-mono",
  }),
}));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Studio", () => {
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

  it("saves a blackout poem for a signed-in user", async () => {
    const user = userEvent.setup();

    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: "test-user-123",
        },
      },
      error: null,
    });

    mockInsert.mockResolvedValue({
      error: null,
    });

    render(<Studio initialPassage="The moon crossed the quiet water" />);

    const word = screen.getByText("moon");

    await user.click(word);
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(mockInsert).toHaveBeenCalledWith({
      user_id: "test-user-123",
      source_text: "The moon crossed the quiet water",
      blackout_data: [2],
    });
  });

  it("shows a loading message while a fragment is being fetched", () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(
      () => new Promise(() => {}),
    );

    render(<Studio />);

    expect(screen.getByText("Loading fragment...")).toBeTruthy();
  });

  it("shows an error message when a fragment fails to load", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
    } as Response);

    render(<Studio />);

    expect(await screen.findByText("Couldn't load a fragment.")).toBeTruthy();
  });
});
