import type { Variants } from "motion/react";
import { distances, scales, springs, stagger, tweens } from "./presets";

/**
 * Shared enter/exit choreography. Every overlay in the library reuses these so a
 * dialog, a popover and a drawer all feel like the same material moving.
 */

/** Generic surface entrance: fade + a short rise + a hint of scale. */
export const fadeScale: Variants = {
  initial: { opacity: 0, scale: scales.enter, y: distances.md },
  animate: { opacity: 1, scale: 1, y: 0, transition: springs.snappy },
  exit: { opacity: 0, scale: scales.exit, y: distances.sm, transition: tweens.exit },
};

/** Overlay panels: same family, slightly stronger presence. */
export const overlayPanel: Variants = {
  initial: { opacity: 0, scale: 0.965, y: distances.sm },
  animate: { opacity: 1, scale: 1, y: 0, transition: springs.snappy },
  exit: { opacity: 0, scale: scales.exit, y: distances.xs, transition: tweens.exit },
};

/** Sheets sliding in from an edge. Offsets are provided by the caller. */
export const sheetPanel: Variants = {
  initial: { opacity: 0.6, x: 0 },
  animate: { opacity: 1, x: 0, transition: springs.soft },
  exit: { opacity: 0.4, x: 0, transition: tweens.exit },
};

/** Backdrops only fade: never animate blur or size. */
export const backdrop: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: tweens.overlay },
  exit: { opacity: 0, transition: tweens.exit },
};

/** Popover/menu content: origin-aware scale, no vertical travel. */
export const popoverPanel: Variants = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1, transition: springs.snappy },
  exit: { opacity: 0, scale: scales.exit, transition: tweens.exit },
};

/**
 * List items. `custom` is the item index; the delay is clamped by `stagger.max`
 * so long lists never accumulate latency.
 */
export const listItem: Variants = {
  initial: { opacity: 0, y: distances.md },
  animate: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      ...springs.snappy,
      delay: Math.min(index, stagger.max) * stagger.base,
    },
  }),
  exit: { opacity: 0, y: distances.sm, transition: tweens.exit },
};

/** Toast entry: rises into the stack. Position offset is transformed by the stack. */
export const toastItem: Variants = {
  initial: { opacity: 0, y: distances.lg, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1, transition: springs.snappy },
  exit: { opacity: 0, scale: scales.exit, transition: tweens.exit },
};

/**
 * Toast entry that respects where the stack is anchored: a stack pinned to the
 * bottom of the screen grows upward, so its items rise; a top stack drops.
 */
export function toastStackItem(placement: "top" | "bottom"): Variants {
  const offset = placement === "top" ? -distances.lg : distances.lg;
  return {
    initial: { opacity: 0, y: offset, scale: 0.97 },
    animate: { opacity: 1, y: 0, scale: 1, transition: springs.snappy },
    exit: { opacity: 0, scale: scales.exit, transition: tweens.exit },
  };
}

/** Height-reveal helper for single-line disclosure (Field errors, hints). */
export const revealRow: Variants = {
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: "auto", transition: springs.soft },
  exit: { opacity: 0, height: 0, transition: tweens.exit },
};
