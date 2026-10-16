export function namesMatchIgnoreCase(left: string, right: string) {
  return left.trim().toLowerCase() === right.trim().toLowerCase();
}

export function hasDuplicateName(
  rows: { id: string; name: string }[],
  name: string,
  excludeId?: string,
) {
  return rows.some((row) => row.id !== excludeId && namesMatchIgnoreCase(row.name, name));
}
