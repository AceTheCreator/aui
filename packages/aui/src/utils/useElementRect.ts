import { useLayoutEffect, useState } from "react";

/**
 * Tracks `element`'s viewport-relative bounding rect (via getBoundingClientRect),
 * updating on resize and on scroll of any ancestor scroll container. Only
 * observes while `active` is true, so callers can opt out when not needed
 * (e.g. while a panel using this for positioning is closed).
 */
export function useElementRect(element: HTMLElement | null, active: boolean): DOMRect | null {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useLayoutEffect(() => {
    if (!element || !active) {
      setRect(null);
      return;
    }

    let frame: number | null = null;
    const scheduleUpdate = () => {
      if (frame !== null) return;
      frame = requestAnimationFrame(() => {
        frame = null;
        setRect(element.getBoundingClientRect());
      });
    };

    // Measure synchronously up front so the first render already has the
    // correct rect, instead of a frame with stale/fallback positioning.
    setRect(element.getBoundingClientRect());

    const resizeObserver = new ResizeObserver(scheduleUpdate);
    resizeObserver.observe(element);

    // Capture phase so scrolling on any ancestor scroll container (not just
    // the window) is caught, not only a top-level page scroll.
    window.addEventListener("scroll", scheduleUpdate, true);
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener("scroll", scheduleUpdate, true);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [element, active]);

  return rect;
}
