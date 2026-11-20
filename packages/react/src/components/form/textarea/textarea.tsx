import * as React from "react";
import { cn } from "../../../lib/cn";
import { useFieldContext } from "../field";

export type TextareaSize = "sm" | "md" | "lg";

export interface TextareaProps extends React.ComponentProps<"textarea"> {
  ref?: React.Ref<HTMLTextAreaElement>;
  size?: TextareaSize;
  invalid?: boolean;
  /** Grow with the content between `minRows` and `maxRows` instead of scrolling. */
  autoResize?: boolean;
  /** Visible rows used as the minimum height when `autoResize` is on. Defaults to 3. */
  minRows?: number;
  /** Row count after which the textarea starts scrolling. */
  maxRows?: number;
}

function mergeRef<T>(ref: React.Ref<T> | undefined, node: T | null): void {
  if (typeof ref === "function") ref(node);
  else if (ref) (ref as React.MutableRefObject<T | null>).current = node;
}

/**
 * Multi-line text control. `autoResize` measures `scrollHeight` and writes the
 * height synchronously: no transition, so the caret never drifts.
 */
export function Textarea(props: TextareaProps) {
  const {
    ref,
    size = "md",
    invalid,
    autoResize = false,
    minRows = 3,
    maxRows,
    className,
    style,
    disabled,
    required,
    id,
    value,
    onChange,
    rows,
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
    "aria-labelledby": ariaLabelledBy,
    ...rest
  } = props;

  const field = useFieldContext();
  const controlId = id ?? field?.controlId;
  const isInvalid = invalid ?? field?.invalid ?? false;
  const isRequired = required ?? field?.required ?? false;
  const isDisabled = disabled ?? field?.disabled ?? false;
  const describedBy =
    [ariaDescribedBy, field?.describedById]
      .filter((entry): entry is string => Boolean(entry))
      .join(" ") || undefined;
  const labelledBy =
    [ariaLabelledBy, field?.labelId]
      .filter((entry): entry is string => Boolean(entry))
      .join(" ") || undefined;

  const innerRef = React.useRef<HTMLTextAreaElement | null>(null);

  const resize = React.useCallback(
    (element: HTMLTextAreaElement | null) => {
      if (!autoResize || !element) return;
      const computed = window.getComputedStyle(element);
      const lineHeight = Number.parseFloat(computed.lineHeight) || 20;
      const padding =
        (Number.parseFloat(computed.paddingTop) || 0) +
        (Number.parseFloat(computed.paddingBottom) || 0);
      const border =
        (Number.parseFloat(computed.borderTopWidth) || 0) +
        (Number.parseFloat(computed.borderBottomWidth) || 0);
      const min = minRows * lineHeight + padding + border;
      const max =
        maxRows === undefined
          ? Number.POSITIVE_INFINITY
          : maxRows * lineHeight + padding + border;
      // jsdom reports scrollHeight 0; keeping the measured height at 0 would
      // collapse the control, so clamp to the row-derived minimum.
      const content = element.scrollHeight + border;
      const next = Math.min(Math.max(content, min), max);
      if (Number.isFinite(next) && next > 0) element.style.height = `${next}px`;
    },
    [autoResize, minRows, maxRows],
  );

  React.useLayoutEffect(() => {
    resize(innerRef.current);
  }, [resize, value]);

  return (
    <textarea
      ref={(node) => {
        innerRef.current = node;
        mergeRef(ref, node);
      }}
      id={controlId}
      className={cn("dl-textarea", className)}
      style={style}
      rows={autoResize ? undefined : (rows ?? minRows)}
      value={value}
      disabled={isDisabled}
      required={isRequired}
      aria-invalid={isInvalid || ariaInvalid || undefined}
      aria-describedby={describedBy}
      aria-labelledby={labelledBy || undefined}
      data-size={size}
      data-invalid={isInvalid ? "true" : undefined}
      data-disabled={isDisabled ? "true" : undefined}
      data-autoresize={autoResize ? "true" : undefined}
      onChange={(event) => {
        resize(event.currentTarget);
        onChange?.(event);
      }}
      {...rest}
    />
  );
}
