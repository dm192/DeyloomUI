import * as React from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { AnimatePresence, m } from "motion/react";
import { cn } from "../../lib/cn";
import { warnOnce } from "../../lib/warn-once";
import { useDeyloomPortalContainer } from "../../hooks";
import { backdrop, overlayPanel } from "../../motion/variants";
import { XIcon } from "../../lib/icons";
import { IconButton } from "../icon-button";

export type DialogSize = "sm" | "md" | "lg";

interface DialogState {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DialogStateContext = React.createContext<DialogState | null>(null);

export interface DialogProps {
  children?: React.ReactNode;
  /** Controlled visibility. Omit to let the dialog own its state. */
  open?: boolean;
  /** Initial visibility when uncontrolled. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Radix modal mode. Defaults to `true`: focus trap + inert background. */
  modal?: boolean;
}

/**
 * Composable modal dialog. Radix owns the behaviour — focus trap, Escape,
 * background inert, focus return — while Deyloom owns the surface and the
 * enter/exit choreography (140ms tween out, no bounce).
 */
export function Dialog(props: DialogProps) {
  const { children, open: openProp, defaultOpen = false, onOpenChange, modal } = props;
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const open = openProp ?? uncontrolledOpen;

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (openProp === undefined) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [openProp, onOpenChange],
  );

  const state = React.useMemo<DialogState>(() => ({ open, setOpen }), [open, setOpen]);

  return (
    <DialogStateContext.Provider value={state}>
      <DialogPrimitive.Root open={open} onOpenChange={setOpen} modal={modal}>
        {children}
      </DialogPrimitive.Root>
    </DialogStateContext.Provider>
  );
}

export const DialogTrigger = DialogPrimitive.Trigger;
export type DialogTriggerProps = React.ComponentProps<typeof DialogTrigger>;

export const DialogClose = DialogPrimitive.Close;
export type DialogCloseProps = React.ComponentProps<typeof DialogClose>;

export interface DialogTitleProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title> {
  ref?: React.Ref<HTMLHeadingElement>;
  /**
   * Render the heading for assistive tech only. Use this when the visual design
   * has no title — a dialog must always expose an accessible name.
   */
  visuallyHidden?: boolean;
}

/** Accessible dialog heading. Radix wires it to the dialog via `aria-labelledby`. */
export function DialogTitle(props: DialogTitleProps) {
  const { className, visuallyHidden = false, ref, ...rest } = props;
  return (
    <DialogPrimitive.Title
      ref={ref}
      className={cn("dl-dialog__title", visuallyHidden && "dl-visually-hidden", className)}
      {...rest}
    />
  );
}

export interface DialogDescriptionProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description> {
  ref?: React.Ref<HTMLParagraphElement>;
}

/** Secondary copy, wired to the dialog via `aria-describedby`. */
export function DialogDescription(props: DialogDescriptionProps) {
  const { className, ref, ...rest } = props;
  return (
    <DialogPrimitive.Description
      ref={ref}
      className={cn("dl-dialog__description", className)}
      {...rest}
    />
  );
}

export interface DialogCloseButtonProps {
  /** Accessible name. Defaults to the English label `Close`. */
  label?: string;
  className?: string;
}

/** The standard × button that closes the surrounding dialog. */
export function DialogCloseButton(props: DialogCloseButtonProps) {
  const { label = "Close", className } = props;
  return (
    <DialogPrimitive.Close asChild>
      <IconButton
        label={label}
        size="sm"
        variant="ghost"
        tone="neutral"
        className={cn("dl-dialog__close", className)}
      >
        <XIcon />
      </IconButton>
    </DialogPrimitive.Close>
  );
}

export interface DialogContentProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    "forceMount" | "children"
  > {
  /** Panel width. */
  size?: DialogSize;
  /** Renders the standard top-right close button. Defaults to `true`. */
  showCloseButton?: boolean;
  /** Accessible name for that close button. */
  closeLabel?: string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Portals the dialog. The panel is mounted through `AnimatePresence` so the
 * 140ms exit tween actually plays before Radix unmounts it; `forceMount` keeps
 * Radix from tearing the DOM down first.
 */
export function DialogContent(props: DialogContentProps) {
  const {
    size = "md",
    showCloseButton = true,
    closeLabel = "Close",
    className,
    children,
    ...contentProps
  } = props;
  const state = React.useContext(DialogStateContext);
  const portalContainer = useDeyloomPortalContainer();

  if (process.env.NODE_ENV !== "production" && !state) {
    warnOnce("dialog-content-parent", "`DialogContent` must be rendered inside `<Dialog>`.");
  }

  if (!state) return null;
  const { open } = state;

  return (
    <AnimatePresence>
      {open ? (
        <DialogPrimitive.Portal forceMount container={portalContainer ?? undefined}>
          <DialogPrimitive.Overlay asChild forceMount>
            <m.div
              className="dl-dialog__backdrop"
              variants={backdrop}
              initial="initial"
              animate="animate"
              exit="exit"
            />
          </DialogPrimitive.Overlay>
          <DialogPrimitive.Content asChild forceMount {...contentProps}>
            <m.div
              className={cn("dl-dialog__panel", "dl-focusable", "dl-scrollbar", className)}
              data-size={size}
              variants={overlayPanel}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {children}
              {showCloseButton ? <DialogCloseButton label={closeLabel} /> : null}
            </m.div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      ) : null}
    </AnimatePresence>
  );
}
