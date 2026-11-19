/**
 * Tests how Blackout's Studio loads passages.
 * Covers loading messages and handling errors when passages fail to load.
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import "./studioTestSetup";
import Studio from "../Studio";

describe("Studio - Passage loading", () => {
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
