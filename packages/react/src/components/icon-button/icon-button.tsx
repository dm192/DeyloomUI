import * as React from "react";
import {
  Button,
  type ButtonProps,
  type ButtonSize,
  type ButtonTone,
  type ButtonVariant,
} from "../button";
import { cn } from "../../lib/cn";

export interface IconButtonProps extends Omit<ButtonProps, "children" | "startIcon" | "endIcon"> {
  /** Accessible name. Required — an icon on its own is not a name. */
  label: string;
  children: React.ReactNode;
  size?: ButtonSize;
  variant?: ButtonVariant;
  tone?: ButtonTone;
}

/** Square, icon-only variant of `Button` with the same press and focus contract. */
export function IconButton(props: IconButtonProps) {
  const {
    label,
    children,
    className,
    variant = "ghost",
    tone = "neutral",
    ...rest
  } = props;

  return (
    <Button
      aria-label={label}
      className={cn("dl-icon-btn", className)}
      variant={variant}
      tone={tone}
      {...rest}
    >
      <span className="dl-icon-btn__glyph" aria-hidden="true">
        {children}
      </span>
    </Button>
  );
}
