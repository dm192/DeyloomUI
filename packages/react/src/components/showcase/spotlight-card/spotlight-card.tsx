import * as React from "react";
import { cn } from "../../../lib/cn";
import { useDeyloomReducedMotion } from "../../../hooks";

export interface SpotlightCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  children?: React.ReactNode;
  /** Radius of the light spot in CSS pixels. */
  radius?: number;
  className?: string;
}

const COARSE_POINTER_QUERY = "(pointer: coarse)";

/** Coarse pointers (touch) have no hover position, so the effect is skipped. */
function useCoarsePointer(): boolean {
  const [coarse, setCoarse] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const query = window.matchMedia(COARSE_POINTER_QUERY);
    const sync = () => setCoarse(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  return coarse;
}

/**
 * A raised surface with a radial spotlight that follows the pointer. Position
 * updates are rAF-throttled and only write two CSS custom properties, so the
 * pointer never forces a React render; `::before` opacity is the only
 * transition. Touch pointers and reduced motion get no listeners at all.
 */
export function SpotlightCard(props: SpotlightCardProps) {
  const { children, radius = 320, className, style, ...rest } = props;
  const reducedMotion = useDeyloomReducedMotion();
  const coarse = useCoarsePointer();
  const enabled = !reducedMotion && !coarse;

  const cardRef = React.useRef<HTMLDivElement | null>(null);
  const frameRef = React.useRef(0);
  const pointRef = React.useRef<{ x: number; y: number } | null>(null);
  const [active, setActive] = React.useState(false);

  React.useEffect(() => {
    if (!enabled) return;
    const card = cardRef.current;
    if (!card) return;

    const flush = () => {
      frameRef.current = 0;
      const point = pointRef.current;
      if (!point) return;
      card.style.setProperty("--dl-mx", `${point.x}px`);
      card.style.setProperty("--dl-my", `${point.y}px`);
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = card.getBoundingClientRect();
      pointRef.current = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      if (frameRef.current === 0) {
        frameRef.current = window.requestAnimationFrame(flush);
      }
    };
    const onPointerEnter = () => setActive(true);
    const onPointerLeave = () => {
      pointRef.current = null;
      setActive(false);
    };

    card.addEventListener("pointermove", onPointerMove, { passive: true });
    card.addEventListener("pointerenter", onPointerEnter);
    card.addEventListener("pointerleave", onPointerLeave);

    return () => {
      card.removeEventListener("pointermove", onPointerMove);
      card.removeEventListener("pointerenter", onPointerEnter);
      card.removeEventListener("pointerleave", onPointerLeave);
      if (frameRef.current !== 0) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = 0;
      }
      setActive(false);
    };
  }, [enabled]);

  const cssVars = { "--dl-spotlight-radius": `${radius}px` } as React.CSSProperties;

  return (
    <div
      {...rest}
      ref={cardRef}
      className={cn("dl-surface-raised", "dl-spotlight-card", className)}
      style={{ ...style, ...cssVars }}
      data-spotlight={enabled ? (active ? "on" : "off") : undefined}
      data-spotlight-disabled={enabled ? undefined : "true"}
    >
      {children}
    </div>
  );
}
