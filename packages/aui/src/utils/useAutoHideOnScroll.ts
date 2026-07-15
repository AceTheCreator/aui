import { useEffect, useRef, useState } from "react";

export type AutoHideMode = "docked" | "pinned" | "hidden";

/**
 * Drives a "show on scroll up" element anchored to the top of `element`.
 *
 * - "docked": `element`'s top edge is still at/below the viewport top — render
 *   the target in its normal in-flow position.
 * - "hidden": scrolled past the top and the last scroll moved down — keep the
 *   target off-screen.
 * - "pinned": scrolled past the top but the last scroll moved up, or
 *   `forceVisible` is set — pin the target to the viewport top.
 *
 * Scroll direction is derived from `element`'s own bounding rect, so it works
 * regardless of which ancestor scroll container actually scrolls (same reason
 * useElementRect listens in the capture phase).
 */
export function useAutoHideOnScroll(element: HTMLElement | null, forceVisible: boolean): AutoHideMode {
  const [mode, setMode] = useState<AutoHideMode>("docked");
  const forceVisibleRef = useRef(forceVisible);
  forceVisibleRef.current = forceVisible;

  useEffect(() => {
    if (!element) return;

    let lastTop: number | null = null;
    let frame: number | null = null;

    const update = () => {
      frame = null;
      const top = element.getBoundingClientRect().top;
      const delta = lastTop === null ? 0 : top - lastTop;
      lastTop = top;

      if (top >= 0) setMode("docked");
      else if (forceVisibleRef.current || delta > 0) setMode("pinned");
      else if (delta < 0) setMode("hidden");
      // delta === 0 with the top scrolled away (e.g. mounting mid-page): only
      // a stale "docked" needs correcting; keep an explicit pinned/hidden as is.
      else setMode((current) => (current === "docked" ? "hidden" : current));
    };
    const schedule = () => {
      if (frame === null) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, true);
    window.addEventListener("resize", schedule);
    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule, true);
      window.removeEventListener("resize", schedule);
    };
  }, [element]);

  // Becoming force-visible while hidden (e.g. the panel opened via keyboard
  // focus on the off-screen button) must reveal the target even though no
  // scroll event fires.
  useEffect(() => {
    if (forceVisible) setMode((current) => (current === "hidden" ? "pinned" : current));
  }, [forceVisible]);

  return mode;
}
