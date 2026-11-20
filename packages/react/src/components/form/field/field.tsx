import * as React from "react";
import { cn } from "../../../lib/cn";
import { WarningIcon } from "../../../lib/icons";

/**
 * The wiring every form control reads from `Field`. Controls resolve `id`,
 * `aria-describedby`, `aria-invalid`, `required` and `disabled` from here so a
 * consumer never has to repeat them by hand.
 */
export interface FieldContextValue {
  /** id of the control the label points at. */
  controlId: string;
  /** id of the rendered label, used as `aria-labelledby` by button-like controls. */
  labelId: string | undefined;
  /** Space separated ids of the hint and error rows currently in the DOM. */
  describedById: string | undefined;
  invalid: boolean;
  required: boolean;
  disabled: boolean;
}

const FieldContext = React.createContext<FieldContextValue | null>(null);

/** Read the enclosing `Field` wiring, or `null` when rendered standalone. */
export function useFieldContext(): FieldContextValue | null {
  return React.useContext(FieldContext);
}

export interface FieldProps {
  /** Visible label. Clicking it focuses the wired control. */
  label?: React.ReactNode;
  /** Persistent helper text under the control. */
  hint?: React.ReactNode;
  /** Validation message. Renders a single row with `role="alert"`. */
  error?: React.ReactNode;
  required?: boolean;
  /** Disables the wired control through `FieldContext`. */
  disabled?: boolean;
  children?: React.ReactNode;
  /** Explicit id for the control instead of the generated one. */
  htmlFor?: string;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  ref?: React.Ref<HTMLDivElement>;
}

/**
 * Composition shell for a label + control + hint/error stack. Owns the ids and
 * the error disclosure; children stay in charge of their own semantics.
 */
export function Field(props: FieldProps) {
  const {
    label,
    hint,
    error,
    required = false,
    disabled = false,
    children,
    htmlFor,
    className,
    style,
    id,
    ref,
  } = props;

  const autoId = React.useId();
  const fieldId = id ?? autoId;
  const controlId = htmlFor ?? `${fieldId}-control`;
  const labelId = label !== undefined ? `${fieldId}-label` : undefined;
  const hintId = hint !== undefined ? `${fieldId}-hint` : undefined;
  const errorId = error !== undefined ? `${fieldId}-error` : undefined;
  const invalid = error !== undefined;
  const describedById =
    [hintId, errorId].filter((value): value is string => value !== undefined).join(" ") ||
    undefined;

  const context = React.useMemo<FieldContextValue>(
    () => ({ controlId, labelId, describedById, invalid, required, disabled }),
    [controlId, labelId, describedById, invalid, required, disabled],
  );

  return (
    <div
      ref={ref}
      id={fieldId}
      className={cn("dl-field", className)}
      style={style}
      data-disabled={disabled ? "true" : undefined}
      data-invalid={invalid ? "true" : undefined}
      data-required={required ? "true" : undefined}
    >
      {label !== undefined ? (
        <label className="dl-field__label" id={labelId} htmlFor={controlId}>
          <span className="dl-field__label-text">{label}</span>
          {required ? (
            <span className="dl-field__required" aria-hidden="true">
              *
            </span>
          ) : null}
        </label>
      ) : null}

      <FieldContext.Provider value={context}>{children}</FieldContext.Provider>

      {hint !== undefined ? (
        <p className="dl-field__hint" id={hintId}>
          {hint}
        </p>
      ) : null}

      {/* dl-motion-allow: single-line disclosure */}
      <div className="dl-field__error-row" data-expanded={invalid ? "true" : "false"}>
        <div className="dl-field__error-clip">
          {error !== undefined ? (
            <p className="dl-field__error" id={errorId} role="alert">
              <WarningIcon className="dl-field__error-icon" />
              <span>{error}</span>
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
