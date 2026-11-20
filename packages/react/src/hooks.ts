import * as React from "react";
import { useReducedMotion } from "motion/react";
import { DeyloomContext, type DeyloomTheme, type DeyloomContextValue } from "./provider";
import { warnOnce } from "./lib/warn-once";

const fallbackContext: DeyloomContextValue = {
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => {
    warnOnce("theme-set", "`setTheme` needs the component tree to be wrapped in <DeyloomProvider>.");
  },
  reducedMotion: "user",
  setReducedMotion: () => {
    warnOnce(
      "reduced-motion-set",
      "`setReducedMotion` needs the component tree to be wrapped in <DeyloomProvider>.",
    );
  },
  portalContainer: undefined,
};

/** Read the Deyloom context. Falls back to defaults (and warns once) outside a provider. */
export function useDeyloom(): DeyloomContextValue {
  const context = React.useContext(DeyloomContext);
  if (context) return context;
  warnOnce(
    "provider-missing",
    "Components are rendering outside <DeyloomProvider>. Motion features are not loaded, so animations will not run.",
  );
  return fallbackContext;
}

export interface UseDeyloomThemeResult {
  theme: DeyloomTheme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: DeyloomTheme) => void;
}

/** Read and change the active theme. */
export function useDeyloomTheme(): UseDeyloomThemeResult {
  const { theme, resolvedTheme, setTheme } = useDeyloom();
  return { theme, resolvedTheme, setTheme };
}

/**
 * Resolve whether motion should be reduced, combining the explicit
 * `reducedMotion` setting with the OS preference. Components use this for the few
 * decisions CSS cannot make (skipping drag handlers, disabling loops entirely).
 */
export function useDeyloomReducedMotion(): boolean {
  const { reducedMotion } = useDeyloom();
  const systemPreference = useReducedMotion();

  if (reducedMotion === "always") return true;
  if (reducedMotion === "never") return false;
  return systemPreference ?? false;
}

/** Portal host for overlays, or `undefined` for `document.body`. */
export function useDeyloomPortalContainer(): HTMLElement | null | undefined {
  return useDeyloom().portalContainer;
}
