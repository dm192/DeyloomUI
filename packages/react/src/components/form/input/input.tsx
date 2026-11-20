import * as React from "react";
import { cn } from "../../../lib/cn";
import { useFieldContext } from "../field";

export type InputSize = "sm" | "md" | "lg";

export interface InputProps extends Omit<React.ComponentProps<"input">, "size"> {
  ref?: React.Ref<HTMLInputElement>;
  /** Control height and type scale: 30 / 36 / 44px. */
  size?: InputSize;
  /** Paints the invalid state and sets `aria-invalid`. Defaults to the Field state. */
  invalid?: boolean;
  /** Decorative leading glyph. Kept `aria-hidden`; pair with a real label. */
  startIcon?: React.ReactNode;
  /** Decorative trailing glyph. */
  endIcon?: React.ReactNode;
  /** Class for the icon wrapper. `className` styles the native input itself. */
  containerClassName?: string;
}

/**
 * Single-line text control. Focus is drawn with a soft outer ring; the icon
 * wrapper exists only so leading/trailing glyphs can sit outside the input box.
 */
export function Input(props: InputProps) {
  const {
    ref,
    size = "md",
    invalid,
    startIcon,
    endIcon,
    className,
    containerClassName,
    style,
    disabled,
    required,
    id,
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
    "aria-labelledby": ariaLabelledBy,
    ...rest
  } = props;

  const field = useFieldContext();
  const controlId = id ?? field?.controlId;
  const isInvalid = invalid ?? field?.invalid ?? false;
  const isRequired = required ?? field?.required ?? false;
  const isDisabled = disabled ?? field?.disabled ?? false;
  const describedBy =
    [ariaDescribedBy, field?.describedById]
      .filter((value): value is string => Boolean(value))
      .join(" ") || undefined;
  const labelledBy =
    [ariaLabelledBy, field?.labelId]
      .filter((value): value is string => Boolean(value))
      .join(" ") || undefined;

  return (
    <div
      className={cn("dl-input", containerClassName)}
      data-size={size}
      data-invalid={isInvalid ? "true" : undefined}
      data-disabled={isDisabled ? "true" : undefined}
    >
      {startIcon ? (
        <span className="dl-input__icon" aria-hidden="true">
          {startIcon}
        </span>
      ) : null}
      <input
        ref={ref}
        id={controlId}
        className={cn("dl-input__control", className)}
        style={style}
        disabled={isDisabled}
        required={isRequired}
        aria-invalid={isInvalid || ariaInvalid || undefined}
        aria-describedby={describedBy}
        aria-labelledby={labelledBy || undefined}
        {...rest}
      />
      {endIcon ? (
        <span className="dl-input__icon" aria-hidden="true">
          {endIcon}
        </span>
      ) : null}
    </div>
  );
}
