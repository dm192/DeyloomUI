import * as React from "react";
import { Separator as SeparatorPrimitive } from "radix-ui";
import { cn } from "../../../lib/cn";

export type SeparatorOrientation = "horizontal" | "vertical";

export interface SeparatorProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>,
    "orientation" | "ref"
  > {
  ref?: React.Ref<HTMLDivElement>;
  /** Layout direction of the rule. Defaults to `"horizontal"`. */
  orientation?: SeparatorOrientation;
  /**
   * Purely visual divider. Defaults to `true`: decorative rules are removed from
   * the accessibility tree, so they are never announced as structure.
   */
  decorative?: boolean;
}

/**
 * A 1px rule between blocks of content.
 *
 * Radix already renders decorative separators with `role="none"` (and exposes
 * `role="separator"` otherwise); we add `aria-hidden` on the decorative path so
 * older assistive tech drops it as well. The element never owns layout: a
 * vertical rule is stretched by its parent (`align-self: stretch`) instead of
 * carrying a hard-coded height.
 */
export function Separator(props: SeparatorProps) {
  const {
    ref,
    orientation = "horizontal",
    decorative = true,
    className,
    ...rest
  } = props;

  return (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn("dl-separator", className)}
      aria-hidden={decorative ? true : undefined}
      {...rest}
    />
  );
}
