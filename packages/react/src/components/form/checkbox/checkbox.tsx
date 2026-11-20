import * as React from "react";
import { Checkbox as CheckboxPrimitive } from "radix-ui";
import { m } from "motion/react";
import { cn } from "../../../lib/cn";
import { CheckIcon, MinusIcon } from "../../../lib/icons";
import { scales, springs } from "../../../motion/presets";
import { useDeyloomReducedMotion } from "../../../hooks";
import { useFieldContext } from "../field";

export type CheckboxSize = "sm" | "md" | "lg";
/** Radix's tri-state checked value. */
export type CheckboxCheckedState = boolean | "indeterminate";

export interface CheckboxProps
  extends Omit<
    React.ComponentProps<typeof CheckboxPrimitive.Root>,
    "checked" | "defaultChecked" | "onCheckedChange" | "children"
  > {
  ref?: React.Ref<HTMLButtonElement>;
  checked?: CheckboxCheckedState;
  defaultChecked?: CheckboxCheckedState;
  onCheckedChange?: (checked: CheckboxCheckedState) => void;
  /** Forces the mixed state and paints a dash instead of a check. */
  indeterminate?: boolean;
  /** Paints the invalid state and sets `aria-invalid`. */
  invalid?: boolean;
  size?: CheckboxSize;
  /** Clickable text rendered next to the box; becomes the accessible name. */
  label?: React.ReactNode;
}

/**
 * Tri-state checkbox built on Radix. The tick draws itself with
 * `stroke-dashoffset` and the box settles with a 4% pop; nothing else moves.
 */
export function Checkbox(props: CheckboxProps) {
  const {
    ref,
    checked,
    defaultChecked,
    onCheckedChange,
    indeterminate = false,
    invalid,
    size = "md",
    label,
    className,
    style,
    disabled,
    required,
    id,
    "aria-describedby": ariaDescribedBy,
    "aria-labelledby": ariaLabelledBy,
    ...rest
  } = props;

  const field = useFieldContext();
  const reducedMotion = useDeyloomReducedMotion();
  const autoLabelId = React.useId();
  const ownLabelId = label !== undefined ? `${autoLabelId}-label` : undefined;
  const controlId = id ?? field?.controlId;
  const isInvalid = invalid ?? field?.invalid ?? false;
  const isRequired = required ?? field?.required ?? false;
  const isDisabled = disabled ?? field?.disabled ?? false;
  const describedBy =
    [ariaDescribedBy, field?.describedById]
      .filter((entry): entry is string => Boolean(entry))
      .join(" ") || undefined;
  // A local label names the control; otherwise the Field label does.
  const labelledBy =
    [ariaLabelledBy, ownLabelId ?? field?.labelId]
      .filter((entry): entry is string => Boolean(entry))
      .join(" ") || undefined;

  const resolvedChecked = indeterminate ? "indeterminate" : checked;
  const resolvedDefaultChecked = indeterminate ? "indeterminate" : defaultChecked;

  return (
    <CheckboxPrimitive.Root
      asChild
      id={controlId}
      checked={resolvedChecked}
      defaultChecked={resolvedDefaultChecked}
      onCheckedChange={onCheckedChange}
      disabled={isDisabled}
      required={isRequired}
      aria-invalid={isInvalid || undefined}
      aria-describedby={describedBy}
      aria-labelledby={labelledBy || undefined}
      {...rest}
    >
      <m.button
        ref={ref}
        type="button"
        className={cn("dl-checkbox", "dl-focusable", className)}
        style={style}
        data-size={size}
        data-invalid={isInvalid ? "true" : undefined}
        whileTap={isDisabled || reducedMotion ? undefined : { scale: scales.press }}
        transition={springs.press}
      >
        <span className="dl-checkbox__box" aria-hidden="true">
          <CheckIcon className="dl-checkbox__check" />
          <MinusIcon className="dl-checkbox__minus" />
        </span>
        {label !== undefined ? (
          <span className="dl-checkbox__label" id={ownLabelId}>
            {label}
          </span>
        ) : null}
      </m.button>
    </CheckboxPrimitive.Root>
  );
}
