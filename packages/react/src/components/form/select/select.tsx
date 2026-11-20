import * as React from "react";
import { Select as SelectPrimitive } from "radix-ui";
import { m } from "motion/react";
import { cn } from "../../../lib/cn";
import { CheckIcon, ChevronDownIcon } from "../../../lib/icons";
import { popoverPanel } from "../../../motion/variants";
import { scales, springs } from "../../../motion/presets";
import { useDeyloomPortalContainer, useDeyloomReducedMotion } from "../../../hooks";
import { useFieldContext } from "../field";

export type SelectSize = "sm" | "md" | "lg";

/**
 * The Root owns mounting for the whole group.
 *
 * Radix unmounts content the instant `open` flips, but its closed content stays
 * mounted (into a detached fragment) so `Select.Value` can receive the selected
 * item's text. We therefore keep the Root open until the panel has finished its
 * exit variant, and drive the panel with the shared `popoverPanel` variants.
 */
interface SelectState {
  open: boolean;
  panelPresent: boolean;
  setOpen: (open: boolean) => void;
  onPanelAnimationComplete: () => void;
}

const SelectStateContext = React.createContext<SelectState | null>(null);

export interface SelectProps
  extends Omit<
    React.ComponentProps<typeof SelectPrimitive.Root>,
    "open" | "defaultOpen" | "onOpenChange"
  > {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/** Dropdown Root. Fully controllable through `open` / `onOpenChange`. */
export function Select(props: SelectProps) {
  const { open: openProp, defaultOpen = false, onOpenChange, ...rest } = props;
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const open = openProp ?? uncontrolledOpen;

  const [panelPresent, setPanelPresent] = React.useState(open);
  const panelPresentRef = React.useRef(panelPresent);
  panelPresentRef.current = panelPresent;
  const openRef = React.useRef(open);
  openRef.current = open;

  React.useEffect(() => {
    if (openProp !== undefined) setPanelPresent(openProp);
  }, [openProp]);

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (next) {
        setPanelPresent(true);
        if (openProp === undefined) setUncontrolledOpen(true);
      } else {
        // Keep the Root open while the panel plays its exit variant; the Root
        // itself closes from onPanelAnimationComplete.
        setPanelPresent(false);
      }
      onOpenChange?.(next);
    },
    [openProp, onOpenChange],
  );

  const onPanelAnimationComplete = React.useCallback(() => {
    if (panelPresentRef.current || !openRef.current) return;
    setUncontrolledOpen(false);
  }, []);

  const state = React.useMemo<SelectState>(
    () => ({ open, panelPresent, setOpen, onPanelAnimationComplete }),
    [open, panelPresent, setOpen, onPanelAnimationComplete],
  );

  return (
    <SelectStateContext.Provider value={state}>
      <SelectPrimitive.Root open={open} onOpenChange={setOpen} {...rest} />
    </SelectStateContext.Provider>
  );
}

export interface SelectValueProps
  extends Omit<React.ComponentProps<typeof SelectPrimitive.Value>, "ref"> {
  ref?: React.Ref<HTMLSpanElement>;
}

/** Renders the selected item's text, or `placeholder` while empty. */
export function SelectValue(props: SelectValueProps) {
  const { className, ...rest } = props;
  return <SelectPrimitive.Value className={cn("dl-select-value", className)} {...rest} />;
}

export interface SelectTriggerProps
  extends Omit<React.ComponentProps<typeof SelectPrimitive.Trigger>, "ref"> {
  ref?: React.Ref<HTMLButtonElement>;
  size?: SelectSize;
  invalid?: boolean;
}

