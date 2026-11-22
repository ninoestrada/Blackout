/**
 * Tests drawing features in Blackout's Studio.
 * Covers switching to drawing mode, saving strokes, and resizing saved drawings.
 */

import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { mocks, mockSignedInUser } from "./studioTestSetup";
import Studio from "../Studio";
import styles from "../page.module.css";

describe("Studio - Drawing", () => {
  it("switches to drawing mode", async () => {
    const user = userEvent.setup();

    render(<Studio initialPassage="The moon crossed the quiet water" />);

    const drawButton = screen.getByRole("button", { name: "Draw" });

    await user.click(drawButton);

    expect(drawButton.className).toContain(styles.activeTool);
  });

  it("saves drawing strokes for a signed-in user", async () => {
    const user = userEvent.setup();

    mockSignedInUser();
    mocks.single.mockResolvedValue({ data: { id: "poem-1" }, error: null });

    const { container } = render(
      <Studio initialPassage="The moon crossed the quiet water" />,
    );

    await user.click(screen.getByRole("button", { name: "Draw" }));

    const canvas = container.querySelector("canvas");

    expect(canvas).not.toBeNull();

    if (!canvas) {
      return;
    }

    vi.spyOn(canvas, "getBoundingClientRect").mockReturnValue({
      x: 0,
      y: 0,
      width: 800,
      height: 400,
      top: 0,
      right: 800,
      bottom: 400,
      left: 0,
      toJSON: () => {},
    });

    fireEvent.pointerDown(canvas, {
      clientX: 100,
      clientY: 100,
    });

    fireEvent.pointerMove(canvas, {
      clientX: 150,
      clientY: 125,
    });

    fireEvent.pointerUp(canvas);

    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(mocks.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        drawing_data: expect.objectContaining({
          strokes: expect.arrayContaining([
            expect.objectContaining({
              color: "#505050",
              size: 8,
            }),
          ]),
        }),
      }),
    );
  });

  it("scales a saved drawing from its original canvas dimensions", () => {
    const scale = vi.fn();

    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      scale,
      setTransform: vi.fn(),
    } as unknown as CanvasRenderingContext2D);

    vi.spyOn(HTMLCanvasElement.prototype, "clientWidth", "get").mockReturnValue(
      400,
    );

    vi.spyOn(
      HTMLCanvasElement.prototype,
      "clientHeight",
      "get",
    ).mockReturnValue(200);

    render(
      <Studio
        initialPassage="The moon crossed the quiet water"
        initialDrawing={[
          {
            points: [
              { x: 100, y: 100 },
              { x: 200, y: 150 },
            ],
            color: "#505050",
            size: 8,
          },
        ]}
        initialDrawingWidth={800}
        initialDrawingHeight={400}
      />,
    );

    expect(scale).toHaveBeenCalledWith(0.5, 0.5);
  });
});
