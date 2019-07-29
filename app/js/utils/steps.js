export function roundTo(value, step) {
  return ((value / step) >> 0) * step;
}
