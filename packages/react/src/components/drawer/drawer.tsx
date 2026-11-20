import * as React from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { AnimatePresence, m } from "motion/react";
import type { Variants } from "motion/react";
import { cn } from "../../lib/cn";
import { warnOnce } from "../../lib/warn-once";
import { useDeyloomPortalContainer } from "../../hooks";
import { backdrop } from "../../motion/variants";
import { springs, tweens } from "../../motion/presets";

export type DrawerSide = "right" | "left" | "bottom";

/**
 * Edge offset is expressed as a percentage of the panel itself, so the same
 * variants work for every width without measuring anything.
 */
const panelVariants: Record<DrawerSide, Variants> = {
  right: {
    initial: { x: "100%", opacity: 0.7 },
    animate: { x: "0%", opacity: 1, transition: springs.soft },
    exit: { x: "100%", opacity: 0.5, transition: tweens.exit },
  },
  left: {
    initial: { x: "-100%", opacity: 0.7 },
    animate: { x: "0%", opacity: 1, transition: springs.soft },
    exit: { x: "-100%", opacity: 0.5, transition: tweens.exit },
  },
  bottom: {
    initial: { y: "100%", opacity: 0.7 },
    animate: { y: "0%", opacity: 1, transition: springs.soft },
    exit: { y: "100%", opacity: 0.5, transition: tweens.exit },
  },
};

interface DrawerState {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DrawerStateContext = React.createContext<DrawerState | null>(null);

export interface DrawerProps {
  children?: React.ReactNode;
  /** Controlled visibility. Omit to let the drawer own its state. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;
}

/**
 * Edge sheet built on the Radix Dialog primitive, so focus trap, Escape and
 * focus return come from the same battle-tested code path as `Dialog`. The
 * panel springs in from its edge (`springs.soft`) and leaves on a 140ms tween.
 */
export function Drawer(props: DrawerProps) {
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

  const state = React.useMemo<DrawerState>(() => ({ open, setOpen }), [open, setOpen]);

  return (
    <DrawerStateContext.Provider value={state}>
      <DialogPrimitive.Root open={open} onOpenChange={setOpen} modal={modal}>
        {children}
      </DialogPrimitive.Root>
    </DrawerStateContext.Provider>
  );
}

export const DrawerTrigger = DialogPrimitive.Trigger;
export type DrawerTriggerProps = React.ComponentProps<typeof DrawerTrigger>;

export const DrawerClose = DialogPrimitive.Close;
export type DrawerCloseProps = React.ComponentProps<typeof DrawerClose>;

export interface DrawerTitleProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title> {
  ref?: React.Ref<HTMLHeadingElement>;
  /** Render the heading for assistive tech only. */
  visuallyHidden?: boolean;
}

/** Accessible drawer heading, wired to the panel via `aria-labelledby`. */
export function DrawerTitle(props: DrawerTitleProps) {
  const { className, visuallyHidden = false, ref, ...rest } = props;
  return (
    <DialogPrimitive.Title
      ref={ref}
      className={cn("dl-drawer__title", visuallyHidden && "dl-visually-hidden", className)}
      {...rest}
    />
  );
}

export interface DrawerDescriptionProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description> {
  ref?: React.Ref<HTMLParagraphElement>;
}

/** Secondary copy, wired to the panel via `aria-describedby`. */
export function DrawerDescription(props: DrawerDescriptionProps) {
  const { className, ref, ...rest } = props;
  return (
    <DialogPrimitive.Description
      ref={ref}
      className={cn("dl-drawer__description", className)}
      {...rest}
    />
  );
}

export interface DrawerContentProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    "forceMount" | "children"
  > {
  /** Edge the panel is anchored to. Defaults to `"right"`. */
  side?: DrawerSide;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Portals the drawer and animates the panel. `forceMount` + `AnimatePresence`
 * keep the DOM alive long enough for the exit tween to run.
 *
 * Note: there is no drag-to-dismiss. That gesture needs Motion's `domMax`
 * feature bundle (layout + drag); the core package stays on `domAnimation`.
 */
export function DrawerContent(props: DrawerContentProps) {
  const { side = "right", className, children, ...contentProps } = props;
  const state = React.useContext(DrawerStateContext);
  const portalContainer = useDeyloomPortalContainer();

  if (process.env.NODE_ENV !== "production" && !state) {
    warnOnce("drawer-content-parent", "`DrawerContent` must be rendered inside `<Drawer>`.");
  }

  if (!state) return null;
  const { open } = state;

  return (
    <AnimatePresence>
      {open ? (
        <DialogPrimitive.Portal forceMount container={portalContainer ?? undefined}>
          <DialogPrimitive.Overlay asChild forceMount>
            <m.div
              className="dl-drawer__backdrop"
              variants={backdrop}
              initial="initial"
              animate="animate"
              exit="exit"
            />
          </DialogPrimitive.Overlay>
          <DialogPrimitive.Content asChild forceMount {...contentProps}>
            <m.div
              className={cn("dl-drawer__panel", "dl-focusable", className)}
              data-side={side}
              variants={panelVariants[side]}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {children}
            </m.div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      ) : null}
    </AnimatePresence>
  );
}
