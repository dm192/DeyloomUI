import * as React from "react";
import { Avatar as AvatarPrimitive } from "radix-ui";
import { cn } from "../../../lib/cn";

export type AvatarSize = "xs" | "sm" | "md" | "lg";

export interface AvatarProps extends React.ComponentProps<typeof AvatarPrimitive.Root> {
  /** Square-ish diameter, driven by the control height tokens. */
  size?: AvatarSize;
}

/** Identity chip. Images fade in; the fallback is always a readable glyph. */
export function Avatar(props: AvatarProps) {
  const { className, size = "md", ...rest } = props;
  return (
    <AvatarPrimitive.Root
      {...rest}
      className={cn("dl-avatar", className)}
      data-size={size}
    />
  );
}

export type AvatarImageStatus = "idle" | "loading" | "loaded" | "error";

export type AvatarImageProps = React.ComponentProps<typeof AvatarPrimitive.Image>;

/** The image is transparent until the browser reports it loaded, so the
 * fallback never flashes through a half-painted frame. */
export function AvatarImage(props: AvatarImageProps) {
  const { className, onLoadingStatusChange, ...rest } = props;
  const [status, setStatus] = React.useState<AvatarImageStatus>("idle");

  return (
    <AvatarPrimitive.Image
      {...rest}
      className={cn("dl-avatar__image", className)}
      data-status={status}
      onLoadingStatusChange={(next) => {
        setStatus(next);
        onLoadingStatusChange?.(next);
      }}
    />
  );
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  const first = parts[0] ?? "";
  if (parts.length > 1) {
    const last = parts[parts.length - 1] ?? "";
    return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
  }
  const chars = Array.from(first);
  const head = chars[0] ?? "";
  // CJK names read best as a single glyph; latin names as the first two letters.
  return /[\u3400-\u9fff]/.test(head) ? head : chars.slice(0, 2).join("").toUpperCase();
}

export interface AvatarFallbackProps
  extends React.ComponentProps<typeof AvatarPrimitive.Fallback> {
  /** Name used to derive initials when no children are passed. */
  name?: string;
}

export function AvatarFallback(props: AvatarFallbackProps) {
  const { className, name, children, ...rest } = props;
  const label = children ?? (name ? initialsOf(name) : "?");

  return (
    <AvatarPrimitive.Fallback
      {...rest}
      className={cn("dl-avatar__fallback", className)}
    >
      {label}
    </AvatarPrimitive.Fallback>
  );
}

export interface AvatarGroupProps extends React.ComponentPropsWithRef<"div"> {
  /** Maximum avatars rendered before collapsing the rest into a `+N` chip. */
  max?: number;
  /** Applied to every avatar in the stack unless the avatar sets its own. */
  size?: AvatarSize;
}

/** Overlapping avatar stack. The hovered avatar lifts above its neighbours. */
export function AvatarGroup(props: AvatarGroupProps) {
  const { max, size = "md", className, children, ...rest } = props;
  const items = React.Children.toArray(children).filter((child) => React.isValidElement(child));
  const visible = typeof max === "number" ? items.slice(0, Math.max(0, max)) : items;
  const hidden = items.length - visible.length;

  return (
    <div {...rest} className={cn("dl-avatar-group", className)} data-size={size}>
      {visible}
      {hidden > 0 ? (
        <span
          className="dl-avatar-group__more"
          role="img"
          aria-label={`还有 ${hidden} 个头像`}
        >
          +{hidden}
        </span>
      ) : null}
    </div>
  );
}
