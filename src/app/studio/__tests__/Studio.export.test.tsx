/**
 * Tests PNG exporting in Blackout's Studio.
 * Covers exporting poems, PNG filenames, and handling export errors.
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { mocks } from "./studioTestSetup";
import Studio from "../Studio";
import styles from "../page.module.css";

describe("Studio - PNG export", () => {
  it("exports an unsaved poem as a titled PNG without saving it", async () => {
    const user = userEvent.setup();
    const downloadNames: string[] = [];

    const clickDownload = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(function (this: HTMLAnchorElement) {
        downloadNames.push(this.download);
      });

    render(<Studio initialPassage="The moon crossed the quiet water" />);

    await user.type(
      screen.getByRole("textbox", { name: "Poem title" }),
      "Night Sky",
    );

    await user.click(screen.getByText("moon"));
    await user.click(screen.getByRole("button", { name: "Export PNG" }));

    await vi.waitFor(() => {
      expect(mocks.html2canvas).toHaveBeenCalledTimes(1);
      expect(clickDownload).toHaveBeenCalledOnce();
    });

    const poemElement = mocks.html2canvas.mock.calls[0][0] as HTMLElement;

    expect(poemElement.dataset.poemExport).toBeDefined();
    expect(poemElement.querySelector("canvas")).not.toBeNull();
    expect(poemElement.querySelector(`.${styles.blackedOut}`)).not.toBeNull();
    expect(poemElement.querySelector("button")).toBeNull();

    expect(mocks.exportCanvas.toDataURL).toHaveBeenCalledWith("image/png");
    expect(downloadNames).toEqual(["Night Sky.png"]);
    expect(mocks.getUser).not.toHaveBeenCalled();
    expect(mocks.from).not.toHaveBeenCalled();

    const [, options] = mocks.html2canvas.mock.calls[0] as [
      HTMLElement,
      { onclone: (clonedDocument: Document) => void },
    ];

    vi.spyOn(poemElement, "getBoundingClientRect").mockReturnValue({
      x: 0,
      y: 0,
      width: 720,
      height: 240,
      top: 0,
      right: 720,
      bottom: 240,
      left: 0,
      toJSON: () => {},
    });

    const clonedDocument = document.implementation.createHTMLDocument();

    clonedDocument.body.innerHTML = poemElement.outerHTML;

    options.onclone(clonedDocument);

    const clonedPoem =
      clonedDocument.querySelector<HTMLElement>("[data-poem-export]");

    expect(clonedPoem?.style.boxSizing).toBe("content-box");
    expect(clonedPoem?.style.width).toBe("720px");
    expect(clonedPoem?.style.padding).toBe("64px 64px 80px");
    expect(clonedPoem?.style.height).toBe("");
    expect(clonedPoem?.querySelector("input")).toBeNull();
    expect(clonedPoem?.querySelector("h1")?.textContent).toBe("Night Sky");
    expect(clonedPoem?.querySelector(`.${styles.blackedOut}`)).not.toBeNull();
    expect(clonedPoem?.querySelector("canvas")).not.toBeNull();
  });

  it("exports saved poems without requiring authentication", async () => {
    const user = userEvent.setup();

    const clickDownload = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(function (this: HTMLAnchorElement) {
        expect(this.download).toBe("blackout-poem.png");
      });

    render(
      <Studio
        poemId="saved-poem"
        initialPassage="The moon crossed the quiet water"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Export PNG" }));

    await vi.waitFor(() => {
      expect(clickDownload).toHaveBeenCalledOnce();
    });

    expect(mocks.getUser).not.toHaveBeenCalled();
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it("shows an error if PNG export fails", async () => {
    const user = userEvent.setup();

    vi.spyOn(console, "error").mockImplementation(() => {});

    mocks.html2canvas.mockRejectedValue(new Error("Capture failed"));

    render(<Studio initialPassage="The moon crossed the quiet water" />);

    await user.click(screen.getByRole("button", { name: "Export PNG" }));

    expect(
      await screen.findByText(
        "Couldn't export your blackout poem. Please try again.",
      ),
    ).toBeTruthy();

    expect(mocks.getUser).not.toHaveBeenCalled();
    expect(mocks.from).not.toHaveBeenCalled();
  });
});
