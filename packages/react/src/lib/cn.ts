import { clsx, type ClassValue } from "clsx";

/** Merge class names. Deyloom does not use utility classes, so clsx is enough. */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
