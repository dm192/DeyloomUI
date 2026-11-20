import * as React from "react";
import { Tooltip as TooltipPrimitive } from "radix-ui";
import { AnimatePresence, m } from "motion/react";
import { cn } from "../../../lib/cn";
import { Button } from "../../button";
import { popoverPanel } from "../../../motion/variants";
import { useDeyloomPortalContainer } from "../../../hooks";

interface TooltipUiContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const TooltipUiContext = React.createContext<TooltipUiContextValue | null>(null);

export type TooltipProviderProps = React.ComponentProps<typeof TooltipPrimitive.Provider>;

/**
 * Groups tooltips so moving between triggers skips the delay. Wrap once near
 * the app root — `Tooltip` cannot render without it.
 */
export function TooltipProvider(props: TooltipProviderProps) {
  const { delayDuration = 300, ...rest } = props;
  return <TooltipPrimitive.Provider delayDuration={delayDuration} {...rest} />;
}

export type TooltipProps = React.ComponentProps<typeof TooltipPrimitive.Root>;

/** Controlled root. The wrapper owns `open` so content can animate its exit. */
export function Tooltip(props: TooltipProps) {
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

  const contextValue = React.useMemo<TooltipUiContextValue>(
    () => ({ open, setOpen: handleOpenChange }),
    [open, handleOpenChange],
  );

  return (
    <TooltipPrimitive.Root {...rest} open={open} onOpenChange={handleOpenChange}>
      <TooltipUiContext.Provider value={contextValue}>{children}</TooltipUiContext.Provider>
    </TooltipPrimitive.Root>
  );
}

export type TooltipTriggerProps = Omit<
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger>,
  "asChild"
> & {
  /** Render the child element instead of the default small button. */
  asChild?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
};

/**
 * Hover/focus target. The default renders a real button so every tooltip has a
 * focusable trigger; pass `asChild` to attach it to your own control.
 */
export function TooltipTrigger(props: TooltipTriggerProps) {
  const { asChild = false, className, children, ref, ...rest } = props;

  if (asChild) {
    return (
      <TooltipPrimitive.Trigger ref={ref} asChild className={className} {...rest}>
        {children}
      </TooltipPrimitive.Trigger>
    );
  }

  return (
    <TooltipPrimitive.Trigger ref={ref} asChild {...rest}>
      <Button
        variant="outline"
        tone="neutral"
        size="sm"
        className={cn("dl-tooltip__trigger", className)}
      >
        {children}
      </Button>
    </TooltipPrimitive.Trigger>
  );
}

export type TooltipContentProps = Omit<
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>,
  "asChild" | "forceMount"
> & {
  ref?: React.Ref<HTMLDivElement>;
};

/**
 * Portalled label. `popoverPanel` gives it an origin-aware scale entrance and a
 * short tween exit; the arrow inherits the same inverted surface token.
 */
export function TooltipContent(props: TooltipContentProps) {
  const { className, children, ref, sideOffset = 6, ...rest } = props;
  const ui = React.useContext(TooltipUiContext);
  const portalContainer = useDeyloomPortalContainer();
  const open = ui?.open ?? false;

  return (
    <AnimatePresence>
      {open ? (
        <TooltipPrimitive.Portal
          key="tooltip-portal"
          forceMount
          container={portalContainer}
        >
          <TooltipPrimitive.Content forceMount asChild sideOffset={sideOffset} {...rest}>
            <m.div
              ref={ref}
              className={cn("dl-tooltip", className)}
              variants={popoverPanel}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {children}
              <TooltipPrimitive.Arrow className="dl-tooltip__arrow" width={10} height={5} />
            </m.div>
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      ) : null}
    </AnimatePresence>
  );
}
