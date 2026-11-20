import * as React from "react";
import { Slot } from "radix-ui";
import { m } from "motion/react";
import type { HTMLMotionProps } from "motion/react";
import { cn } from "../../lib/cn";
import { warnOnce } from "../../lib/warn-once";
import { scales, springs } from "../../motion/presets";
import { useDeyloomReducedMotion } from "../../hooks";

export type ButtonVariant = "solid" | "soft" | "outline" | "ghost" | "link";
export type ButtonTone = "accent" | "neutral" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  ref?: React.Ref<HTMLButtonElement>;
  variant?: ButtonVariant;
  tone?: ButtonTone;
  size?: ButtonSize;
  /** Shows a spinner, sets `aria-busy` and blocks activation. Width never changes. */
  loading?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  /** Render as the child element (e.g. an anchor) with the same styles. */
  asChild?: boolean;
  children?: React.ReactNode;
}

/**
 * The reference component for Deyloom: one surface recipe, one press spring, one
 * focus ring. Every other interactive element follows this contract.
 */
export function Button(props: ButtonProps) {
  const {
    ref,
    variant = "solid",
    tone = "accent",
    size = "md",
    loading = false,
    startIcon,
    endIcon,
    asChild = false,
    className,
    children,
    disabled,
    type,
    ...rest
  } = props;

  const reducedMotion = useDeyloomReducedMotion();

  if (process.env.NODE_ENV !== "production") {
    if (asChild && !React.isValidElement(children)) {
      warnOnce(
        "button-as-child",
        "`asChild` expects exactly one React element child; falling back to a native button.",
      );
    }
  }

  const isDisabled = disabled === true || loading;
  const classes = cn("dl-btn", "dl-focusable", className);
  const stateProps = {
    "data-variant": variant,
    "data-tone": tone,
    "data-size": size,
    "data-loading": loading ? "true" : undefined,
  };

  const content = (
    <>
      {loading ? <span className="dl-spinner dl-btn__spinner" aria-hidden="true" /> : null}
      {!loading && startIcon ? (
        <span className="dl-btn__icon" aria-hidden="true">
          {startIcon}
        </span>
      ) : null}
      {children !== undefined && children !== null ? (
        <span className="dl-btn__label">{children}</span>
      ) : null}
      {!loading && endIcon ? (
        <span className="dl-btn__icon" aria-hidden="true">
          {endIcon}
        </span>
      ) : null}
    </>
  );

  if (asChild && React.isValidElement(children)) {
    const Comp = Slot.Root as React.ElementType;
    return (
      <Comp
        ref={ref}
        className={classes}
        {...stateProps}
        {...(rest as Record<string, unknown>)}
      >
        {children}
      </Comp>
    );
  }

  return (
    <m.button
      ref={ref}
      type={type ?? "button"}
      className={classes}
      {...stateProps}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      whileTap={isDisabled || reducedMotion ? undefined : { scale: scales.press }}
      transition={springs.press}
      {...rest}
    >
      {content}
    </m.button>
  );
}
