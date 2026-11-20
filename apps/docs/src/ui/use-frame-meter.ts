import * as React from "react";

export interface FrameStats {
  frames: number;
  avg: number;
  p95: number;
  max: number;
}

/**
 * Samples requestAnimationFrame deltas for a fixed window. This measures the
 * browser's real frame cadence during whatever animation the caller started —
 * it is evidence from this machine, not a benchmark claim.
 */
export function useFrameMeter() {
  const [stats, setStats] = React.useState<FrameStats | null>(null);
  const [running, setRunning] = React.useState(false);
  const handle = React.useRef<number | null>(null);

  React.useEffect(() => {
    return () => {
      if (handle.current !== null) cancelAnimationFrame(handle.current);
    };
  }, []);

  const measure = React.useCallback((durationMs = 1200, onStart?: () => void) => {
    if (handle.current !== null) return;
    onStart?.();
    setRunning(true);

    const deltas: number[] = [];
    let last = performance.now();
    const start = last;

    const tick = (now: number) => {
      deltas.push(now - last);
      last = now;

      if (now - start < durationMs) {
        handle.current = requestAnimationFrame(tick);
        return;
      }

      handle.current = null;
      setRunning(false);
      const sorted = [...deltas].sort((a, b) => a - b);
      const p95Index = Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95));
      setStats({
        frames: deltas.length,
        avg: deltas.reduce((sum, delta) => sum + delta, 0) / Math.max(1, deltas.length),
        p95: sorted[p95Index] ?? 0,
        max: sorted[sorted.length - 1] ?? 0,
      });
    };

    handle.current = requestAnimationFrame(tick);
  }, []);

  return { stats, running, measure, reset: () => setStats(null) };
}

export function formatMs(value: number): string {
  return `${value.toFixed(1)} ms`;
}
