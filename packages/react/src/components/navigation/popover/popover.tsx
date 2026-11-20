import * as React from "react";
import { Popover as PopoverPrimitive } from "radix-ui";
import { AnimatePresence, m } from "motion/react";
import { cn } from "../../../lib/cn";
import { Button } from "../../button";
import { IconButton } from "../../icon-button";
import { XIcon } from "../../../lib/icons";
import { popoverPanel } from "../../../motion/variants";
import { useDeyloomPortalContainer } from "../../../hooks";

interface PopoverUiContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const PopoverUiContext = React.createContext<PopoverUiContextValue | null>(null);

export type PopoverProps = React.ComponentProps<typeof PopoverPrimitive.Root>;

/** Controlled root; the wrapper owns `open` so the panel can animate its exit. */
export function Popover(props: PopoverProps) {
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

  const contextValue = React.useMemo<PopoverUiContextValue>(
    () => ({ open, setOpen: handleOpenChange }),
    [open, handleOpenChange],
  );

  return (
    <PopoverPrimitive.Root {...rest} open={open} onOpenChange={handleOpenChange}>
      <PopoverUiContext.Provider value={contextValue}>{children}</PopoverUiContext.Provider>
    </PopoverPrimitive.Root>
  );
}

export type PopoverTriggerProps = Omit<
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Trigger>,
  "asChild"
> & {
  /** Render the child element instead of the default outline button. */
  asChild?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
};

export function PopoverTrigger(props: PopoverTriggerProps) {
  const { asChild = false, className, children, ref, ...rest } = props;

  if (asChild) {
    return (
      <PopoverPrimitive.Trigger ref={ref} asChild className={className} {...rest}>
        {children}
      </PopoverPrimitive.Trigger>
    );
  }

  return (
    <PopoverPrimitive.Trigger ref={ref} asChild {...rest}>
      <Button
        variant="outline"
        tone="neutral"
        size="md"
        className={cn("dl-popover__trigger", className)}
      >
        {children}
      </Button>
    </PopoverPrimitive.Trigger>
  );
}

export type PopoverContentProps = Omit<
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>,
  "asChild" | "forceMount"
> & {
  ref?: React.Ref<HTMLDivElement>;
};

/** Floating panel: card surface, origin-aware scale-in, tween exit. */
export function PopoverContent(props: PopoverContentProps) {
  const { className, children, ref, sideOffset = 8, ...rest } = props;
  const ui = React.useContext(PopoverUiContext);
  const portalContainer = useDeyloomPortalContainer();
  const open = ui?.open ?? false;

  return (
    <AnimatePresence>
      {open ? (
        <PopoverPrimitive.Portal
          key="popover-portal"
          forceMount
          container={portalContainer}
        >
          <PopoverPrimitive.Content forceMount asChild sideOffset={sideOffset} {...rest}>
            <m.div
              ref={ref}
              className={cn("dl-popover", className)}
              variants={popoverPanel}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {children}
            </m.div>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      ) : null}
    </AnimatePresence>
  );
}

export type PopoverHeaderProps = React.ComponentPropsWithRef<"div">;

export function PopoverHeader(props: PopoverHeaderProps) {
  const { className, ...rest } = props;
  return <div {...rest} className={cn("dl-popover__header", className)} />;
}

export type PopoverTitleProps = React.ComponentPropsWithRef<"h2">;

export function PopoverTitle(props: PopoverTitleProps) {
  const { className, ...rest } = props;
  return <h2 {...rest} className={cn("dl-popover__title", className)} />;
}

export type PopoverCloseProps = Omit<
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Close>,
  "asChild"
> & {
  /** Accessible name for the close button. */
  label?: string;
  ref?: React.Ref<HTMLButtonElement>;
};

/** The one close button recipe: small ghost icon button wired to Radix Close. */
export function PopoverClose(props: PopoverCloseProps) {
  const { label = "关闭", className, children, ref, ...rest } = props;

  return (
    <PopoverPrimitive.Close asChild {...rest}>
      <IconButton
        ref={ref}
        label={label}
        size="sm"
        variant="ghost"
        className={cn("dl-popover__close", className)}
      >
        {children ?? <XIcon />}
      </IconButton>
    </PopoverPrimitive.Close>
  );
}
