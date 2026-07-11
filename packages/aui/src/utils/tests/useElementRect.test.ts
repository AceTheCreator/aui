import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useElementRect } from "../useElementRect";

class MockResizeObserver {
  static instances: MockResizeObserver[] = [];
  callback: ResizeObserverCallback;
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn(() => {
    MockResizeObserver.instances = MockResizeObserver.instances.filter((i) => i !== this);
  });

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    MockResizeObserver.instances.push(this);
  }

  trigger() {
    this.callback([], this as unknown as ResizeObserver);
  }
}

function mockRect(overrides: Partial<DOMRect>): DOMRect {
  return {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 0,
    height: 0,
    x: 0,
    y: 0,
    toJSON: () => ({}),
    ...overrides,
  };
}

describe("useElementRect", () => {
  let originalResizeObserver: typeof ResizeObserver;

  beforeEach(() => {
    MockResizeObserver.instances = [];
    originalResizeObserver = globalThis.ResizeObserver;
    globalThis.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;

    // Run requestAnimationFrame callbacks synchronously so tests don't need to
    // wait a real frame for the scroll/resize-triggered update path.
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    });
    vi.stubGlobal("cancelAnimationFrame", () => {});
  });

  afterEach(() => {
    globalThis.ResizeObserver = originalResizeObserver;
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns null when there is no element", () => {
    const { result } = renderHook(() => useElementRect(null, true));
    expect(result.current).toBeNull();
  });

  it("returns null when inactive, even with an element", () => {
    const el = document.createElement("div");
    const { result } = renderHook(() => useElementRect(el, false));
    expect(result.current).toBeNull();
  });

  it("measures the element synchronously on mount", () => {
    const el = document.createElement("div");
    vi.spyOn(el, "getBoundingClientRect").mockReturnValue(
      mockRect({ top: 10, left: 20, width: 100, height: 50 }),
    );

    const { result } = renderHook(() => useElementRect(el, true));

    expect(result.current?.top).toBe(10);
    expect(result.current?.left).toBe(20);
    expect(result.current?.width).toBe(100);
    expect(result.current?.height).toBe(50);
  });

  it("re-measures when the ResizeObserver fires", () => {
    const el = document.createElement("div");
    const rectSpy = vi.spyOn(el, "getBoundingClientRect").mockReturnValue(mockRect({ width: 100 }));

    const { result } = renderHook(() => useElementRect(el, true));
    expect(result.current?.width).toBe(100);

    rectSpy.mockReturnValue(mockRect({ width: 200 }));
    const observer = MockResizeObserver.instances[0];
    act(() => observer.trigger());

    expect(result.current?.width).toBe(200);
  });

  it("re-measures on window scroll (capture phase, for ancestor scroll containers)", () => {
    const el = document.createElement("div");
    const rectSpy = vi.spyOn(el, "getBoundingClientRect").mockReturnValue(mockRect({ top: 0 }));

    const { result } = renderHook(() => useElementRect(el, true));
    expect(result.current?.top).toBe(0);

    rectSpy.mockReturnValue(mockRect({ top: -300 }));
    act(() => window.dispatchEvent(new Event("scroll")));

    expect(result.current?.top).toBe(-300);
  });

  it("re-measures on window resize", () => {
    const el = document.createElement("div");
    const rectSpy = vi.spyOn(el, "getBoundingClientRect").mockReturnValue(mockRect({ width: 100 }));

    const { result } = renderHook(() => useElementRect(el, true));
    expect(result.current?.width).toBe(100);

    rectSpy.mockReturnValue(mockRect({ width: 300 }));
    act(() => window.dispatchEvent(new Event("resize")));

    expect(result.current?.width).toBe(300);
  });

  it("resets to null and disconnects the observer when active becomes false", () => {
    const el = document.createElement("div");
    vi.spyOn(el, "getBoundingClientRect").mockReturnValue(mockRect({ width: 100 }));

    const { result, rerender } = renderHook(({ active }) => useElementRect(el, active), {
      initialProps: { active: true },
    });
    expect(result.current).not.toBeNull();
    const observer = MockResizeObserver.instances[0];

    rerender({ active: false });

    expect(result.current).toBeNull();
    expect(observer.disconnect).toHaveBeenCalled();
  });

  it("disconnects the observer and removes window listeners on unmount", () => {
    const el = document.createElement("div");
    vi.spyOn(el, "getBoundingClientRect").mockReturnValue(mockRect({}));
    const removeSpy = vi.spyOn(window, "removeEventListener");

    const { unmount } = renderHook(() => useElementRect(el, true));
    const observer = MockResizeObserver.instances[0];

    unmount();

    expect(observer.disconnect).toHaveBeenCalled();
    expect(removeSpy).toHaveBeenCalledWith("scroll", expect.any(Function), true);
    expect(removeSpy).toHaveBeenCalledWith("resize", expect.any(Function));
  });
});
