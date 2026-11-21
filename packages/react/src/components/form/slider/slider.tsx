import * as React from "react";
import { Slider as SliderPrimitive } from "radix-ui";
import { cn } from "../../../lib/cn";
import { useFieldContext } from "../field";
import { computeSliderFill } from "./slider-math";

export type SliderSize = "sm" | "md";
export type SliderOrientation = "horizontal" | "vertical";

export interface SliderProps
  extends Omit<
    React.ComponentProps<typeof SliderPrimitive.Root>,
    "ref" | "value" | "defaultValue" | "onValueChange" | "children" | "orientation"
  > {
  ref?: React.Ref<HTMLDivElement>;
  /** One value for a single thumb, two for a range. */
  value?: number[];
  defaultValue?: number[];
  onValueChange?: (value: number[]) => void;
  /** Show the current value(s) as tabular digits. */
  showValue?: boolean;
  /** Formats the value readout. Defaults to the values joined by an en dash. */
  formatValue?: (value: number[]) => React.ReactNode;
  size?: SliderSize;
  /** Paints the invalid state and sets `aria-invalid` on every thumb. */
  invalid?: boolean;
  orientation?: SliderOrientation;
}

/**
 * Single or range slider on top of Radix.
 *
 * Geometry contract: the track is exactly one thumb tall, and the thumb is a
 * normal in-flow element inside Radix's positioning wrapper. That gives the
 * wrapper a real size, which is what makes `translate(-50%, -50%)` actually
 * centre and track the pointer. The fill is a scaleX/scaleY bar — never width.
 */
export function Slider(props: SliderProps) {
  const {
    ref,
    value: valueProp,
    defaultValue,
    onValueChange,
    showValue = false,
    formatValue,
    size = "md",
    invalid,
    className,
    style,
    disabled,
    min = 0,
    max = 100,
    step,
    orientation = "horizontal",
    id,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-describedby": ariaDescribedBy,
    onPointerDown,
    onPointerUp,
    onPointerCancel,
    ...rest
  } = props;

  const field = useFieldContext();
  const [innerValues, setInnerValues] = React.useState<number[]>(
    () => defaultValue ?? [min],
  );
  const [dragging, setDragging] = React.useState(false);

  const values = valueProp ?? innerValues;
  const isDisabled = disabled ?? field?.disabled ?? false;
  const isInvalid = invalid ?? field?.invalid ?? false;
  const labelledBy =
    [ariaLabelledBy, field?.labelId].filter((entry): entry is string => Boolean(entry)).join(" ") ||
    undefined;
  const describedBy =
    [ariaDescribedBy, field?.describedById]
      .filter((entry): entry is string => Boolean(entry))
      .join(" ") || undefined;

  const handleValueChange = (next: number[]) => {
    if (valueProp === undefined) setInnerValues(next);
    onValueChange?.(next);
  };

  React.useEffect(() => {
    if (!dragging) return;
    const stop = () => setDragging(false);
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    window.addEventListener("blur", stop);
    return () => {
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
      window.removeEventListener("blur", stop);
    };
  }, [dragging]);

  const fill = computeSliderFill(values, min, max);

  const fillStyle: React.CSSProperties =
    orientation === "vertical"
      ? {
          insetBlockEnd: `${fill.startPercent}%`,
          blockSize: `calc(100% - ${fill.startPercent}%)`,
          transform: `scaleY(${fill.scale})`,
        }
      : {
          insetInlineStart: `${fill.startPercent}%`,
          transform: `scaleX(${fill.scale})`,
        };

  const readout = formatValue
    ? formatValue(values)
    : values.length > 1
      ? values.join(" – ")
      : String(values[0] ?? min);

  const thumbLabel = (index: number): string | undefined => {
    if (!ariaLabel) return undefined;
    return values.length > 1 ? `${ariaLabel} ${index + 1}` : ariaLabel;
  };

  return (
    <div
      ref={ref}
      id={id ?? field?.controlId}
      className={cn("dl-slider", className)}
      style={style}
      data-size={size}
      data-dragging={dragging ? "true" : undefined}
      data-disabled={isDisabled ? "true" : undefined}
      data-invalid={isInvalid ? "true" : undefined}
      data-orientation={orientation}
    >
      <SliderPrimitive.Root
        className="dl-slider__root"
        value={values}
        onValueChange={handleValueChange}
        min={min}
        max={max}
        step={step}
        orientation={orientation}
        disabled={isDisabled}
        onPointerDown={(event) => {
          if (!isDisabled) setDragging(true);
          onPointerDown?.(event);
        }}
        onPointerUp={(event) => onPointerUp?.(event)}
        onPointerCancel={(event) => onPointerCancel?.(event)}
        {...rest}
      >
        <SliderPrimitive.Track className="dl-slider__track">
          <span className="dl-slider__fill" aria-hidden="true" style={fillStyle} />
          {values.map((_, index) => (
            <SliderPrimitive.Thumb
              // Thumb order is positional: index is the stable identity here.
              key={index}
              className="dl-slider__thumb dl-focusable"
              aria-label={thumbLabel(index)}
              aria-labelledby={index === 0 ? labelledBy : undefined}
              aria-describedby={describedBy}
              aria-invalid={isInvalid || undefined}
            >
              <span className="dl-slider__thumb-dot" aria-hidden="true" />
            </SliderPrimitive.Thumb>
          ))}
        </SliderPrimitive.Track>
      </SliderPrimitive.Root>
      {showValue ? (
        <output className="dl-slider__value" aria-hidden="true">
          {readout}
        </output>
      ) : null}
    </div>
  );
}
