/**
 * Parse a Supabase Postgres timestamp string. Postgres `TIMESTAMP` columns
 * (without timezone) are returned by Supabase REST as ISO-like strings WITHOUT
 * a trailing "Z" (e.g. "2026-05-20T10:57:31.675"). Node V8 parses such
 * strings as LOCAL time, which causes an 8-hour offset on hosts running in
 * Asia/Shanghai (or any non-UTC zone).
 *
 * Since we always WRITE these timestamps with `new Date().toISOString()`,
 * the stored value is effectively UTC. So the safe parse is: append "Z" if
 * missing, then `new Date(...)`.
 */
export function parseTs(ts: string | Date | null | undefined): Date | null {
  if (!ts) return null
  if (ts instanceof Date) return ts
  if (/[Z+\-]\d{2}:?\d{2}?$/i.test(ts) || ts.endsWith("Z")) {
    return new Date(ts)
  }
  return new Date(ts + "Z")
}

export function tsToMs(ts: string | Date | null | undefined): number {
  const d = parseTs(ts)
  return d ? d.getTime() : 0
}
