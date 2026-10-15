export function sortOrdersNewestFirst<T extends { created_at: string; order_no: string }>(orders: T[]): T[] {
  return [...orders].sort((a, b) => {
    const byDate = Date.parse(b.created_at) - Date.parse(a.created_at);
    if (byDate !== 0) {
      return byDate;
    }
    return b.order_no.localeCompare(a.order_no, undefined, { numeric: true });
  });
}
