/**
 * Admin formatting helpers — server + client safe.
 *
 * Centralised so admin tables/cards display identical IDR amounts,
 * dates, and durations across modules.
 */

export function formatIdr(amount: number | null | undefined): string {
  if (amount == null) return "—";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = d instanceof Date ? d : new Date(d);
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = d instanceof Date ? d : new Date(d);
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

export function relativeFromNow(
  d: Date | string | null | undefined,
): string {
  if (!d) return "—";
  const date = d instanceof Date ? d : new Date(d);
  const diffMs = date.getTime() - Date.now();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const rtf = new Intl.RelativeTimeFormat("id-ID", { numeric: "auto" });
  if (Math.abs(diffDays) < 1) {
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    return rtf.format(diffHours, "hour");
  }
  return rtf.format(diffDays, "day");
}

/** Truncate long ids/emails for table cells. */
export function truncateMiddle(
  value: string | null | undefined,
  head = 8,
  tail = 4,
): string {
  if (!value) return "—";
  if (value.length <= head + tail + 1) return value;
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}
