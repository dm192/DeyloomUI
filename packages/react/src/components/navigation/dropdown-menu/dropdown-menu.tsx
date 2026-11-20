import * as React from "react";
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui";
import { AnimatePresence, m } from "motion/react";
import { cn } from "../../../lib/cn";
import { Button } from "../../button";
import { CheckIcon } from "../../../lib/icons";
import { popoverPanel } from "../../../motion/variants";
import { useDeyloomPortalContainer } from "../../../hooks";

interface DropdownMenuUiContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DropdownMenuUiContext = React.createContext<DropdownMenuUiContextValue | null>(null);

export type DropdownMenuProps = React.ComponentProps<typeof DropdownMenuPrimitive.Root>;

/** Controlled root; the wrapper owns `open` so the menu can animate its exit. */
export function DropdownMenu(props: DropdownMenuProps) {
  const { open: openProp, defaultOpen = false, onOpenChange, children, ...rest } = props;
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : uncontrolledOpen;

  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const contextValue = React.useMemo<DropdownMenuUiContextValue>(
    () => ({ open, setOpen: handleOpenChange }),
    [open, handleOpenChange],
  );

  return (
    <DropdownMenuPrimitive.Root {...rest} open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuUiContext.Provider value={contextValue}>
        {children}
      </DropdownMenuUiContext.Provider>
    </DropdownMenuPrimitive.Root>
  );
}

export type DropdownMenuTriggerProps = Omit<
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Trigger>,
  "asChild"
> & {
  /** Render the child element instead of the default outline button. */
  asChild?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
};

export function DropdownMenuTrigger(props: DropdownMenuTriggerProps) {
  const { asChild = false, className, children, ref, ...rest } = props;

  if (asChild) {
    return (
      <DropdownMenuPrimitive.Trigger ref={ref} asChild className={className} {...rest}>
        {children}
      </DropdownMenuPrimitive.Trigger>
    );
  }

  return (
    <DropdownMenuPrimitive.Trigger ref={ref} asChild {...rest}>
      <Button
        variant="outline"
        tone="neutral"
        size="md"
        className={cn("dl-dropdown-menu__trigger", className)}
      >
        {children}
      </Button>
    </DropdownMenuPrimitive.Trigger>
  );
}

export type DropdownMenuContentProps = Omit<
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>,
  "asChild" | "forceMount"
> & {
  ref?: React.Ref<HTMLDivElement>;
};

/**
 * Portalled menu panel. Enter/exit uses the shared `popoverPanel` variant so a
 * menu and a popover read as the same material; items only animate colour.
 * Focus, roving tabindex and typeahead stay entirely inside Radix.
 */
export function DropdownMenuContent(props: DropdownMenuContentProps) {
  const { className, children, ref, sideOffset = 6, ...rest } = props;
  const ui = React.useContext(DropdownMenuUiContext);
  const portalContainer = useDeyloomPortalContainer();
  const open = ui?.open ?? false;

  return (
    <AnimatePresence>
      {open ? (
        <DropdownMenuPrimitive.Portal
          key="dropdown-menu-portal"
          forceMount
          container={portalContainer}
        >
          <DropdownMenuPrimitive.Content forceMount asChild sideOffset={sideOffset} {...rest}>
            <m.div
              ref={ref}
              className={cn("dl-dropdown-menu", className)}
              variants={popoverPanel}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {children}
            </m.div>
          </DropdownMenuPrimitive.Content>
        </DropdownMenuPrimitive.Portal>
      ) : null}
    </AnimatePresence>
  );
}

export type DropdownMenuItemProps = Omit<
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>,
  "asChild"
> & {
  /** Aligns the label with items that carry a leading icon or checkmark. */
  inset?: boolean;
  ref?: React.Ref<HTMLDivElement>;
};

export function DropdownMenuItem(props: DropdownMenuItemProps) {
  const { className, inset = false, ...rest } = props;

  return (
    <DropdownMenuPrimitive.Item
      {...rest}
      className={cn("dl-dropdown-menu__item", "dl-focusable", className)}
      data-inset={inset ? "" : undefined}
    />
  );
}

export type DropdownMenuCheckboxItemProps = Omit<
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  "asChild"
> & {
  inset?: boolean;
  ref?: React.Ref<HTMLDivElement>;
};

export function DropdownMenuCheckboxItem(props: DropdownMenuCheckboxItemProps) {
  const { className, inset = false, children, ...rest } = props;

  return (
    <DropdownMenuPrimitive.CheckboxItem
      {...rest}
      className={cn("dl-dropdown-menu__item", "dl-dropdown-menu__item--check", className)}
      data-inset={inset ? "" : undefined}
    >
      <span className="dl-dropdown-menu__indicator" aria-hidden="true">
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  );
}

export type DropdownMenuSeparatorProps = React.ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.Separator
> & {
  ref?: React.Ref<HTMLDivElement>;
};

export function DropdownMenuSeparator(props: DropdownMenuSeparatorProps) {
  const { className, ...rest } = props;
  return (
    <DropdownMenuPrimitive.Separator
      {...rest}
      className={cn("dl-dropdown-menu__separator", className)}
    />
  );
}

export type DropdownMenuLabelProps = React.ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.Label
> & {
  ref?: React.Ref<HTMLDivElement>;
};

export function DropdownMenuLabel(props: DropdownMenuLabelProps) {
  const { className, ...rest } = props;
  return (
    <DropdownMenuPrimitive.Label
      {...rest}
      className={cn("dl-dropdown-menu__label", className)}
    />
  );
}

export type DropdownMenuShortcutProps = React.ComponentPropsWithRef<"span">;

/** Visual keyboard hint. Hidden from assistive tech: the shortcut is extra. */
export function DropdownMenuShortcut(props: DropdownMenuShortcutProps) {
  const { className, ...rest } = props;
  return (
    <span
      aria-hidden="true"
      {...rest}
      className={cn("dl-dropdown-menu__shortcut", className)}
    />
  );
}
