import * as React from "react";
import { Direction } from "radix-ui";
import { LazyMotion, MotionConfig, domAnimation } from "motion/react";
import type { Transition } from "motion/react";
import { defaultTransition } from "./motion/presets";

export type DeyloomTheme = "light" | "dark" | "system";
export type DeyloomReducedMotion = "user" | "always" | "never";

type LazyMotionFeatures = React.ComponentProps<typeof LazyMotion>["features"];

export interface DeyloomContextValue {
  /** Requested theme. `system` follows the OS preference. */
  theme: DeyloomTheme;
  /** Theme actually painted right now. */
  resolvedTheme: "light" | "dark";
  setTheme: (theme: DeyloomTheme) => void;
  reducedMotion: DeyloomReducedMotion;
  setReducedMotion: (value: DeyloomReducedMotion) => void;
  /** Explicit portal host for overlays; `undefined` means document.body. */
  portalContainer: HTMLElement | null | undefined;
}

export const DeyloomContext = React.createContext<DeyloomContextValue | null>(null);

export interface DeyloomProviderProps {
  children?: React.ReactNode;
  /** Controlled theme. Omit to let the provider own the state. */
  theme?: DeyloomTheme;
  defaultTheme?: DeyloomTheme;
  onThemeChange?: (theme: DeyloomTheme) => void;
  /** localStorage key. The docs site uses `"deyloom-theme"` for its pre-paint script. */
  storageKey?: string;
  /** Any CSS color; overrides --dl-color-accent and its derived shades. */
  accent?: string;
  reducedMotion?: DeyloomReducedMotion;
  defaultReducedMotion?: DeyloomReducedMotion;
  onReducedMotionChange?: (value: DeyloomReducedMotion) => void;
  /**
   * Motion feature bundle. Defaults to `domAnimation` (smaller).
   * Pass `domMax` only if you need layout animations or drag gestures.
   */
  features?: LazyMotionFeatures;
  dir?: "ltr" | "rtl";
  portalContainer?: HTMLElement | null;
  /** Default transition for every `m.*` element under the provider. */
  transition?: Transition;
}

function isTheme(value: unknown): value is DeyloomTheme {
  return value === "light" || value === "dark" || value === "system";
}

function isReducedMotion(value: unknown): value is DeyloomReducedMotion {
  return value === "user" || value === "always" || value === "never";
}

function readStored(storageKey: string | undefined): string | null {
  if (!storageKey || typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(storageKey);
  } catch {
    return null;
  }
}

function useSystemTheme(): "light" | "dark" {
  const [systemTheme, setSystemTheme] = React.useState<"light" | "dark">(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  React.useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => setSystemTheme(query.matches ? "dark" : "light");
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  return systemTheme;
}

/**
 * Wraps the app once. Provides theme control, the shared motion configuration and
 * the Radix direction context. Component animation depends on `LazyMotion`, so
 * rendering components outside a provider gives you static markup plus a dev
 * warning instead of an animation.
 */
export function DeyloomProvider(props: DeyloomProviderProps) {
  const {
    children,
    theme: themeProp,
    defaultTheme = "system",
    onThemeChange,
    storageKey,
    accent,
    reducedMotion: reducedMotionProp,
    defaultReducedMotion = "user",
    onReducedMotionChange,
    features = domAnimation,
    dir = "ltr",
    portalContainer,
    transition = defaultTransition,
  } = props;

  const [themeState, setThemeState] = React.useState<DeyloomTheme>(() => {
    const stored = readStored(storageKey);
    return isTheme(stored) ? stored : defaultTheme;
  });
  const theme = themeProp ?? themeState;

  const [reducedMotionState, setReducedMotionState] = React.useState<DeyloomReducedMotion>(() => {
    const stored = storageKey ? readStored(`${storageKey}-motion`) : null;
    return isReducedMotion(stored) ? stored : defaultReducedMotion;
  });
  const reducedMotion = reducedMotionProp ?? reducedMotionState;

  const systemTheme = useSystemTheme();
  const resolvedTheme = theme === "system" ? systemTheme : theme;

  const setTheme = React.useCallback(
    (next: DeyloomTheme) => {
      if (themeProp === undefined) setThemeState(next);
      if (storageKey && typeof window !== "undefined") {
        try {
          window.localStorage.setItem(storageKey, next);
        } catch {
          /* private mode */
        }
      }
      onThemeChange?.(next);
    },
    [themeProp, storageKey, onThemeChange],
  );

  const setReducedMotion = React.useCallback(
    (next: DeyloomReducedMotion) => {
      if (reducedMotionProp === undefined) setReducedMotionState(next);
      if (storageKey && typeof window !== "undefined") {
        try {
          window.localStorage.setItem(`${storageKey}-motion`, next);
        } catch {
          /* private mode */
        }
      }
      onReducedMotionChange?.(next);
    },
    [reducedMotionProp, storageKey, onReducedMotionChange],
  );

  React.useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (theme === "system") root.removeAttribute("data-dl-theme");
    else root.setAttribute("data-dl-theme", theme);
  }, [theme]);

  React.useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const previous = root.style.getPropertyValue("--dl-color-accent");
    if (accent) root.style.setProperty("--dl-color-accent", accent);
    else if (previous) root.style.removeProperty("--dl-color-accent");
    return () => {
      if (previous) root.style.setProperty("--dl-color-accent", previous);
      else if (accent) root.style.removeProperty("--dl-color-accent");
    };
  }, [accent]);

  React.useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (reducedMotion === "always") root.setAttribute("data-dl-motion", "reduced");
    else root.removeAttribute("data-dl-motion");
  }, [reducedMotion]);

  const contextValue = React.useMemo<DeyloomContextValue>(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
      reducedMotion,
      setReducedMotion,
      portalContainer,
    }),
    [theme, resolvedTheme, setTheme, reducedMotion, setReducedMotion, portalContainer],
  );

  return (
    <DeyloomContext.Provider value={contextValue}>
      <Direction.Provider dir={dir}>
        <LazyMotion features={features} strict>
          <MotionConfig reducedMotion={reducedMotion} transition={transition}>
            {children}
          </MotionConfig>
        </LazyMotion>
      </Direction.Provider>
    </DeyloomContext.Provider>
  );
}
