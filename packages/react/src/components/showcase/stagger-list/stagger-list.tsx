import * as React from "react";
import { AnimatePresence, m } from "motion/react";
import type { TargetAndTransition, Variants } from "motion/react";
import { cn } from "../../../lib/cn";
import { springs, stagger } from "../../../motion/presets";
import { listItem } from "../../../motion/variants";
import { useDeyloomReducedMotion } from "../../../hooks";

export type StaggerListDensity = "tight" | "base" | "loose";
export type StaggerListElement = "ul" | "div";

/**
 * Past this many items a per-item delay no longer reads as choreography: the
 * last rows would still be arriving after the user has started reading. The
 * list switches to a plain simultaneous entrance and says so in dev.
 */
const MAX_STAGGERED_ITEMS = 24;

export interface StaggerListProps<T> {
  items: readonly T[];
  getKey: (item: T) => React.Key;
  renderItem: (item: T, index: number) => React.ReactNode;
  /** Delay between rows. `base` is the library default. */
  stagger?: StaggerListDensity;
  /** `ul`/`li` by default; `div` keeps the same exposed list semantics. */
  as?: StaggerListElement;
  className?: string;
}

/** `listItem.animate` is a variant function: custom carries the row index. */
const listItemAnimate = listItem.animate as (index: number) => TargetAndTransition;

/**
 * Generic staggered list. Rows enter with the shared `listItem` choreography,
 * exit with the shared tween, and the per-row delay is capped by `stagger.max`
 * so a 24-row list never makes the user wait. Above 24 rows (and under reduced
 * motion) the delay is dropped entirely; only `transform`/`opacity` animate.
 */
export function StaggerList<T>(props: StaggerListProps<T>) {
  const {
    items,
    getKey,
    renderItem,
    stagger: density = "base",
    as = "ul",
    className,
  } = props;

  const reducedMotion = useDeyloomReducedMotion();
  const tooLong = items.length > MAX_STAGGERED_ITEMS;
  const withoutDelay = tooLong || reducedMotion;
  const informed = React.useRef(false);

  React.useEffect(() => {
    if (!tooLong || informed.current) return;
    informed.current = true;
    if (process.env.NODE_ENV !== "production") {
      console.info(
        `[Deyloom] StaggerList: staggering is disabled above ${MAX_STAGGERED_ITEMS} items (received ${items.length}).`,
      );
    }
  }, [tooLong, items.length]);

  const variants = React.useMemo<Variants>(
    () => ({
      initial: listItem.initial as TargetAndTransition,
      animate: (index: number) => ({
        ...listItemAnimate(index),
        transition: {
          ...springs.snappy,
          delay: withoutDelay
            ? 0
            : Math.min(index, stagger.max) * stagger[density],
        },
      }),
      exit: listItem.exit as TargetAndTransition,
    }),
    [density, withoutDelay],
  );

  const rows = (
    <AnimatePresence initial={!reducedMotion}>
      {items.map((item, index) => {
        const rowProps = {
          role: "listitem" as const,
          className: "dl-stagger-list__item",
          custom: index,
          variants,
          initial: "initial" as const,
          animate: "animate" as const,
          exit: "exit" as const,
        };
        const content = renderItem(item, index);
        return as === "ul" ? (
          <m.li key={getKey(item)} {...rowProps}>
            {content}
          </m.li>
        ) : (
          <m.div key={getKey(item)} {...rowProps}>
            {content}
          </m.div>
        );
      })}
    </AnimatePresence>
  );

  const rootProps = {
    role: "list" as const,
    className: cn("dl-stagger-list", className),
    "data-stagger": density,
    "data-stagger-off": withoutDelay ? "true" : undefined,
  };

  return as === "ul" ? (
    <m.ul {...rootProps}>{rows}</m.ul>
  ) : (
    <m.div {...rootProps}>{rows}</m.div>
  );
}