/** The combobox button. Wires itself to an enclosing `Field`. */
export function SelectTrigger(props: SelectTriggerProps) {
  const {
    ref,
    size = "md",
    invalid,
    className,
    children,
    disabled,
    id,
    "aria-describedby": ariaDescribedBy,
    "aria-labelledby": ariaLabelledBy,
    ...rest
  } = props;

  const field = useFieldContext();
  const reducedMotion = useDeyloomReducedMotion();
  const isInvalid = invalid ?? field?.invalid ?? false;
  const isDisabled = disabled ?? field?.disabled ?? false;
  const controlId = id ?? field?.controlId;
  const describedBy =
    [ariaDescribedBy, field?.describedById]
      .filter((entry): entry is string => Boolean(entry))
      .join(" ") || undefined;
  const labelledBy =
    [ariaLabelledBy, field?.labelId]
      .filter((entry): entry is string => Boolean(entry))
      .join(" ") || undefined;

  return (
    <SelectPrimitive.Trigger
      asChild
      id={controlId}
      className={cn("dl-select-trigger", "dl-focusable", className)}
      data-size={size}
      data-invalid={isInvalid ? "true" : undefined}
      disabled={isDisabled}
      aria-invalid={isInvalid || undefined}
      aria-describedby={describedBy}
      aria-labelledby={labelledBy || undefined}
      {...rest}
    >
      <m.button
        ref={ref}
        type="button"
        whileTap={isDisabled || reducedMotion ? undefined : { scale: scales.press }}
        transition={springs.press}
      >
        <span className="dl-select-trigger__value">{children}</span>
        <SelectPrimitive.Icon className="dl-select-trigger__icon" aria-hidden="true">
          <ChevronDownIcon />
        </SelectPrimitive.Icon>
      </m.button>
    </SelectPrimitive.Trigger>
  );
}

export interface SelectContentProps
  extends Omit<React.ComponentProps<typeof SelectPrimitive.Content>, "ref" | "children"> {
  ref?: React.Ref<HTMLDivElement>;
  children?: React.ReactNode;
}

/** Portalled listbox that enters and exits with the shared popover variants. */
export function SelectContent(props: SelectContentProps) {
  const { className, children, ...rest } = props;
  const portalContainer = useDeyloomPortalContainer();
  const state = React.useContext(SelectStateContext);

  return (
    <SelectPrimitive.Portal container={portalContainer ?? undefined}>
      <SelectPrimitive.Content
        className={cn("dl-select-content", className)}
        position="popper"
        sideOffset={6}
        {...rest}
      >
        <m.div
          className="dl-select-content__panel"
          variants={popoverPanel}
          initial="initial"
          animate={state ? (state.panelPresent ? "animate" : "exit") : "animate"}
          onAnimationComplete={state?.onPanelAnimationComplete}
        >
          <SelectPrimitive.Viewport className="dl-select-viewport">
            {children}
          </SelectPrimitive.Viewport>
        </m.div>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

export interface SelectItemProps
  extends Omit<React.ComponentProps<typeof SelectPrimitive.Item>, "ref"> {
  ref?: React.Ref<HTMLDivElement>;
}

/** One selectable option. Shows a check indicator when selected. */
export function SelectItem(props: SelectItemProps) {
  const { className, children, ...rest } = props;
  return (
    <SelectPrimitive.Item className={cn("dl-select-item", className)} {...rest}>
      <span className="dl-select-item__text">
        <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      </span>
      <SelectPrimitive.ItemIndicator className="dl-select-item__indicator">
        <CheckIcon />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}

export interface SelectGroupProps
  extends Omit<React.ComponentProps<typeof SelectPrimitive.Group>, "ref"> {
  ref?: React.Ref<HTMLDivElement>;
}

export function SelectGroup(props: SelectGroupProps) {
  const { className, ...rest } = props;
  return <SelectPrimitive.Group className={cn("dl-select-group", className)} {...rest} />;
}

export interface SelectLabelProps
  extends Omit<React.ComponentProps<typeof SelectPrimitive.Label>, "ref"> {
  ref?: React.Ref<HTMLDivElement>;
}

export function SelectLabel(props: SelectLabelProps) {
  const { className, ...rest } = props;
  return <SelectPrimitive.Label className={cn("dl-select-label", className)} {...rest} />;
}

export interface SelectSeparatorProps
  extends Omit<React.ComponentProps<typeof SelectPrimitive.Separator>, "ref"> {
  ref?: React.Ref<HTMLDivElement>;
}

export function SelectSeparator(props: SelectSeparatorProps) {
  const { className, ...rest } = props;
  return (
    <SelectPrimitive.Separator className={cn("dl-select-separator", className)} {...rest} />
  );
}
