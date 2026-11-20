import * as React from "react";

export type Route =
  | { name: "home" }
  | { name: "foundations" }
  | { name: "motion" }
  | { name: "performance" }
  | { name: "harness" }
  | { name: "components" }
  | { name: "component"; slug: string }
  | { name: "not-found"; path: string };

export function parseRoute(hash: string): Route {
  const path = hash.replace(/^#\/?/, "").replace(/\/+$/, "");
  if (path === "") return { name: "home" };

  const [head, second] = path.split("/");
  switch (head) {
    case "foundations":
      return { name: "foundations" };
    case "motion":
      return { name: "motion" };
    case "performance":
      return { name: "performance" };
    case "harness":
      return { name: "harness" };
    case "components":
      return second ? { name: "component", slug: second } : { name: "components" };
    default:
      return { name: "not-found", path };
  }
}

let cache: { hash: string; route: Route } | null = null;

function getSnapshot(): Route {
  const hash = typeof window === "undefined" ? "" : window.location.hash;
  if (!cache || cache.hash !== hash) cache = { hash, route: parseRoute(hash) };
  return cache.route;
}

function getServerSnapshot(): Route {
  return { name: "home" };
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

export function useRoute(): Route {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function hrefFor(path: string): string {
  return `#${path}`;
}

export function navigate(path: string): void {
  const next = `#${path}`;
  if (window.location.hash !== next) window.location.hash = next;
}
