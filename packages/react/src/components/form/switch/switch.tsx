import * as React from "react";
import { Switch as SwitchPrimitive } from "radix-ui";
import { m } from "motion/react";
import { cn } from "../../../lib/cn";
import { scales, springs } from "../../../motion/presets";
import { useDeyloomReducedMotion } from "../../../hooks";
import { useFieldContext } from "../field";

export type SwitchSize = "sm" | "md";

export interface SwitchProps
  extends Omit<
    React.ComponentProps<typeof SwitchPrimitive.Root>,
    "ref" | "checked" | "defaultChecked" | "onCheckedChange" | "children"
  > {
  ref?: React.Ref<HTMLButtonElement>;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  size?: SwitchSize;
  /** Paints the invalid state and sets `aria-invalid`. */
  invalid?: boolean;
}

/**
 * Binary toggle. The thumb travels `100%` of its own width on `springs.snappy`
 * so the distance stays right at every size without measuring the DOM.
 */
export function Switch(props: SwitchProps) {
  const {
    ref,
    checked: checkedProp,
    defaultChecked = false,
    onCheckedChange,
    size = "md",
    invalid,
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
  const [innerChecked, setInnerChecked] = React.useState(defaultChecked);
  const isChecked = checkedProp ?? innerChecked;
  const isInvalid = invalid ?? field?.invalid ?? false;
  const isDisabled = disabled ?? field?.disabled ?? false;
  const describedBy =
    [ariaDescribedBy, field?.describedById]
      .filter((entry): entry is string => Boolean(entry))
      .join(" ") || undefined;
  const labelledBy =
    [ariaLabelledBy, field?.labelId]
      .filter((entry): entry is string => Boolean(entry))
      .join(" ") || undefined;

  const handleCheckedChange = (next: boolean) => {
    if (checkedProp === undefined) setInnerChecked(next);
    onCheckedChange?.(next);
  };

  return (
    <SwitchPrimitive.Root
      asChild
      id={id ?? field?.controlId}
      checked={isChecked}
      onCheckedChange={handleCheckedChange}
      disabled={isDisabled}
      required={required ?? field?.required}
      aria-invalid={isInvalid || undefined}
      aria-describedby={describedBy}
      aria-labelledby={labelledBy || undefined}
      {...rest}
    >
      <m.button
        ref={ref}
        type="button"
        className={cn("dl-switch", "dl-focusable", className)}
        style={style}
        data-size={size}
        data-invalid={isInvalid ? "true" : undefined}
        whileTap={isDisabled || reducedMotion ? undefined : { scale: scales.press }}
        transition={springs.press}
      >
        <SwitchPrimitive.Thumb asChild>
          <m.span
            className="dl-switch__thumb"
            initial={false}
            animate={{ x: isChecked ? "100%" : "0%" }}
            transition={reducedMotion ? { duration: 0 } : springs.snappy}
          />
        </SwitchPrimitive.Thumb>
      </m.button>
    </SwitchPrimitive.Root>
  );
}
