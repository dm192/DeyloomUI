import * as React from "react";

/**
 * Minimal inline icon set. Deyloom deliberately ships no icon dependency: these
 * are the glyphs the components themselves need, drawn on a 16px grid with
 * `currentColor` so they inherit text colour and never trigger a repaint on
 * theme switch.
 */
export type IconProps = React.ComponentProps<"svg">;

function Svg(props: IconProps & { children: React.ReactNode }) {
  const { children, width = 16, height = 16, ...rest } = props;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 6.25 8 10.25l4-4" />
    </Svg>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M6.25 4 10.25 8l-4 4" />
    </Svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3.5 8.5 6.25 11.25 12.5 5" />
    </Svg>
  );
}

export function MinusIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 8h8" />
    </Svg>
  );
}

export function XIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" />
    </Svg>
  );
}

export function DotIcon(props: IconProps) {
  return (
    <Svg {...props} stroke="none" fill="currentColor">
      <circle cx="8" cy="8" r="2.5" />
    </Svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3 8h10M9 4l4 4-4 4" />
    </Svg>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M8 3.5v9M3.5 8h9" />
    </Svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="7.25" cy="7.25" r="4.25" />
      <path d="M10.5 10.5 13.5 13.5" />
    </Svg>
  );
}

export function WarningIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M8 2.5 14.5 13.5h-13L8 2.5Z" />
      <path d="M8 6.5v3" />
      <circle cx="8" cy="11.5" r="0.6" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function InfoIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="8" cy="8" r="5.75" />
      <path d="M8 7.25v4" />
      <circle cx="8" cy="5" r="0.6" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function CheckCircleIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="8" cy="8" r="5.75" />
      <path d="M5.5 8.25 7.25 10l3.5-4" />
    </Svg>
  );
}

export function SpinnerIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M8 2.25a5.75 5.75 0 1 1-5.75 5.75" opacity={0.9} />
    </Svg>
  );
}

export function GripIcon(props: IconProps) {
  return (
    <Svg {...props} stroke="none" fill="currentColor">
      <circle cx="5.5" cy="5" r="1" />
      <circle cx="5.5" cy="8" r="1" />
      <circle cx="5.5" cy="11" r="1" />
      <circle cx="10.5" cy="5" r="1" />
      <circle cx="10.5" cy="8" r="1" />
      <circle cx="10.5" cy="11" r="1" />
    </Svg>
  );
}
