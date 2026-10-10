import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Studio from "../Studio";
import styles from "../page.module.css";

const {
  mockGetUser,
  mockFrom,
  mockInsert,
  mockUpdate,
  mockEq,
  mockSelect,
  mockSingle,
  mockMaybeSingle,
  mockQuery,
  mockHtml2canvas,
  mockExportCanvas,
} = vi.hoisted(() => {
  const mockQuery = {
    eq: vi.fn(),
    select: vi.fn(),
    single: vi.fn(),
    maybeSingle: vi.fn(),
  };
  const mockExportCanvas = {
    toDataURL: vi.fn(() => "data:image/png;base64,exported"),
  };

  return {
    mockGetUser: vi.fn(),
    mockFrom: vi.fn(),
    mockInsert: vi.fn(),
    mockUpdate: vi.fn(),
    mockEq: mockQuery.eq,
    mockSelect: mockQuery.select,
    mockSingle: mockQuery.single,
    mockMaybeSingle: mockQuery.maybeSingle,
    mockQuery,
    mockHtml2canvas: vi.fn(),
    mockExportCanvas,
  };
});

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
  },
}));

vi.mock("html2canvas", () => ({
  default: mockHtml2canvas,
}));

vi.mock("next/font/google", () => ({
  Space_Mono: () => ({
    className: "mock-space-mono",
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockHtml2canvas.mockResolvedValue(mockExportCanvas);

  mockFrom.mockReturnValue({
    insert: mockInsert,
    update: mockUpdate,
  });
  mockInsert.mockReturnValue(mockQuery);
  mockUpdate.mockReturnValue(mockQuery);
  mockEq.mockReturnValue(mockQuery);
  mockSelect.mockReturnValue(mockQuery);

  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    scale: vi.fn(),
    setTransform: vi.fn(),
  } as unknown as CanvasRenderingContext2D);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Studio", () => {
  function signIn() {
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: "test-user-123",
        },
      },
      error: null,
    });
  }

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

  it("switches to drawing mode", async () => {
    const user = userEvent.setup();

    render(<Studio initialPassage="The moon crossed the quiet water" />);

    const drawButton = screen.getByRole("button", { name: "Draw" });

    await user.click(drawButton);

    expect(drawButton.className).toContain(styles.activeTool);
  });

  it("saves drawing strokes for a signed-in user", async () => {
    const user = userEvent.setup();

    signIn();
    mockSingle.mockResolvedValue({ data: { id: "poem-1" }, error: null });

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

    expect(mockInsert).toHaveBeenCalledWith(
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

  it("saves a blackout poem for a signed-in user", async () => {
    const user = userEvent.setup();

    signIn();
    mockSingle.mockResolvedValue({ data: { id: "poem-1" }, error: null });

    render(<Studio initialPassage="The moon crossed the quiet water" />);

    const word = screen.getByText("moon");

    await user.click(word);
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(await screen.findByText("Poem saved.")).toBeTruthy();

    expect(mockInsert).toHaveBeenCalledTimes(1);
    expect(mockInsert).toHaveBeenCalledWith({
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

    signIn();
    mockSingle.mockResolvedValue({ data: { id: "poem-1" }, error: null });
    mockMaybeSingle.mockResolvedValue({ data: { id: "poem-1" }, error: null });

    render(<Studio initialPassage="The moon crossed the quiet water" />);

    await user.click(screen.getByRole("button", { name: "Save" }));
    await screen.findByText("Poem saved.");

    await user.click(screen.getByRole("button", { name: "Save Changes" }));
    expect(await screen.findByText("Changes saved.")).toBeTruthy();

    expect(mockInsert).toHaveBeenCalledTimes(1);
    expect(mockUpdate).toHaveBeenCalledTimes(1);
    expect(mockEq).toHaveBeenNthCalledWith(1, "id", "poem-1");
    expect(mockEq).toHaveBeenNthCalledWith(2, "user_id", "test-user-123");
  });

  it("does not insert duplicate poems for rapid Save clicks", async () => {
    signIn();

    let resolveInsert:
      | ((result: { data: { id: string }; error: null }) => void)
      | undefined;
    mockSingle.mockReturnValue(
      new Promise((resolve) => {
        resolveInsert = resolve;
      }),
    );

    render(<Studio initialPassage="The moon crossed the quiet water" />);

    const saveButton = screen.getByRole("button", { name: "Save" });
    fireEvent.click(saveButton);
    fireEvent.click(saveButton);

    expect(mockGetUser).toHaveBeenCalledTimes(1);

    await vi.waitFor(() => {
      expect(mockInsert).toHaveBeenCalledTimes(1);
    });

    resolveInsert?.({ data: { id: "poem-1" }, error: null });
    expect(await screen.findByText("Poem saved.")).toBeTruthy();
    expect(mockInsert).toHaveBeenCalledTimes(1);
  });

  it("inserts a new poem after loading a Fresh Fragment", async () => {
    const user = userEvent.setup();

    signIn();
    mockSingle
      .mockResolvedValueOnce({ data: { id: "poem-1" }, error: null })
      .mockResolvedValueOnce({ data: { id: "poem-2" }, error: null });
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

    expect(mockInsert).toHaveBeenCalledTimes(2);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("updates the specified existing poem without inserting another", async () => {
    const user = userEvent.setup();

    signIn();
    mockMaybeSingle.mockResolvedValue({ data: { id: "existing-poem" }, error: null });

    render(
      <Studio
        poemId="existing-poem"
        initialPassage="The moon crossed the quiet water"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Save Changes" }));
    expect(await screen.findByText("Changes saved.")).toBeTruthy();

    expect(mockInsert).not.toHaveBeenCalled();
    expect(mockUpdate).toHaveBeenCalledTimes(1);
    expect(mockEq).toHaveBeenNthCalledWith(1, "id", "existing-poem");
    expect(mockEq).toHaveBeenNthCalledWith(2, "user_id", "test-user-123");
  });

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
      expect(mockHtml2canvas).toHaveBeenCalledTimes(1);
      expect(clickDownload).toHaveBeenCalledOnce();
    });

    const poemElement = mockHtml2canvas.mock.calls[0][0] as HTMLElement;
    expect(poemElement.dataset.poemExport).toBeDefined();
    expect(poemElement.querySelector("canvas")).not.toBeNull();
    expect(poemElement.querySelector(`.${styles.blackedOut}`)).not.toBeNull();
    expect(poemElement.querySelector("button")).toBeNull();

    expect(mockExportCanvas.toDataURL).toHaveBeenCalledWith("image/png");
    expect(clickDownload).toHaveBeenCalledOnce();
    expect(downloadNames).toEqual(["Night Sky.png"]);
    expect(mockGetUser).not.toHaveBeenCalled();
    expect(mockFrom).not.toHaveBeenCalled();

    const [, options] = mockHtml2canvas.mock.calls[0] as [
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

    const clonedPoem = clonedDocument.querySelector<HTMLElement>(
      "[data-poem-export]",
    );
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

    expect(mockGetUser).not.toHaveBeenCalled();
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it("shows an error if PNG export fails", async () => {
    const user = userEvent.setup();
    vi.spyOn(console, "error").mockImplementation(() => {});
    mockHtml2canvas.mockRejectedValue(new Error("Capture failed"));

    render(<Studio initialPassage="The moon crossed the quiet water" />);

    await user.click(screen.getByRole("button", { name: "Export PNG" }));

    expect(
      await screen.findByText("Couldn't export your poem. Please try again."),
    ).toBeTruthy();
    expect(mockGetUser).not.toHaveBeenCalled();
    expect(mockFrom).not.toHaveBeenCalled();
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
