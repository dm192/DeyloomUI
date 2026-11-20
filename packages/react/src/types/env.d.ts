/**
 * The bundle reads `process.env.NODE_ENV` at runtime so consumer bundlers can
 * strip dev-only warnings. Declared locally so the library's own typecheck does
 * not pull Node types into the browser build.
 */
declare const process: {
  env: {
    NODE_ENV?: "development" | "production" | "test" | string;
  };
};
