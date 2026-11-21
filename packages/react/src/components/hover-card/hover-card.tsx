import * as React from "react";
import { HoverCard as HoverCardPrimitive } from "radix-ui";
import { AnimatePresence, m } from "motion/react";
import { cn } from "../../lib/cn";
import { warnOnce } from "../../lib/warn-once";
import { useDeyloomPortalContainer } from "../../hooks";
import { popoverPanel } from "../../motion/variants";

interface HoverCardState {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const HoverCardStateContext = React.createContext<HoverCardState | null>(null);

export interface HoverCardProps {
  children?: React.ReactNode;
  /** Controlled visibility. Omit to let the hover card own its state. */
  open?: boolean;
  /** Initial visibility when uncontrolled. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Hover entry delay in ms. Radix defaults to 700. */
  openDelay?: number;
  /** Hover exit delay in ms. Radix defaults to 300. */
  closeDelay?: number;
}

/**
 * Delayed hover surface for rich previews. Radix owns the timing and the
 * open/close choreography — pointer enter/leave plus keyboard focus — while
 * Deyloom owns the panel material and its origin-aware scale.
 */
export function HoverCard(props: HoverCardProps) {
  const {
    children,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    openDelay,
    closeDelay,
  } = props;
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const open = openProp ?? uncontrolledOpen;

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (openProp === undefined) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [openProp, onOpenChange],
  );

  const state = React.useMemo<HoverCardState>(() => ({ open, setOpen }), [open, setOpen]);

  return (
    <HoverCardStateContext.Provider value={state}>
      <HoverCardPrimitive.Root
        open={open}
        onOpenChange={setOpen}
        openDelay={openDelay}
        closeDelay={closeDelay}
      >
        {children}
      </HoverCardPrimitive.Root>
    </HoverCardStateContext.Provider>
  );
}

export type HoverCardTriggerProps = Omit<
  React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Trigger>,
  "asChild"
> & {
  /** Render the child element instead of the default text button. */
  asChild?: boolean;
};

/**
 * The hover/focus target. It is a real `<button type="button">` by default so
 * keyboard users can reach it; `asChild` slots the same behaviour onto your own
 * control instead of nesting two interactive elements.
 */
export function HoverCardTrigger(props: HoverCardTriggerProps) {
  const { asChild = false, className, children, ...rest } = props;

  if (asChild) {
    return (
      <HoverCardPrimitive.Trigger asChild className={className} {...rest}>
        {children}
      </HoverCardPrimitive.Trigger>
    );
  }

  return (
    <HoverCardPrimitive.Trigger asChild {...rest}>
      <button
        type="button"
        className={cn("dl-hover-card__trigger", "dl-focusable", className)}
      >
        {children}
      </button>
    </HoverCardPrimitive.Trigger>
  );
}

export interface HoverCardContentProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>,
    "forceMount" | "asChild"
  > {
  /** Gap between the trigger and the panel in px. Defaults to `8`. */
  sideOffset?: number;
  /** Renders a small pointing arrow. Defaults to `false`. */
  arrow?: boolean;
  ref?: React.Ref<HTMLDivElement>;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Floating panel. Mounted through `forceMount` + `AnimatePresence` so the exit
 * tween still has a DOM node to animate, with the transform origin Radix exposes
 * for the panel's current side.
 */
export function HoverCardContent(props: HoverCardContentProps) {
  const { className, children, arrow = false, sideOffset = 8, ref, ...rest } = props;
  const state = React.useContext(HoverCardStateContext);
  const portalContainer = useDeyloomPortalContainer();
  const open = state?.open ?? false;

  if (process.env.NODE_ENV !== "production" && !state) {
    warnOnce(
      "hover-card-content-parent",
      "`HoverCardContent` must be rendered inside `<HoverCard>`.",
    );
  }

  return (
    <AnimatePresence>
      {open ? (
        <HoverCardPrimitive.Portal forceMount container={portalContainer ?? undefined}>
          <HoverCardPrimitive.Content forceMount asChild sideOffset={sideOffset} {...rest}>
            <m.div
              ref={ref}
              className={cn("dl-hover-card", className)}
              variants={popoverPanel}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {children}
              {arrow ? (
                <HoverCardPrimitive.Arrow className="dl-hover-card__arrow" width={12} height={6} />
              ) : null}
            </m.div>
          </HoverCardPrimitive.Content>
        </HoverCardPrimitive.Portal>
      ) : null}
    </AnimatePresence>
  );
}
