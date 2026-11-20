import * as React from "react";
import { cn } from "../../../lib/cn";
import { useDeyloomReducedMotion } from "../../../hooks";

export interface MarqueeProps {
  children?: React.ReactNode;
  /** Scroll speed in pixels per second. */
  speed?: number;
  direction?: "left" | "right";
  /** Pause the loop while the pointer is over the strip or a child has focus. */
  pauseOnHover?: boolean;
  /** Fade both ends of the viewport with a mask. */
  fade?: boolean;
  /** Gap between items: a number (px) or any CSS length. */
  gap?: number | string;
  className?: string;
}

const DEFAULT_SPEED = 60;
const DEFAULT_GAP = "var(--dl-space-8)";

type MarqueeCSSVars = React.CSSProperties & Record<`--${string}`, string>;

/**
 * Seamless horizontal marquee. The content is rendered twice and the track
 * translates by exactly -50%, so one copy is always on screen. The duration is
 * derived from the measured copy width and the requested px/s speed; the
 * duplicate copy is `aria-hidden` (and inert) so it never reaches the a11y tree.
 *
 * Under reduced motion the loop stops and the strip becomes a normal horizontal
 * scroll container with the duplicate removed.
 */
export function Marquee(props: MarqueeProps) {
  const {
    children,
    speed = DEFAULT_SPEED,
    direction = "left",
    pauseOnHover = true,
    fade = false,
    gap,
    className,
  } = props;

  const reducedMotion = useDeyloomReducedMotion();
  const resolvedSpeed = Number.isFinite(speed) && speed > 0 ? speed : DEFAULT_SPEED;

  const groupRef = React.useRef<HTMLDivElement | null>(null);
  const [duration, setDuration] = React.useState<number | null>(null);

  React.useEffect(() => {
    const group = groupRef.current;
    if (!group || typeof window === "undefined") return;

    const measure = () => {
      const width = group.getBoundingClientRect().width;
      setDuration(width > 0 ? width / resolvedSpeed : null);
    };
    measure();

    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(group);
    return () => observer.disconnect();
  }, [resolvedSpeed]);

  const gapValue = typeof gap === "number" ? `${gap}px` : (gap ?? DEFAULT_GAP);
  const style: MarqueeCSSVars = { "--dl-marquee-gap": gapValue };
  if (duration !== null) style["--dl-marquee-duration"] = `${duration.toFixed(3)}s`;

  return (
    <div
      className={cn("dl-marquee", className)}
      style={style}
      data-direction={direction}
      data-pause={pauseOnHover ? "hover" : "none"}
      data-fade={fade ? "true" : undefined}
      data-ready={duration !== null ? "true" : undefined}
      data-motion={reducedMotion ? "static" : "animated"}
    >
      <div className={cn("dl-marquee__track", "dl-anim-loop")}>
        <div className="dl-marquee__group" ref={groupRef}>
          {children}
        </div>
        <div className="dl-marquee__group" aria-hidden="true" inert>
          {children}
        </div>
      </div>
    </div>
  );
}
