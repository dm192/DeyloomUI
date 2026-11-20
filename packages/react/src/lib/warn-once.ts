const warned = new Set<string>();

/**
 * Dev-only, once-per-key console warning. Used when a component is rendered
 * outside `DeyloomProvider`: it still renders, but its motion features are not
 * loaded, which is otherwise a silent failure.
 */
export function warnOnce(key: string, message: string): void {
  if (process.env.NODE_ENV === "production") return;
  if (warned.has(key)) return;
  warned.add(key);
  console.warn(`[Deyloom] ${message}`);
}
