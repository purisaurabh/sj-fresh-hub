export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function lineTotal(unitPrice: number, quantity: number): number {
  return roundMoney(unitPrice * quantity);
}

export function calculateCartTotals(
  lines: ReadonlyArray<{ unitPrice: number; quantity: number }>,
  deliveryFee: number,
): { subtotal: number; deliveryFee: number; total: number } {
  const subtotal = roundMoney(
    lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0),
  );
  const fee = roundMoney(deliveryFee);

  return {
    subtotal,
    deliveryFee: fee,
    total: roundMoney(subtotal + fee),
  };
}

export function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPriceWithUnit(amount: number, unit: string): string {
  return `${formatInr(amount)} / ${unit}`;
}
