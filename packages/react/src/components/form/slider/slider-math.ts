/**
 * Geometry for the slider fill. Kept pure so the mapping can be unit tested
 * without a DOM — the geometry was the part that was wrong before.
 */
export interface SliderFillGeometry {
  /** Where the filled range starts, as a percentage from the start edge. */
  startPercent: number;
  /** Scale factor applied to the fill element (0–1). */
  scale: number;
}

export function clampPercent(value: number): number {
  return Math.min(Math.max(Number.isFinite(value) ? value : 0, 0), 100);
}

function percentOf(value: number, min: number, max: number): number {
  const range = max - min || 1;
  return clampPercent(((value - min) / range) * 100);
}

/**
 * A single thumb fills from the track start to the thumb; a range fills between
 * the two thumbs. The previous formula treated every slider as a range, which
 * made single-value sliders render an empty `scaleX(0)` fill.
 */
export function computeSliderFill(
  values: readonly number[],
  min: number,
  max: number,
): SliderFillGeometry {
  const head = percentOf(values[0] ?? min, min, max);
  const tail = percentOf(values[values.length - 1] ?? min, min, max);

  if (values.length <= 1) {
    return { startPercent: 0, scale: head / 100 };
  }

  const span = Math.max(tail - head, 0);
  const available = 100 - head;
  return { startPercent: head, scale: available <= 0 ? 0 : span / available };
}
