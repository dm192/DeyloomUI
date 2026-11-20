import * as React from "react";
import { cn } from "../../../lib/cn";
import { useDeyloomReducedMotion } from "../../../hooks";

export interface BorderBeamProps {
  children?: React.ReactNode;
  /** Seconds for one full turn of the beam. */
  duration?: number;
  /** Length of the lit arc as a percentage of the ring (1–100). */
  size?: number;
  /** Any CSS color. Defaults to `--dl-color-accent`. */
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

type BeamCSSVars = React.CSSProperties & Record<`--${string}`, string>;

const DEFAULT_DURATION = 6;
const DEFAULT_SIZE = 40;

/**
 * A 1px border that carries a rotating light. The conic gradient is painted on
 * one oversized square and clipped by a `mask-composite: exclude` ring, so the
 * paint area is the 1px border only. Under reduced motion the rotation is off and
 * a static accent stroke remains.
 */
export function BorderBeam(props: BorderBeamProps) {
  const {
    children,
    duration = DEFAULT_DURATION,
    size = DEFAULT_SIZE,
    color,
    className,
    style,
  } = props;

  const reducedMotion = useDeyloomReducedMotion();
  const safeDuration =
    Number.isFinite(duration) && duration > 0 ? duration : DEFAULT_DURATION;
  const safeSize = Number.isFinite(size) ? Math.min(Math.max(size, 1), 100) : DEFAULT_SIZE;

  const beamStyle: BeamCSSVars = {
    ...style,
    "--dl-beam-duration": `${safeDuration}s`,
    "--dl-beam-size": `${safeSize}`,
  } as BeamCSSVars;
  if (color) beamStyle["--dl-beam-color"] = color;

  return (
    <div
      className={cn("dl-border-beam", className)}
      style={beamStyle}
      data-motion={reducedMotion ? "static" : "animated"}
    >
      <div className="dl-border-beam__content">{children}</div>
      <span className="dl-border-beam__ring" aria-hidden="true">
        <span className="dl-border-beam__beam dl-anim-loop" />
      </span>
    </div>
  );
}
