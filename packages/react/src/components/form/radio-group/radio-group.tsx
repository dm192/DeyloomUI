import * as React from "react";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";
import { m } from "motion/react";
import { cn } from "../../../lib/cn";
import { scales, springs } from "../../../motion/presets";
import { useDeyloomReducedMotion } from "../../../hooks";
import { useFieldContext } from "../field";

export type RadioGroupOrientation = "horizontal" | "vertical";
export type RadioGroupSize = "sm" | "md" | "lg";

export interface RadioGroupProps
  extends Omit<React.ComponentProps<typeof RadioGroupPrimitive.Root>, "ref"> {
  ref?: React.Ref<HTMLDivElement>;
  orientation?: RadioGroupOrientation;
  /** Paints every item as invalid and sets `aria-invalid` on the group. */
  invalid?: boolean;
  size?: RadioGroupSize;
}

export interface RadioGroupItemProps
  extends Omit<React.ComponentProps<typeof RadioGroupPrimitive.Item>, "ref" | "children"> {
  ref?: React.Ref<HTMLButtonElement>;
  /** Clickable text next to the dot; becomes the item's accessible name. */
  label?: React.ReactNode;
  size?: RadioGroupSize;
  invalid?: boolean;
}

interface RadioGroupState {
  size: RadioGroupSize;
}

const RadioGroupContext = React.createContext<RadioGroupState>({ size: "md" });

/**
 * Radio group on top of Radix. The selected dot scales from 0.4 and fades in;
 * the ring only transitions `border-color`, so the group never relayouts.
 */
export function RadioGroup(props: RadioGroupProps) {
  const {
    ref,
    orientation = "vertical",
    invalid,
    size = "md",
    className,
    disabled,
    required,
    id,
    "aria-describedby": ariaDescribedBy,
    "aria-labelledby": ariaLabelledBy,
    ...rest
  } = props;

  const field = useFieldContext();
  const isInvalid = invalid ?? field?.invalid ?? false;
  const describedBy =
    [ariaDescribedBy, field?.describedById]
      .filter((entry): entry is string => Boolean(entry))
      .join(" ") || undefined;
  const labelledBy =
    [ariaLabelledBy, field?.labelId]
      .filter((entry): entry is string => Boolean(entry))
      .join(" ") || undefined;

  const context = React.useMemo<RadioGroupState>(() => ({ size }), [size]);

  return (
    <RadioGroupContext.Provider value={context}>
      <RadioGroupPrimitive.Root
        ref={ref}
        id={id ?? field?.controlId}
        className={cn("dl-radio-group", className)}
        orientation={orientation}
        disabled={disabled ?? field?.disabled}
        required={required ?? field?.required}
        aria-invalid={isInvalid || undefined}
        aria-describedby={describedBy}
        aria-labelledby={labelledBy || undefined}
        data-size={size}
        data-invalid={isInvalid ? "true" : undefined}
        {...rest}
      />
    </RadioGroupContext.Provider>
  );
}

/** One option of a `RadioGroup`. Renders its own dot plus optional label text. */
export function RadioGroupItem(props: RadioGroupItemProps) {
  const {
    ref,
    value,
    label,
    size,
    invalid,
    className,
    disabled,
    "aria-describedby": ariaDescribedBy,
    ...rest
  } = props;

  const { size: groupSize } = React.useContext(RadioGroupContext);
  const field = useFieldContext();
  const reducedMotion = useDeyloomReducedMotion();
  const resolvedSize = size ?? groupSize;
  const isInvalid = invalid ?? field?.invalid ?? false;
  const describedBy =
    [ariaDescribedBy, field?.describedById]
      .filter((entry): entry is string => Boolean(entry))
      .join(" ") || undefined;

  return (
    <RadioGroupPrimitive.Item
      asChild
      value={value}
      disabled={disabled}
      aria-describedby={describedBy}
      {...rest}
    >
      <m.button
        ref={ref}
        type="button"
        className={cn("dl-radio", "dl-focusable", className)}
        data-size={resolvedSize}
        data-invalid={isInvalid ? "true" : undefined}
        whileTap={disabled || reducedMotion ? undefined : { scale: scales.press }}
        transition={springs.press}
      >
        <span className="dl-radio__dot" aria-hidden="true">
          <span className="dl-radio__dot-fill" />
        </span>
        {label !== undefined ? <span className="dl-radio__label">{label}</span> : null}
      </m.button>
    </RadioGroupPrimitive.Item>
  );
}
