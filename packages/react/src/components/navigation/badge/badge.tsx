import * as React from "react";
import { cn } from "../../../lib/cn";

export type BadgeVariant = "solid" | "soft" | "outline";
export type BadgeTone = "accent" | "neutral" | "danger" | "success" | "warning";
export type BadgeSize = "sm" | "md";

export interface BadgeProps extends Omit<React.ComponentPropsWithoutRef<"span">, "ref"> {
  ref?: React.Ref<HTMLSpanElement>;
  /** Visual weight. `soft` is the default for status pills. */
  variant?: BadgeVariant;
  /** Semantic colour family. */
  tone?: BadgeTone;
  size?: BadgeSize;
  /** Adds a leading status dot. Decorative only. */
  dot?: boolean;
  children?: React.ReactNode;
}

/**
 * A compact, non-interactive label. Colour never carries meaning on its own —
 * the text always states the status; the dot is just a second cue.
 */
export function Badge(props: BadgeProps) {
  const {
    ref,
    variant = "soft",
    tone = "neutral",
    size = "md",
    dot = false,
    className,
    children,
    ...rest
  } = props;

  return (
    <span
      ref={ref}
      className={cn("dl-badge", className)}
      data-variant={variant}
      data-tone={tone}
      data-size={size}
      {...rest}
    >
      {dot ? <span className="dl-badge__dot" aria-hidden="true" /> : null}
      {children !== undefined && children !== null ? (
        <span className="dl-badge__label">{children}</span>
      ) : null}
    </span>
  );
}
