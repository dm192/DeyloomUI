import * as React from "react";
import { m } from "motion/react";
import { cn } from "../../../lib/cn";
import { scales, springs } from "../../../motion/presets";
import { useDeyloomReducedMotion } from "../../../hooks";

export type SegmentedControlSize = "sm" | "md";

export interface SegmentedControlItem {
  value: string;
  label: React.ReactNode;
  /** Optional decorative glyph rendered before the label. */
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface SegmentedControlProps {
  items: SegmentedControlItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  size?: SegmentedControlSize;
  disabled?: boolean;
  /** Accessible name for the group; provide this or `aria-labelledby`. */
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLDivElement>;
}

interface IndicatorRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Segmented single-choice control. Uses `role="radiogroup"` semantics (this is
 * one choice among options, not a tab panel): every segment is a `radio` with
 * arrow-key navigation and a roving tab stop.
 *
 * The sliding indicator is measured from the DOM; when measurement is
 * unavailable (jsdom, hidden container) it degrades to no indicator at all.
 */
export function SegmentedControl(props: SegmentedControlProps) {
  const {
    items,
    value,
    defaultValue,
    onValueChange,
    size = "md",
    disabled = false,
    className,
    style,
    id,
    ref,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-describedby": ariaDescribedBy,
  } = props;

  const reducedMotion = useDeyloomReducedMotion();
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const itemRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const [innerValue, setInnerValue] = React.useState<string | undefined>(defaultValue);
  const [indicator, setIndicator] = React.useState<IndicatorRect | null>(null);

  const selectedValue = value ?? innerValue;
  const isDisabled = disabled;

  const enabledItems = React.useMemo(
    () => items.filter((item) => !item.disabled),
    [items],
  );
  const selectedIndex = items.findIndex((item) => item.value === selectedValue);
  const focusIndex =
    selectedIndex >= 0 && !items[selectedIndex]?.disabled
      ? selectedIndex
      : items.findIndex((item) => !item.disabled);

  const commit = React.useCallback(
    (next: string) => {
      if (value === undefined) setInnerValue(next);
      onValueChange?.(next);
    },
    [value, onValueChange],
  );

  const measure = React.useCallback(() => {
    const root = rootRef.current;
    if (!root) return;
    const selected = root.querySelector<HTMLElement>('[data-selected="true"]');
    if (!selected) {
      setIndicator(null);
      return;
    }
    const rootRect = root.getBoundingClientRect();
    const itemRect = selected.getBoundingClientRect();
    if (itemRect.width <= 0 || itemRect.height <= 0) {
      // jsdom and hidden containers report a zero box: no indicator beats a
      // wrongly positioned one.
      setIndicator(null);
      return;
    }
    const styles = window.getComputedStyle(root);
    const borderLeft = Number.parseFloat(styles.borderLeftWidth) || 0;
    const borderTop = Number.parseFloat(styles.borderTopWidth) || 0;
    setIndicator({
      x: itemRect.left - rootRect.left - borderLeft,
      y: itemRect.top - rootRect.top - borderTop,
      width: itemRect.width,
      height: itemRect.height,
    });
  }, []);

  React.useLayoutEffect(() => {
    measure();
  }, [measure, selectedValue, items, size, isDisabled]);

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new ResizeObserver(() => measure());
    observer.observe(root);
    root
      .querySelectorAll<HTMLElement>("[data-dl-segment]")
      .forEach((node) => observer.observe(node));
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure, items, size]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (isDisabled || enabledItems.length === 0) return;
    const currentEnabled = enabledItems.findIndex((item) => item.value === selectedValue);

    let nextIndex: number | undefined;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        nextIndex = currentEnabled < 0 ? 0 : (currentEnabled + 1) % enabledItems.length;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        nextIndex =
          currentEnabled <= 0 ? enabledItems.length - 1 : currentEnabled - 1;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = enabledItems.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    const next = enabledItems[nextIndex];
    if (!next) return;
    commit(next.value);
    const index = items.findIndex((item) => item.value === next.value);
    itemRefs.current[index]?.focus();
  };

  return (
    <div
      ref={(node) => {
        rootRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }}
      id={id}
      className={cn("dl-segmented-control", className)}
      style={style}
      role="radiogroup"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
      aria-orientation="horizontal"
      aria-disabled={isDisabled || undefined}
      data-size={size}
      data-disabled={isDisabled ? "true" : undefined}
      onKeyDown={handleKeyDown}
    >
      {indicator ? (
        <m.span
          className="dl-segmented-control__indicator"
          aria-hidden="true"
          initial={false}
          animate={{
            x: indicator.x,
            y: indicator.y,
            width: indicator.width,
            height: indicator.height,
          }}
          transition={reducedMotion ? { duration: 0 } : springs.snappy}
        />
      ) : null}

      {items.map((item, index) => {
        const isSelected = item.value === selectedValue;
        const itemDisabled = isDisabled || item.disabled === true;
        return (
          <m.button
            key={item.value}
            ref={(node) => {
              itemRefs.current[index] = node;
            }}
            type="button"
            role="radio"
            aria-checked={isSelected}
            data-dl-segment=""
            data-selected={isSelected ? "true" : undefined}
            data-size={size}
            disabled={itemDisabled}
            tabIndex={index === focusIndex ? 0 : -1}
            whileTap={
              itemDisabled || reducedMotion ? undefined : { scale: scales.press }
            }
            transition={springs.press}
            className={cn(
              "dl-segmented-control__segment",
              "dl-focusable",
              isSelected && "dl-segmented-control__segment--selected",
            )}
            onClick={() => {
              if (itemDisabled) return;
              commit(item.value);
            }}
          >
            {item.icon !== undefined ? (
              <span className="dl-segmented-control__icon" aria-hidden="true">
                {item.icon}
              </span>
            ) : null}
            <span className="dl-segmented-control__label">{item.label}</span>
          </m.button>
        );
      })}
    </div>
  );
}
