export function isValidQuantityStep(quantity: number, step: number): boolean {
  if (!Number.isFinite(quantity) || !Number.isFinite(step) || quantity <= 0 || step <= 0) {
    return false;
  }

  const ratio = quantity / step;
  return Math.abs(ratio - Math.round(ratio)) < 1e-8;
}

export function nextQuantity(
  current: number,
  step: number,
  stock: number,
  direction: 1 | -1,
): number {
  if (direction < 0) {
    return Math.max(0, roundToStep(current - step, step));
  }

  const next = roundToStep(current + step, step);
  return next > stock ? current : next;
}

function roundToStep(value: number, step: number): number {
  return Math.round(value / step) * step;
}
