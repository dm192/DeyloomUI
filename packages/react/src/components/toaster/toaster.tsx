import * as React from "react";
import { Toast as ToastPrimitive } from "radix-ui";
import { AnimatePresence, m } from "motion/react";
import { cn } from "../../lib/cn";
import { toastStackItem } from "../../motion/variants";
import { useStackReorder } from "../../lib/use-layout-motion";
import { CheckCircleIcon, InfoIcon, WarningIcon, XIcon } from "../../lib/icons";

export type ToastVariant = "default" | "success" | "danger";

export type ToasterPosition =
  | "top-right"
  | "top-left"
  | "top-center"
  | "bottom-right"
  | "bottom-left"
  | "bottom-center";

export interface ToastActionOptions {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Defaults to `"default"`. */
  variant?: ToastVariant;
  /** Overrides the `Toaster` duration for this toast. */
  duration?: number;
  action?: ToastActionOptions;
}

export interface ToasterProps {
  /** Corner the stack is anchored to. Defaults to `"bottom-right"`. */
  position?: ToasterPosition;
  /** Milliseconds each toast stays visible. Defaults to `"4500"`. */
  duration?: number;
  /** Maximum number of visible toasts, oldest are evicted. Defaults to `5`. */
  max?: number;
  /** Renders a close button on every toast. Defaults to `false`. */
  closeButton?: boolean;
  /** Accessible name for the close button. Defaults to `"Close"`. */
  closeLabel?: string;
  /** Accessible name of the live region. Defaults to `"Notifications"`. */
  label?: string;
  className?: string;
}

interface ToastRecord {
  id: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  variant: ToastVariant;
  duration?: number;
  action?: ToastActionOptions;
}

/* -------------------------------------------------------------------------- */
/* Store: ~40 lines, no dependency. `useSyncExternalStore` is the React 19    */
/* blessed way to expose it.                                                  */
/* -------------------------------------------------------------------------- */

let records: readonly ToastRecord[] = [];
let limit = 5;
let nextId = 0;
const listeners = new Set<() => void>();

function commit(next: readonly ToastRecord[]): void {
  records = next;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): readonly ToastRecord[] {
  return records;
}

/** Imperatively queue a toast. Returns the toast id. */
function createToast(options: ToastOptions): string {
  const id = `dl-toast-${++nextId}`;
  const record: ToastRecord = { ...options, id, variant: options.variant ?? "default" };
  const next = [...records, record];
  commit(next.length > limit ? next.slice(next.length - limit) : next);
  return id;
}

/** Remove a toast (or every toast when `id` is omitted). The exit animation
 * still plays before the node is dropped. */
function dismissToast(id?: string): void {
  if (id === undefined) {
    if (records.length === 0) return;
    commit([]);
    return;
  }
  if (!records.some((record) => record.id === id)) return;
  commit(records.filter((record) => record.id !== id));
}

export interface ToastFunction {
  (options: ToastOptions): string;
  dismiss: (id?: string) => void;
}

/** Imperative toast API: `const id = toast({ title }); toast.dismiss(id)`. */
export const toast: ToastFunction = Object.assign(createToast, { dismiss: dismissToast });

function setToastLimit(nextLimit: number): void {
  limit = Math.max(1, Math.floor(nextLimit));
  if (records.length > limit) commit(records.slice(records.length - limit));
}

/* -------------------------------------------------------------------------- */
/* Rendering                                                                  */
/* -------------------------------------------------------------------------- */

const variantIcon = {
  default: InfoIcon,
  success: CheckCircleIcon,
  danger: WarningIcon,
} as const;

interface ToastItemProps {
  record: ToastRecord;
  duration: number;
  closeButton: boolean;
  closeLabel: string;
  placement: "top" | "bottom";
}

function ToastItem(props: ToastItemProps) {
  const { record, duration, closeButton, closeLabel, placement } = props;
  const [paused, setPaused] = React.useState(false);
  const Icon = variantIcon[record.variant];
  const hasCountdown = Number.isFinite(duration) && duration > 0;

  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      if (!open) dismissToast(record.id);
    },
    [record.id],
  );

  const progressStyle = {
    "--dl-toast-duration": `${duration}ms`,
  } as React.CSSProperties;

  return (
    <ToastPrimitive.Root
      forceMount
      duration={duration}
      className="dl-toast__item dl-focusable"
      onOpenChange={handleOpenChange}
      onPause={() => setPaused(true)}
      onResume={() => setPaused(false)}
    >
      <m.div
        className="dl-toast"
        data-variant={record.variant}
        data-paused={paused ? "true" : undefined}
        variants={toastStackItem(placement)}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <span className="dl-toast__icon" aria-hidden="true">
          <Icon />
        </span>
        <div className="dl-toast__content">
          <ToastPrimitive.Title className="dl-toast__title">
            {record.title}
          </ToastPrimitive.Title>
          {record.description ? (
            <ToastPrimitive.Description className="dl-toast__description">
              {record.description}
            </ToastPrimitive.Description>
          ) : null}
          {record.action ? (
            <ToastPrimitive.Action
              altText={record.action.label}
              className="dl-toast__action dl-focusable"
              onClick={record.action.onClick}
            >
              {record.action.label}
            </ToastPrimitive.Action>
          ) : null}
        </div>
        {closeButton ? (
          <ToastPrimitive.Close className="dl-toast__close dl-focusable" aria-label={closeLabel}>
            <XIcon />
          </ToastPrimitive.Close>
        ) : null}
        {/* Time left. Radix pauses its close timer on hover/focus/blur and tells
            us through onPause/onResume, so the bar pauses in lockstep. A toast
            without a finite duration simply has no countdown bar. */}
        {hasCountdown ? (
          <span className="dl-toast__progress" style={progressStyle} aria-hidden="true" />
        ) : null}
      </m.div>
    </ToastPrimitive.Root>
  );
}

/**
 * Mount once near the app root. Owns the toast viewport, the live-region
 * behaviour Radix provides, and the position of the stack.
 *
 * The stack reflow is a FLIP pass driven by a MutationObserver: when a toast is
 * added or removed, the remaining cards animate from their previous offset with
 * a transform-only transition, so the stack never jumps. This works with the
 * lightweight `domAnimation` bundle — no layout feature required.
 */
export function Toaster(props: ToasterProps) {
  const {
    position = "bottom-right",
    duration = 4500,
    max = 5,
    closeButton = false,
    closeLabel = "Close",
    label = "Notifications",
    className,
  } = props;
  const items = React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const viewportRef = React.useRef<HTMLOListElement | null>(null);
  const placement: "top" | "bottom" = position.startsWith("top") ? "top" : "bottom";

  React.useEffect(() => {
    setToastLimit(max);
  }, [max]);

  useStackReorder(viewportRef, { itemSelector: ".dl-toast__item" });

  return (
    <ToastPrimitive.Provider duration={duration} label={label}>
      <AnimatePresence initial={false}>
        {items.map((record) => (
          <ToastItem
            key={record.id}
            record={record}
            duration={record.duration ?? duration}
            closeButton={closeButton}
            closeLabel={closeLabel}
            placement={placement}
          />
        ))}
      </AnimatePresence>
      <ToastPrimitive.Viewport
        ref={viewportRef}
        className={cn("dl-toaster", "dl-scrollbar", `dl-toaster--${position}`, className)}
      />
    </ToastPrimitive.Provider>
  );
}
