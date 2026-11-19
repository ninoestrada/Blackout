/**
 * Sets up shared mocks for Blackout's Studio tests.
 * Simulates Supabase, PNG exports, fonts, and canvas functionality.
 */

import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const query = {
    eq: vi.fn(),
    maybeSingle: vi.fn(),
    select: vi.fn(),
    single: vi.fn(),
  };

  return {
    eq: query.eq,
    exportCanvas: {
      toDataURL: vi.fn(() => "data:image/png;base64,exported"),
    },
    from: vi.fn(),
    getUser: vi.fn(),
    html2canvas: vi.fn(),
    insert: vi.fn(),
    maybeSingle: query.maybeSingle,
    query,
    select: query.select,
    single: query.single,
    update: vi.fn(),
  };
});

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getUser: mocks.getUser,
    },
    from: mocks.from,
  },
}));

vi.mock("html2canvas", () => ({
  default: mocks.html2canvas,
}));

vi.mock("next/font/google", () => ({
  Space_Mono: () => ({
    className: "mock-space-mono",
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();

  mocks.html2canvas.mockResolvedValue(mocks.exportCanvas);

  mocks.from.mockReturnValue({
    insert: mocks.insert,
    update: mocks.update,
  });

  mocks.insert.mockReturnValue(mocks.query);
  mocks.update.mockReturnValue(mocks.query);
  mocks.eq.mockReturnValue(mocks.query);
  mocks.select.mockReturnValue(mocks.query);

  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
    beginPath: vi.fn(),
    clearRect: vi.fn(),
    lineTo: vi.fn(),
    moveTo: vi.fn(),
    restore: vi.fn(),
    save: vi.fn(),
    scale: vi.fn(),
    setTransform: vi.fn(),
    stroke: vi.fn(),
  } as unknown as CanvasRenderingContext2D);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

/**
 * Mocks an authenticated user for tests that save poems.
 */
export function mockSignedInUser() {
  mocks.getUser.mockResolvedValue({
    data: {
      user: {
        id: "test-user-123",
      },
    },
    error: null,
  });
}

export { mocks };
