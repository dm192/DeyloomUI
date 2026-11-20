import type { Transition } from "motion/react";

/**
 * The single source of truth for Deyloom motion. Component code never invents its
 * own durations or curves — it picks from here.
 *
 * Springs carry interactive movement: they are interruptible, preserve velocity
 * and settle without a visible stop. Tweens carry exits, where overshoot would
 * look like a bug.
 */

export const springs = {
  /** Pointer-down feedback. Stiff and heavily damped so it reads as weight. */
  press: { type: "spring", stiffness: 700, damping: 40, mass: 0.5 },
  /** Small elements changing place: switch thumb, tab indicator, toast stack. */
  snappy: { type: "spring", stiffness: 520, damping: 36, mass: 0.8 },
  /** Default for surfaces entering a scene. */
  soft: { type: "spring", stiffness: 320, damping: 30, mass: 1 },
  /** Large panels and full-page choreography. */
  gentle: { type: "spring", stiffness: 210, damping: 26, mass: 1 },
} as const satisfies Record<string, Transition>;

const bezierEnter = [0.22, 1, 0.36, 1] as [number, number, number, number];
const bezierExit = [0.4, 0, 1, 1] as [number, number, number, number];

export const tweens = {
  /** Entrances that must match the CSS ease-out token exactly. */
  enter: { type: "tween", duration: 0.24, ease: bezierEnter },
  /** Exits. Always shorter, never bouncy. */
  exit: { type: "tween", duration: 0.14, ease: bezierExit },
  /** Overlay backdrops. */
  overlay: { type: "tween", duration: 0.2, ease: bezierExit },
} as const satisfies Record<string, Transition>;

export const durations = {
  press: 0.09,
  fast: 0.16,
  base: 0.24,
  slow: 0.36,
  slower: 0.56,
} as const;

export const scales = {
  press: 0.97,
  enter: 0.96,
  exit: 0.98,
} as const;

export const distances = {
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 20,
} as const;

/**
 * Stagger is capped at 8 items: past that, cumulative delay becomes latency.
 * Callers with longer lists must pass `animate` straight through instead of
 * staggering each child.
 */
export const stagger = {
  tight: 0.02,
  base: 0.035,
  loose: 0.06,
  max: 8,
} as const;

export const easings = {
  enter: bezierEnter,
  exit: bezierExit,
  inOut: [0.65, 0, 0.35, 1] as [number, number, number, number],
  springLook: [0.34, 1.36, 0.64, 1] as [number, number, number, number],
} as const;

/** Default transition applied by `DeyloomProvider` via `MotionConfig`. */
export const defaultTransition: Transition = springs.soft;

export type DeyloomSpring = keyof typeof springs;
export type DeyloomTween = keyof typeof tweens;
