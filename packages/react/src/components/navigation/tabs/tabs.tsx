import * as React from "react";
import { Tabs as TabsPrimitive } from "radix-ui";
import { m } from "motion/react";
import { cn } from "../../../lib/cn";
import { distances, scales, springs } from "../../../motion/presets";
import { useDeyloomReducedMotion } from "../../../hooks";
import { useHeightTransition } from "../../../lib/use-layout-motion";

type TabsOrientation = "horizontal" | "vertical";

interface TabsUiContextValue {
  value: string | undefined;
  orientation: TabsOrientation;
}

const TabsUiContext = React.createContext<TabsUiContextValue | null>(null);

interface TabIndicatorRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (!ref) return;
  if (typeof ref === "function") {
    ref(value);
    return;
  }
  (ref as { current: T | null }).current = value;
}

/**
 * Measures the active trigger so the indicator can slide between tabs.
 * jsdom (and any layout-less environment) reports zero sizes — the hook then
 * reports `null`, which renders no indicator instead of crashing.
 */
function useTabIndicator(listRef: React.RefObject<HTMLDivElement | null>) {
  const [rect, setRect] = React.useState<TabIndicatorRect | null>(null);

  React.useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;

    let resizeObserver: ResizeObserver | null = null;
    let observedTrigger: HTMLElement | null = null;

    const measure = () => {
      const active = list.querySelector<HTMLElement>('[role="tab"][data-state="active"]');
      if (!active) {
        setRect(null);
        return;
      }
      const width = active.offsetWidth;
      const height = active.offsetHeight;
      if (width === 0 && height === 0) {
        setRect(null);
        return;
      }
      setRect({ x: active.offsetLeft, y: active.offsetTop, width, height });
      if (resizeObserver && observedTrigger !== active) {
        if (observedTrigger) resizeObserver.unobserve(observedTrigger);
        resizeObserver.observe(active);
        observedTrigger = active;
      }
    };

    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(measure);
      resizeObserver.observe(list);
    }
    measure();

    const mutationObserver =
      typeof MutationObserver !== "undefined"
        ? new MutationObserver(measure)
        : null;
    mutationObserver?.observe(list, {
      attributes: true,
      attributeFilter: ["data-state"],
      subtree: true,
    });

    if (typeof window !== "undefined") window.addEventListener("resize", measure);

    return () => {
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
      if (typeof window !== "undefined") window.removeEventListener("resize", measure);
    };
  }, [listRef]);

  return rect;
}

export type TabsProps = React.ComponentProps<typeof TabsPrimitive.Root>;

/**
 * Tabs root. Owns the selection value, the measured indicator state, and the
 * height transition between panels.
 *
 * Panels never overlap in layout: only the active panel is in the flow, and the
 * root animates from the previous panel height to the new one. That is the one
 * container-level layout animation in the library (annotated at the call site)
 * and it is skipped entirely under reduced motion or without WAAPI.
 */
export function Tabs(props: TabsProps) {
  const {
    value: valueProp,
    defaultValue,
    onValueChange,
    orientation = "horizontal",
    className,
    children,
    ref,
    ...rest
  } = props;

  const [uncontrolledValue, setUncontrolledValue] = React.useState<string | undefined>(
    defaultValue,
  );
  const isControlled = valueProp !== undefined;
  const value = isControlled ? valueProp : uncontrolledValue;

  const handleValueChange = React.useCallback(
    (next: string) => {
      if (!isControlled) setUncontrolledValue(next);
      onValueChange?.(next);
    },
    [isControlled, onValueChange],
  );

  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const setRootRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node;
      assignRef(ref, node);
    },
    [ref],
  );

  useHeightTransition(rootRef, [value, orientation]);

  const contextValue = React.useMemo<TabsUiContextValue>(
    () => ({ value, orientation }),
    [value, orientation],
  );

  return (
    <TabsPrimitive.Root
      {...rest}
      ref={setRootRef}
      value={value}
      orientation={orientation}
      onValueChange={handleValueChange}
      className={cn("dl-tabs", className)}
    >
      <TabsUiContext.Provider value={contextValue}>{children}</TabsUiContext.Provider>
    </TabsPrimitive.Root>
  );
}

export interface TabsListProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> {
  ref?: React.Ref<HTMLDivElement>;
}

/**
 * The track. A measured indicator block slides between triggers with the
 * "snappy" spring; the triggers only ever animate colour.
 */
export function TabsList(props: TabsListProps) {
  const { className, children, ref, ...rest } = props;
  const ui = React.useContext(TabsUiContext);
  const orientation: TabsOrientation = ui?.orientation ?? "horizontal";
  const reducedMotion = useDeyloomReducedMotion();
  const listRef = React.useRef<HTMLDivElement | null>(null);
  const rect = useTabIndicator(listRef);

  const setListRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      listRef.current = node;
      assignRef(ref, node);
    },
    [ref],
  );

  return (
    <TabsPrimitive.List
      ref={setListRef}
      className={cn("dl-tabs__list", className)}
      {...rest}
    >
      {rect ? (
        // dl-motion-allow: measured tab indicator (width is the only layout
        // property this library animates, and only for this element).
        <m.span
          aria-hidden="true"
          className="dl-tabs__indicator"
          initial={false}
          animate={
            orientation === "vertical"
              ? { x: rect.x, y: rect.y }
              : { x: rect.x, y: rect.y, width: rect.width }
          }
          transition={reducedMotion ? { duration: 0 } : springs.snappy}
          style={
            orientation === "vertical"
              ? { width: rect.width, height: rect.height }
              : { height: rect.height }
          }
        />
      ) : null}
      {children}
    </TabsPrimitive.List>
  );
}

export type TabsTriggerProps = Omit<
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>,
  "asChild"
> & {
  ref?: React.Ref<HTMLButtonElement>;
};

/** One tab. Radix supplies roving focus, arrow keys and the ARIA wiring. */
export function TabsTrigger(props: TabsTriggerProps) {
  const { className, children, ref, ...rest } = props;
  const reducedMotion = useDeyloomReducedMotion();

  return (
    <TabsPrimitive.Trigger asChild {...rest}>
      <m.button
        ref={ref}
        type="button"
        className={cn("dl-tabs__trigger", "dl-focusable", className)}
        whileTap={reducedMotion ? undefined : { scale: scales.press }}
        transition={springs.press}
      >
        {children}
      </m.button>
    </TabsPrimitive.Trigger>
  );
}

export type TabsContentProps = Omit<
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>,
  "asChild" | "forceMount"
> & {
  ref?: React.Ref<HTMLDivElement>;
};

/**
 * A panel. Only the active one is mounted, so two panels can never occupy the
 * flow at once (that used to double the container height for one exit tick).
 * The incoming panel fades in; the container height is animated by `Tabs`.
 */
export function TabsContent(props: TabsContentProps) {
  const { value, className, children, ref, ...rest } = props;
  const ui = React.useContext(TabsUiContext);
  const isActive = ui?.value === value;

  if (!isActive) return null;

  return (
    <TabsPrimitive.Content value={value} forceMount asChild {...rest}>
      <m.div
        ref={ref}
        className={cn("dl-tabs__content", "dl-focusable", className)}
        initial={{ opacity: 0, y: distances.xs }}
        animate={{ opacity: 1, y: 0, transition: springs.soft }}
      >
        {children}
      </m.div>
    </TabsPrimitive.Content>
  );
}
