import * as React from "react";
import { ScrollArea as ScrollAreaPrimitive } from "radix-ui";
import { cn } from "../../../lib/cn";

export type ScrollAreaOrientation = "vertical" | "horizontal" | "both";

/** Arbitrary data-* hooks (tests, analytics, CSS) are allowed on the viewport. */
type DataAttributes = { [key: `data-${string}`]: string | number | boolean | undefined };

export interface ScrollAreaProps
  extends Omit<React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>, "children"> {
  children: React.ReactNode;
  /** Which scrollbars to render. Defaults to `"vertical"`. */
  orientation?: ScrollAreaOrientation;
  /** Max block size of the viewport. A number is treated as pixels. */
  maxHeight?: number | string;
  /** Scrollbar visibility. Defaults to `"hover"`. */
  type?: "auto" | "always" | "scroll" | "hover";
  /** Accessible name for the focusable viewport. */
  label?: string;
  viewportClassName?: string;
  viewportProps?: React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Viewport> &
    DataAttributes;
}

function toLength(value: number | string | undefined): string | undefined {
  if (value === undefined) return undefined;
  return typeof value === "number" ? `${value}px` : value;
}

/**
 * Scrollable surface with DynUI scrollbars.
 *
 * Native scrollbars are hidden by Radix and replaced with token-coloured thumbs
 * that fade in on hover/scroll (opacity only). The viewport is focusable so
 * keyboard users can scroll content that has no interactive children.
 */
export function ScrollArea(props: ScrollAreaProps) {
  const {
    children,
    orientation = "vertical",
    maxHeight,
    type = "hover",
    label,
    className,
    viewportClassName,
    viewportProps,
    ...rest
  } = props;

  const viewportStyle = React.useMemo<React.CSSProperties | undefined>(() => {
    const length = toLength(maxHeight);
    return length ? { maxBlockSize: length } : undefined;
  }, [maxHeight]);

  return (
    <ScrollAreaPrimitive.Root
      type={type}
      className={cn("dl-scroll-area", className)}
      data-orientation={orientation}
      {...rest}
    >
      <ScrollAreaPrimitive.Viewport
        {...viewportProps}
        tabIndex={viewportProps?.tabIndex ?? 0}
        role={viewportProps?.role ?? (label ? "region" : undefined)}
        aria-label={viewportProps?.["aria-label"] ?? label}
        className={cn("dl-scroll-area__viewport", "dl-scrollbar", viewportClassName)}
        style={{ ...viewportStyle, ...viewportProps?.style }}
      >
        {children}
      </ScrollAreaPrimitive.Viewport>

      {orientation !== "horizontal" ? (
        <ScrollAreaPrimitive.Scrollbar
          orientation="vertical"
          className="dl-scroll-area__bar dl-scroll-area__bar--vertical"
        >
          <ScrollAreaPrimitive.Thumb className="dl-scroll-area__thumb" />
        </ScrollAreaPrimitive.Scrollbar>
      ) : null}

      {orientation !== "vertical" ? (
        <ScrollAreaPrimitive.Scrollbar
          orientation="horizontal"
          className="dl-scroll-area__bar dl-scroll-area__bar--horizontal"
        >
          <ScrollAreaPrimitive.Thumb className="dl-scroll-area__thumb" />
        </ScrollAreaPrimitive.Scrollbar>
      ) : null}

      {orientation === "both" ? (
        <ScrollAreaPrimitive.Corner className="dl-scroll-area__corner" />
      ) : null}
    </ScrollAreaPrimitive.Root>
  );
}
