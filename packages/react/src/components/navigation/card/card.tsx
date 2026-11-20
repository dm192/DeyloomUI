import * as React from "react";
import { m } from "motion/react";
import type { HTMLMotionProps } from "motion/react";
import { cn } from "../../../lib/cn";
import { scales, springs } from "../../../motion/presets";
import { useDeyloomReducedMotion } from "../../../hooks";

export type CardElevation = 1 | 2 | 3;

export interface CardProps extends Omit<HTMLMotionProps<"div">, "ref"> {
  ref?: React.Ref<HTMLDivElement>;
  /** Adds a hover lift. Pair it with an `onClick` for clickable cards. */
  interactive?: boolean;
  /** Resting elevation. `1` for inline content, `3` for floating panels. */
  elevation?: CardElevation;
  children?: React.ReactNode;
}

/**
 * The container recipe: one surface, three elevations. A card never animates
 * size — only its shadow, border and a 1px lift carry the hover state.
 */
export function Card(props: CardProps) {
  const { ref, interactive = false, elevation = 1, className, children, ...rest } = props;
  const reducedMotion = useDeyloomReducedMotion();
  const pressable =
    interactive &&
    !reducedMotion &&
    (typeof rest.onClick === "function" || rest.role === "button");

  return (
    <m.div
      ref={ref}
      className={cn("dl-card", "dl-focusable", className)}
      data-interactive={interactive ? "true" : undefined}
      data-elevation={elevation}
      whileTap={pressable ? { scale: scales.press } : undefined}
      transition={springs.press}
      {...rest}
    >
      {children}
    </m.div>
  );
}

export type CardHeaderProps = React.ComponentPropsWithRef<"div">;

export function CardHeader(props: CardHeaderProps) {
  const { className, ...rest } = props;
  return <div {...rest} className={cn("dl-card__header", className)} />;
}

export type CardTitleProps = React.ComponentPropsWithRef<"h3">;

export function CardTitle(props: CardTitleProps) {
  const { className, ...rest } = props;
  return <h3 {...rest} className={cn("dl-card__title", className)} />;
}

export type CardDescriptionProps = React.ComponentPropsWithRef<"p">;

export function CardDescription(props: CardDescriptionProps) {
  const { className, ...rest } = props;
  return <p {...rest} className={cn("dl-card__description", className)} />;
}

export type CardContentProps = React.ComponentPropsWithRef<"div">;

export function CardContent(props: CardContentProps) {
  const { className, ...rest } = props;
  return <div {...rest} className={cn("dl-card__content", className)} />;
}

export type CardFooterProps = React.ComponentPropsWithRef<"div">;

export function CardFooter(props: CardFooterProps) {
  const { className, ...rest } = props;
  return <div {...rest} className={cn("dl-card__footer", className)} />;
}
