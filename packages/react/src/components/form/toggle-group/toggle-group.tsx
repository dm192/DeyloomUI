import * as React from "react";
import { Toggle as TogglePrimitive, ToggleGroup as ToggleGroupPrimitive } from "radix-ui";
import { m } from "motion/react";
import { cn } from "../../../lib/cn";
import { warnOnce } from "../../../lib/warn-once";
import { scales, springs } from "../../../motion/presets";
import { useDeyloomReducedMotion } from "../../../hooks";

export type ToggleVariant = "outline" | "ghost";
export type ToggleSize = "sm" | "md";
export type ToggleGroupOrientation = "horizontal" | "vertical";

export interface ToggleProps
  extends Omit<React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root>, "asChild"> {
  ref?: React.Ref<HTMLButtonElement>;
  /** Visual treatment. Defaults to `"outline"`. */
  variant?: ToggleVariant;
  /** Control height. Defaults to `"md"`. */
  size?: ToggleSize;
  /**
   * Unique item value. Required when the toggle is rendered inside a
   * `ToggleGroup`; ignored on a standalone toggle.
   */
  value?: string;
}

interface ToggleGroupUiContextValue {
  variant: ToggleVariant;
  size: ToggleSize;
  disabled: boolean;
}

const ToggleGroupUiContext = React.createContext<ToggleGroupUiContextValue | null>(null);

/**
 * Pressable toggle: one surface recipe shared with `Button` (`--_bg/--_fg/--_bd`),
 * one press spring and one focus ring.
 *
 * Standalone it owns its own pressed state. Inside a `ToggleGroup` it renders a
 * `ToggleGroup.Item` instead, so Radix supplies roving focus, `aria-checked` vs
 * `aria-pressed` semantics and the value wiring from the group.
 */
export function Toggle(props: ToggleProps) {
  const {
    ref,
    variant: variantProp,
    size: sizeProp,
    value,
    className,
    children,
    pressed,
    defaultPressed,
    onPressedChange,
    disabled,
    ...rest
  } = props;

  const group = React.useContext(ToggleGroupUiContext);
  const reducedMotion = useDeyloomReducedMotion();
  const variant = group?.variant ?? variantProp ?? "outline";
  const size = group?.size ?? sizeProp ?? "md";
  const isDisabled = disabled === true || group?.disabled === true;

  if (process.env.NODE_ENV !== "production" && group) {
    if (pressed !== undefined || defaultPressed !== undefined || onPressedChange) {
      warnOnce(
        "toggle-group-pressed",
        "`pressed`, `defaultPressed` and `onPressedChange` are owned by `ToggleGroup`; set a `value` on the toggle and control the group instead.",
      );
    }
    if (value === undefined) {
      warnOnce(
        "toggle-group-value",
        "A `Toggle` rendered inside `ToggleGroup` needs a unique `value` prop.",
      );
    }
  }

  const button = (
    <m.button
      ref={ref}
      type="button"
      className={cn("dl-toggle", "dl-focusable", className)}
      data-variant={variant}
      data-size={size}
      whileTap={isDisabled || reducedMotion ? undefined : { scale: scales.press }}
      transition={springs.press}
    >
      {children}
    </m.button>
  );

  if (group) {
    return (
      <ToggleGroupPrimitive.Item
        asChild
        value={value ?? ""}
        disabled={disabled}
        {...rest}
      >
        {button}
      </ToggleGroupPrimitive.Item>
    );
  }

  return (
    <TogglePrimitive.Root
      asChild
      pressed={pressed}
      defaultPressed={defaultPressed}
      onPressedChange={onPressedChange}
      disabled={disabled}
      {...rest}
    >
      {button}
    </TogglePrimitive.Root>
  );
}

interface ToggleGroupBaseProps {
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  children?: React.ReactNode;
  ref?: React.Ref<HTMLDivElement>;
  /** Visual treatment for every toggle in the group. Defaults to `"outline"`. */
  variant?: ToggleVariant;
  /** Control height for every toggle in the group. Defaults to `"md"`. */
  size?: ToggleSize;
  /** Layout axis, and the axis arrow keys travel on. Defaults to `"horizontal"`. */
  orientation?: ToggleGroupOrientation;
  /** Disables every toggle in the group. */
  disabled?: boolean;
  /** Keep Radix roving focus. Defaults to `true`. */
  rovingFocus?: boolean;
  /** Whether arrow-key focus wraps around. Defaults to `true`. */
  loop?: boolean;
  dir?: "ltr" | "rtl";
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
}

export interface ToggleGroupSingleProps extends ToggleGroupBaseProps {
  type: "single";
  /** The pressed item. Omit for an uncontrolled group. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

export interface ToggleGroupMultipleProps extends ToggleGroupBaseProps {
  type: "multiple";
  /** The pressed items. Omit for an uncontrolled group. */
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
}

export type ToggleGroupProps = ToggleGroupSingleProps | ToggleGroupMultipleProps;

/**
 * A material groove holding related toggles. The container carries the sunken
 * surface; the toggles inside drop their border and light up with the accent-soft
 * fill when pressed. Only colour transitions, and only `scales.press` for the tap.
 *
 * Keyboard behaviour and the ARIA model are delegated entirely to Radix:
 * `single` is a `radiogroup`, `multiple` a `toolbar`.
 */
export function ToggleGroup(props: ToggleGroupProps) {
  const {
    variant = "outline",
    size = "md",
    orientation = "horizontal",
    className,
    children,
    ref,
    disabled,
    rovingFocus,
    loop,
    dir,
    style,
    id,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-describedby": ariaDescribedBy,
  } = props;

  const contextValue = React.useMemo<ToggleGroupUiContextValue>(
    () => ({ variant, size, disabled: disabled === true }),
    [variant, size, disabled],
  );

  const shared = {
    className: cn("dl-toggle-group", className),
    style,
    id,
    orientation,
    disabled,
    rovingFocus,
    loop,
    dir,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-describedby": ariaDescribedBy,
    "data-variant": variant,
    "data-size": size,
    "data-orientation": orientation,
  };

  const content = (
    <ToggleGroupUiContext.Provider value={contextValue}>
      {children}
    </ToggleGroupUiContext.Provider>
  );

  if (props.type === "single") {
    return (
      <ToggleGroupPrimitive.Root
        {...shared}
        ref={ref}
        type="single"
        value={props.value}
        defaultValue={props.defaultValue}
        onValueChange={props.onValueChange}
      >
        {content}
      </ToggleGroupPrimitive.Root>
    );
  }

  return (
    <ToggleGroupPrimitive.Root
      {...shared}
      ref={ref}
      type="multiple"
      value={props.value}
      defaultValue={props.defaultValue}
      onValueChange={props.onValueChange}
    >
      {content}
    </ToggleGroupPrimitive.Root>
  );
}
