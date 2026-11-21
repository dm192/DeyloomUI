import * as React from "react";
import { AlertDialog as AlertDialogPrimitive } from "radix-ui";
import { AnimatePresence, m } from "motion/react";
import { cn } from "../../lib/cn";
import { warnOnce } from "../../lib/warn-once";
import { useDeyloomPortalContainer } from "../../hooks";
import { backdrop, overlayPanel } from "../../motion/variants";
import { Button } from "../button";

export type AlertDialogActionTone = "danger" | "accent";

interface AlertDialogState {
  open: boolean;
  setOpen: (open: boolean) => void;
  /** Mutable flag flipped by `AlertDialogTitle`; read by `AlertDialogContent`. */
  titlePresence: { current: boolean };
}

const AlertDialogStateContext = React.createContext<AlertDialogState | null>(null);

export interface AlertDialogProps {
  children?: React.ReactNode;
  /** Controlled visibility. Omit to let the alert dialog own its state. */
  open?: boolean;
  /** Initial visibility when uncontrolled. */
  defaultOpen?: boolean;
  /** Called whenever the open state would change (Escape, Cancel, Action). */
  onOpenChange?: (open: boolean) => void;
}

/**
 * Confirmation layer for destructive actions. Radix owns the behaviour — focus
 * trap, Escape, focus return and the rule that an outside click does nothing —
 * while Deyloom owns the surface and the shared overlay choreography.
 *
 * Unlike `Dialog` there is intentionally no close button and no `modal` knob:
 * an alert dialog always blocks until the user picks Cancel or Action.
 */
export function AlertDialog(props: AlertDialogProps) {
  const { children, open: openProp, defaultOpen = false, onOpenChange } = props;
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const open = openProp ?? uncontrolledOpen;

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (openProp === undefined) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [openProp, onOpenChange],
  );

  const titlePresence = React.useRef(false);
  const state = React.useMemo<AlertDialogState>(
    () => ({ open, setOpen, titlePresence }),
    [open, setOpen],
  );

  return (
    <AlertDialogStateContext.Provider value={state}>
      <AlertDialogPrimitive.Root open={open} onOpenChange={setOpen}>
        {children}
      </AlertDialogPrimitive.Root>
    </AlertDialogStateContext.Provider>
  );
}

export const AlertDialogTrigger = AlertDialogPrimitive.Trigger;
export type AlertDialogTriggerProps = React.ComponentProps<typeof AlertDialogTrigger>;

export interface AlertDialogTitleProps
  extends React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title> {
  ref?: React.Ref<HTMLHeadingElement>;
}

/** Accessible heading. Radix wires it to the panel via `aria-labelledby`. */
export function AlertDialogTitle(props: AlertDialogTitleProps) {
  const { className, ref, ...rest } = props;
  const presence = React.useContext(AlertDialogStateContext)?.titlePresence;

  React.useEffect(() => {
    if (!presence) return;
    presence.current = true;
    return () => {
      presence.current = false;
    };
  }, [presence]);

  return (
    <AlertDialogPrimitive.Title
      ref={ref}
      className={cn("dl-alert-dialog__title", className)}
      {...rest}
    />
  );
}

export interface AlertDialogDescriptionProps
  extends React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description> {
  ref?: React.Ref<HTMLParagraphElement>;
}

/** Secondary copy, wired to the panel via `aria-describedby`. */
export function AlertDialogDescription(props: AlertDialogDescriptionProps) {
  const { className, ref, ...rest } = props;
  return (
    <AlertDialogPrimitive.Description
      ref={ref}
      className={cn("dl-alert-dialog__description", className)}
      {...rest}
    />
  );
}

export interface AlertDialogContentProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>,
    "forceMount" | "children"
  > {
  className?: string;
  children?: React.ReactNode;
}

/**
 * Portals the panel. `forceMount` + `AnimatePresence` keep the DOM alive long
 * enough for the 140ms exit tween to play; the backdrop only fades and its blur
 * is a static material value, never an animated filter.
 */
export function AlertDialogContent(props: AlertDialogContentProps) {
  const { className, children, ...contentProps } = props;
  const state = React.useContext(AlertDialogStateContext);
  const portalContainer = useDeyloomPortalContainer();

  const open = state?.open ?? false;
  const titlePresence = state?.titlePresence;
  const labelledBy =
    contentProps["aria-label"] !== undefined
      ? contentProps["aria-label"]
      : contentProps["aria-labelledby"];

  React.useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    // Children only mount while open, so the check must wait for the first open.
    if (!open || labelledBy !== undefined) return;
    if (titlePresence?.current) return;
    warnOnce(
      "alert-dialog-title-missing",
      "`AlertDialogContent` has no `AlertDialogTitle`. Give the panel a name with a title (it can be visually hidden) or an `aria-label`.",
    );
  }, [open, labelledBy, titlePresence]);

  if (process.env.NODE_ENV !== "production" && !state) {
    warnOnce(
      "alert-dialog-content-parent",
      "`AlertDialogContent` must be rendered inside `<AlertDialog>`.",
    );
  }

  if (!state) return null;
  const { open: isOpen } = state;

  return (
    <AnimatePresence>
      {isOpen ? (
        <AlertDialogPrimitive.Portal forceMount container={portalContainer ?? undefined}>
          <AlertDialogPrimitive.Overlay asChild forceMount>
            <m.div
              className="dl-alert-dialog__backdrop"
              variants={backdrop}
              initial="initial"
              animate="animate"
              exit="exit"
            />
          </AlertDialogPrimitive.Overlay>
          <AlertDialogPrimitive.Content asChild forceMount {...contentProps}>
            <m.div
              className={cn("dl-alert-dialog__panel", "dl-focusable", "dl-scrollbar", className)}
              variants={overlayPanel}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {children}
            </m.div>
          </AlertDialogPrimitive.Content>
        </AlertDialogPrimitive.Portal>
      ) : null}
    </AnimatePresence>
  );
}

export interface AlertDialogActionProps
  extends Omit<React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>, "asChild"> {
  ref?: React.Ref<HTMLButtonElement>;
  /** Confirmation tone. Defaults to `"danger"`: the action usually destroys something. */
  tone?: AlertDialogActionTone;
  className?: string;
  children?: React.ReactNode;
}

/**
 * The confirmation button. Renders a solid `Button`; because the Radix Action
 * primitive is also a close, `onClick` runs first and the dialog then closes on
 * its own — callers never wire the close manually.
 */
export function AlertDialogAction(props: AlertDialogActionProps) {
  const { tone = "danger", className, children, ref, ...rest } = props;

  return (
    <AlertDialogPrimitive.Action asChild {...rest}>
      <Button
        ref={ref}
        variant="solid"
        tone={tone}
        className={cn("dl-alert-dialog__action", className)}
      >
        {children}
      </Button>
    </AlertDialogPrimitive.Action>
  );
}

export interface AlertDialogCancelProps
  extends Omit<React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>, "asChild"> {
  ref?: React.Ref<HTMLButtonElement>;
  className?: string;
  children?: React.ReactNode;
}

/** The safe exit. Renders an outline neutral `Button` and closes the dialog. */
export function AlertDialogCancel(props: AlertDialogCancelProps) {
  const { className, children, ref, ...rest } = props;

  return (
    <AlertDialogPrimitive.Cancel asChild {...rest}>
      <Button
        ref={ref}
        variant="outline"
        tone="neutral"
        className={cn("dl-alert-dialog__cancel", className)}
      >
        {children}
      </Button>
    </AlertDialogPrimitive.Cancel>
  );
}
