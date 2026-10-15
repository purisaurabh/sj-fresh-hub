export function normalizePhone(value: string): string {
  return value.replace(/\D/g, "").slice(-10);
}

export function toE164India(phone: string): string {
  return `+91${normalizePhone(phone)}`;
}

export function toInternalEmail(phone: string): string {
  return `91${normalizePhone(phone)}@users.sjfreshhub.invalid`;
}
