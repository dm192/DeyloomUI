export {
  DeyloomProvider,
  DeyloomContext,
  type DeyloomProviderProps,
  type DeyloomContextValue,
  type DeyloomTheme,
  type DeyloomReducedMotion,
} from "./provider";

export {
  useDeyloom,
  useDeyloomTheme,
  useDeyloomReducedMotion,
  useDeyloomPortalContainer,
  type UseDeyloomThemeResult,
} from "./hooks";

export * from "./motion";

/* The inline glyphs the components use, so consumers can match them. */
export * as DeyloomIcons from "./lib/icons";

export * from "./components/button";
export * from "./components/icon-button";

/* Each group barrel is owned by one workstream; this file stays stable. */
export * from "./components/form";
export * from "./components/navigation";
export * from "./components/overlay";
export * from "./components/showcase";
