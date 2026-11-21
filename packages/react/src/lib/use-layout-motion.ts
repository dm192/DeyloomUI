import * as React from "react";

export interface HeightTransitionOptions {
  /** Milliseconds. Defaults to 220 to match `--dl-dur-3`. */
  duration?: number;
  /** Defaults to the enter easing token. */
  easing?: string;
  enabled?: boolean;
}

const ENTER_EASING = "cubic-bezier(0.22, 1, 0.36, 1)";

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Animates a container's block-size when its content swaps height.
 *
 * This is the one deliberate layout animation in the library: exactly one
 * element, driven by the Web Animations API so it can be cancelled mid-flight.
 * Without `Element.animate` (jsdom, very old browsers) or with reduced motion it
 * degrades to an instant swap.
 *
 * Call it with the value that changes the content, e.g. `[tabsValue]`.
 */
export function useHeightTransition(
  ref: React.RefObject<HTMLElement | null>,
  deps: React.DependencyList,
  options: HeightTransitionOptions = {},
): void {
  const { duration = 220, easing = ENTER_EASING, enabled = true } = options;
  const previousHeight = React.useRef<number | null>(null);
  const running = React.useRef<Animation | null>(null);

  React.useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    // A layout effect runs *after* the DOM mutation, so the natural height here
    // is already the new one. The only reliable "from" value is:
    //  - the height this hook recorded last time (normal switch), or
    //  - the current visual height when a previous animation is still running
    //    (rapid A→B→A switching must continue from where the pixels are).
    const wasAnimating = running.current !== null;
    const visualBefore = wasAnimating ? element.getBoundingClientRect().height : null;
    running.current?.cancel();
    running.current = null;

    const after = element.getBoundingClientRect().height;
    const recorded = previousHeight.current;
    previousHeight.current = after;

    if (!enabled || recorded === null) return;
    const from = visualBefore ?? recorded;
    if (Math.abs(after - from) < 1) return;
    if (prefersReducedMotion()) return;
    if (typeof element.animate !== "function") return;

    const previousOverflow = element.style.overflow;
    element.style.overflow = "clip";

    const animation = element.animate(
      [{ height: `${from}px` }, { height: `${after}px` }],
      { duration, easing, fill: "none" },
    );
    running.current = animation;

    const settle = () => {
      if (running.current !== animation) return;
      running.current = null;
      element.style.overflow = previousOverflow;
    };
    animation.addEventListener("finish", settle);
    animation.addEventListener("cancel", settle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  React.useEffect(() => {
    return () => {
      running.current?.cancel();
    };
  }, []);
}

/**
 * FLIP for a vertical stack: when children are added or removed, the remaining
 * ones animate from their previous offset with a transform-only transition, so
 * the stack never jumps and nothing leaves the compositor.
 *
 * Watches the container with a MutationObserver (stable across portals and
 * `AnimatePresence` unmounts) and only animates elements that already existed —
 * new items keep their own entrance animation.
 */
export interface StackReorderOptions {
  duration?: number;
  easing?: string;
  enabled?: boolean;
  /** Only these descendants participate. Defaults to every element child. */
  itemSelector?: string;
}

export function useStackReorder(
  ref: React.RefObject<HTMLElement | null>,
  options: StackReorderOptions = {},
): void {
  const { duration = 200, easing = ENTER_EASING, enabled = true, itemSelector } = options;
  const lastTops = React.useRef(new Map<HTMLElement, number>());

  React.useLayoutEffect(() => {
    const container = ref.current;
    if (!container) return;

    const collect = (): HTMLElement[] => {
      const nodes = itemSelector
        ? Array.from(container.querySelectorAll<HTMLElement>(itemSelector))
        : (Array.from(container.children).filter(
            (node): node is HTMLElement => node instanceof HTMLElement,
          ) as HTMLElement[]);
      return nodes;
    };

    const measure = (animate: boolean) => {
      const items = collect();
      const nextTops = new Map<HTMLElement, number>();
      for (const item of items) nextTops.set(item, item.getBoundingClientRect().top);

      const canAnimate =
        animate &&
        enabled &&
        !prefersReducedMotion() &&
        typeof Element.prototype.animate === "function";

      if (canAnimate) {
        for (const [item, top] of nextTops) {
          const previous = lastTops.current.get(item);
          if (previous === undefined) continue;
          const delta = previous - top;
          if (Math.abs(delta) < 1) continue;
          item.animate(
            [{ transform: `translateY(${delta}px)` }, { transform: "translateY(0)" }],
            { duration, easing, fill: "none" },
          );
        }
      }

      lastTops.current = nextTops;
    };

    measure(false);

    const observer = new MutationObserver(() => measure(true));
    observer.observe(container, { childList: true });
    return () => observer.disconnect();
  }, [ref, duration, easing, enabled, itemSelector]);
}
