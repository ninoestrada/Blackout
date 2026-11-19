/**
 * Tests how Blackout's Studio saves poems.
 * Covers saving new poems, updating existing ones, and preventing duplicate saves.
 */

import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { mocks, mockSignedInUser } from "./studioTestSetup";
import Studio from "../Studio";

describe("Studio - Saving", () => {
  it("saves a blackout poem for a signed-in user", async () => {
    const user = userEvent.setup();

    mockSignedInUser();
    mocks.single.mockResolvedValue({
      data: { id: "poem-1" },
      error: null,
    });

    render(<Studio initialPassage="The moon crossed the quiet water" />);

    const word = screen.getByText("moon");

    await user.click(word);
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("Poem saved.")).toBeTruthy();

    expect(mocks.insert).toHaveBeenCalledTimes(1);
    expect(mocks.insert).toHaveBeenCalledWith({
      user_id: "test-user-123",
      title: null,
      source_text: "The moon crossed the quiet water",
      blackout_data: [2],
      drawing_data: {
        width: 0,
        height: 0,
        strokes: [],
      },
    });
  });

  it("updates the inserted poem on subsequent saves", async () => {
    const user = userEvent.setup();

    mockSignedInUser();
    mocks.single.mockResolvedValue({
      data: { id: "poem-1" },
      error: null,
    });
    mocks.maybeSingle.mockResolvedValue({
      data: { id: "poem-1" },
      error: null,
    });

    render(<Studio initialPassage="The moon crossed the quiet water" />);

    await user.click(screen.getByRole("button", { name: "Save" }));
    await screen.findByText("Poem saved.");

    await user.click(screen.getByRole("button", { name: "Save Changes" }));

    expect(await screen.findByText("Changes saved.")).toBeTruthy();

    expect(mocks.insert).toHaveBeenCalledTimes(1);
    expect(mocks.update).toHaveBeenCalledTimes(1);
    expect(mocks.eq).toHaveBeenNthCalledWith(1, "id", "poem-1");
    expect(mocks.eq).toHaveBeenNthCalledWith(2, "user_id", "test-user-123");
  });

  it("does not insert duplicate poems for rapid Save clicks", async () => {
    mockSignedInUser();

    let resolveInsert:
      | ((result: { data: { id: string }; error: null }) => void)
      | undefined;

    mocks.single.mockReturnValue(
      new Promise((resolve) => {
        resolveInsert = resolve;
      }),
    );

    render(<Studio initialPassage="The moon crossed the quiet water" />);

    const saveButton = screen.getByRole("button", { name: "Save" });

    fireEvent.click(saveButton);
    fireEvent.click(saveButton);

    expect(mocks.getUser).toHaveBeenCalledTimes(1);

    await vi.waitFor(() => {
      expect(mocks.insert).toHaveBeenCalledTimes(1);
    });

    resolveInsert?.({
      data: { id: "poem-1" },
      error: null,
    });

    expect(await screen.findByText("Poem saved.")).toBeTruthy();
    expect(mocks.insert).toHaveBeenCalledTimes(1);
  });

  it("inserts a new poem after loading a Fresh Fragment", async () => {
    const user = userEvent.setup();

    mockSignedInUser();

    mocks.single
      .mockResolvedValueOnce({
        data: { id: "poem-1" },
        error: null,
      })
      .mockResolvedValueOnce({
        data: { id: "poem-2" },
        error: null,
      });

    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      text: async () => "A different fragment",
    } as Response);

    render(<Studio initialPassage="The moon crossed the quiet water" />);

    await user.click(screen.getByRole("button", { name: "Save" }));
    await screen.findByText("Poem saved.");

    await user.click(screen.getByRole("button", { name: "Fresh Fragment" }));

    expect(await screen.findByText("different")).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("Poem saved.")).toBeTruthy();

    expect(mocks.insert).toHaveBeenCalledTimes(2);
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it("updates the specified existing poem without inserting another", async () => {
    const user = userEvent.setup();

    mockSignedInUser();

    mocks.maybeSingle.mockResolvedValue({
      data: { id: "existing-poem" },
      error: null,
    });

    render(
      <Studio
        poemId="existing-poem"
        initialPassage="The moon crossed the quiet water"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Save Changes" }));

    expect(await screen.findByText("Changes saved.")).toBeTruthy();

    expect(mocks.insert).not.toHaveBeenCalled();
    expect(mocks.update).toHaveBeenCalledTimes(1);
    expect(mocks.eq).toHaveBeenNthCalledWith(1, "id", "existing-poem");
    expect(mocks.eq).toHaveBeenNthCalledWith(2, "user_id", "test-user-123");
  });
});
