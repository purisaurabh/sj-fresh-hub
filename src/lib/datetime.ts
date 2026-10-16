export const SHOP_TIME_ZONE = "Asia/Kolkata";

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: SHOP_TIME_ZONE,
  }).format(Date.parse(iso));
}

export function isIsoDateOnly(value: string | undefined): value is string {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

/** Start of a calendar day in India, as a UTC ISO string for database filters. */
export function startOfShopDayIso(dateYmd: string): string {
  return new Date(`${dateYmd}T00:00:00+05:30`).toISOString();
}

/** Inclusive end of a calendar day in India, as a UTC ISO string for database filters. */
export function endOfShopDayIso(dateYmd: string): string {
  return new Date(`${dateYmd}T23:59:59.999+05:30`).toISOString();
}

export function todayInShopTz(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: SHOP_TIME_ZONE }).format(new Date());
}

export function formatPhone(phone: string | null | undefined): string {
  if (!phone) {
    return "No phone on file";
  }
  if (/^\d{10}$/.test(phone)) {
    return `+91 ${phone}`;
  }
  return phone;
}
