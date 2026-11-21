import * as React from "react";
import { Progress as ProgressPrimitive } from "radix-ui";
import { m } from "motion/react";
import { cn } from "../../lib/cn";
import { useDeyloomReducedMotion } from "../../hooks";
import { springs } from "../../motion/presets";

export type ProgressSize = "sm" | "md" | "lg";
export type ProgressTone = "accent" | "success" | "danger" | "neutral";

export interface ProgressProps
  extends Omit<React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>, "value"> {
  ref?: React.Ref<HTMLDivElement>;
  /** 0–100. Omit (or pass `undefined`) for the indeterminate loop. */
  value?: number;
  size?: ProgressSize;
  /** Semantic colour of the fill. */
  tone?: ProgressTone;
  /** Visible label rendered above the track. */
  label?: React.ReactNode;
  /** Renders the rounded percentage opposite the label. */
  showValue?: boolean;
  className?: string;
}

/**
 * Linear progress. The determinate fill is a `scaleX` transform driven by
 * `springs.snappy`, so value changes glide without touching layout. The
 * indeterminate state is a compositor-only CSS loop with a static reduced-motion
 * fallback (the `dl-anim-loop` class switches the animation off, leaving a
 * fixed 40% block as the busy indicator).
 */
export function Progress(props: ProgressProps) {
  const {
    value,
    size = "md",
    tone = "accent",
    label,
    showValue = false,
    className,
    max = 100,
    ref,
    ...rootProps
  } = props;

  const reducedMotion = useDeyloomReducedMotion();
  const labelId = React.useId();
  const safeMax = max > 0 ? max : 100;
  const clamped =
    value !== undefined && !Number.isNaN(value)
      ? Math.min(safeMax, Math.max(0, value))
      : null;
  const isIndeterminate = clamped === null;
  const percent = clamped === null ? 0 : (clamped / safeMax) * 100;
  // A visible label is useless unless it names the progressbar for assistive
  // tech; wire it through `aria-labelledby` unless the caller overrides.
  const labelledBy =
    rootProps["aria-labelledby"] ?? (label !== undefined ? labelId : undefined);

  return (
    <div className={cn("dl-progress", className)} data-size={size} data-tone={tone}>
      {label !== undefined || showValue ? (
        <div className="dl-progress__meta">
          {label !== undefined ? (
            <span id={labelId} className="dl-progress__label">
              {label}
            </span>
          ) : null}
          {showValue && !isIndeterminate ? (
            <span className="dl-progress__value" aria-hidden="true">
              {Math.round(percent)}%
            </span>
          ) : null}
        </div>
      ) : null}
      <ProgressPrimitive.Root
        ref={ref}
        className="dl-progress__track"
        value={clamped}
        max={safeMax}
        {...rootProps}
        aria-labelledby={labelledBy}
      >
        {isIndeterminate ? (
          <span className="dl-progress__indeterminate dl-anim-loop" aria-hidden="true" />
        ) : (
          <m.div
            className="dl-progress__fill"
            initial={false}
            animate={{ scaleX: percent / 100 }}
            transition={reducedMotion ? { duration: 0 } : springs.snappy}
          />
        )}
      </ProgressPrimitive.Root>
    </div>
  );
}
