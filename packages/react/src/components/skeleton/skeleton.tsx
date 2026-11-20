import * as React from "react";
import { cn } from "../../lib/cn";

export type SkeletonVariant = "text" | "rect" | "circle";

/** A CSS length. Numbers are treated as pixels. */
export type SkeletonLength = number | string;

export interface SkeletonProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "aria-hidden"> {
  ref?: React.Ref<HTMLDivElement>;
  /** Shape of the placeholder. Defaults to `"text"`. */
  variant?: SkeletonVariant;
  width?: SkeletonLength;
  height?: SkeletonLength;
  /** Text only: number of lines. The last line is 60% wide. Defaults to `1`. */
  lines?: number;
  className?: string;
}

function toLength(value: SkeletonLength | undefined): string | undefined {
  if (value === undefined) return undefined;
  return typeof value === "number" ? `${value}px` : value;
}

/**
 * Placeholder shape for content that is still loading. Always `aria-hidden`:
 * the busy state belongs on the surrounding container (`aria-busy`), never on
 * a dozen meaningless boxes. The sweep is a pseudo-element translate on the
 * compositor; `dl-anim-loop` turns it off for reduced motion, leaving the
 * static sunken fill.
 */
export function Skeleton(props: SkeletonProps) {
  const {
    variant = "text",
    width,
    height,
    lines = 1,
    className,
    style,
    ref,
    ...rest
  } = props;

  const lineCount = variant === "text" ? Math.max(1, Math.floor(lines)) : 1;

  if (variant === "text" && lineCount > 1) {
    return (
      <div
        ref={ref}
        className={cn("dl-skeleton__group", className)}
        style={{ width: toLength(width), ...style }}
        data-variant="text"
        {...rest}
        aria-hidden="true"
      >
        {Array.from({ length: lineCount }, (_, index) => (
          <span
            key={index}
            className="dl-skeleton dl-skeleton--text dl-anim-loop"
            style={{
              height: toLength(height),
              width: index === lineCount - 1 ? "60%" : "100%",
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={cn("dl-skeleton", `dl-skeleton--${variant}`, "dl-anim-loop", className)}
      style={{ width: toLength(width), height: toLength(height), ...style }}
      data-variant={variant}
      {...rest}
      aria-hidden="true"
    />
  );
}
