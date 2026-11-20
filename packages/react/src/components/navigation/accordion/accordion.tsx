import * as React from "react";
import { Accordion as AccordionPrimitive } from "radix-ui";
import { m } from "motion/react";
import { cn } from "../../../lib/cn";
import { ChevronDownIcon } from "../../../lib/icons";
import { scales, springs } from "../../../motion/presets";
import { useDeyloomReducedMotion } from "../../../hooks";

export type AccordionProps = React.ComponentProps<typeof AccordionPrimitive.Root>;

/**
 * Vertical disclosure list. Radix owns the single/multiple bookkeeping and the
 * ARIA relationship between trigger and panel.
 */
export function Accordion(props: AccordionProps) {
  return (
    <AccordionPrimitive.Root
      {...props}
      className={cn("dl-accordion", props.className)}
    />
  );
}

export type AccordionItemProps = React.ComponentProps<typeof AccordionPrimitive.Item>;

export function AccordionItem(props: AccordionItemProps) {
  return (
    <AccordionPrimitive.Item
      {...props}
      className={cn("dl-accordion__item", props.className)}
    />
  );
}

export type AccordionTriggerProps = Omit<
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>,
  "asChild"
> & {
  ref?: React.Ref<HTMLButtonElement>;
};

/** Header + trigger + chevron. The chevron rotates 180° when the panel opens. */
export function AccordionTrigger(props: AccordionTriggerProps) {
  const { className, children, ref, ...rest } = props;
  const reducedMotion = useDeyloomReducedMotion();

  return (
    <AccordionPrimitive.Header className="dl-accordion__header">
      <AccordionPrimitive.Trigger asChild {...rest}>
        <m.button
          ref={ref}
          type="button"
          className={cn("dl-accordion__trigger", "dl-focusable", className)}
          whileTap={reducedMotion ? undefined : { scale: scales.press }}
          transition={springs.press}
        >
          <span className="dl-accordion__trigger-text">{children}</span>
          <ChevronDownIcon className="dl-accordion__chevron" />
        </m.button>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

export type AccordionContentProps = React.ComponentProps<
  typeof AccordionPrimitive.Content
>;

/**
 * Panel body. The open/close height is driven by the Radix-exposed
 * `--radix-accordion-content-height` custom property (see accordion.css).
 */
export function AccordionContent(props: AccordionContentProps) {
  const { className, children, ...rest } = props;

  return (
    <AccordionPrimitive.Content
      {...rest}
      className={cn("dl-accordion__content", className)}
    >
      <div className="dl-accordion__content-inner">{children}</div>
    </AccordionPrimitive.Content>
  );
}
