import type * as React from "react";

/** One live example rendered inside a canvas on a component page. */
export interface DemoExample {
  title: string;
  /** Optional one-line note. Only add it when it prevents a mistake. */
  description?: string;
  render: () => React.ReactNode;
  /** How the canvas lays the example out. Defaults to "start". */
  layout?: "start" | "center" | "row" | "stretch" | "grid";
  /** Canvas background. Defaults to "surface". */
  surface?: "surface" | "sunken";
}

/** A documented prop. Keep it to the props a consumer actually needs to know. */
export interface DemoProp {
  name: string;
  type: string;
  default?: string;
  description: string;
}

export interface DemoEntry {
  /** URL slug: /components/<slug>. */
  slug: string;
  title: string;
  group: "foundation" | "form" | "navigation" | "overlay" | "showcase";
  /** One sentence: what the component is for. No marketing copy. */
  summary: string;
  examples: DemoExample[];
  props?: DemoProp[];
  /** Keyboard / behaviour notes worth calling out. */
  notes?: string[];
}

/** Helper so demo files get literal-type inference for `group`. */
export function defineDemos<const T extends DemoEntry[]>(demos: T): DemoEntry[] {
  return demos;
}
