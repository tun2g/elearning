/** Parses a duration string like `15m`, `24h`, `30d` into milliseconds. */
export function parseDurationMs(duration: string): number {
  const unit = duration.slice(-1);
  const value = parseInt(duration.slice(0, -1), 10);
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  };
  return value * (multipliers[unit] ?? 60_000);
}

/** Derives a display name from an email local-part (for auto-created accounts). */
export function deriveName(email: string): string {
  const local = email.split('@')[0] || 'there';
  return local.charAt(0).toUpperCase() + local.slice(1);
}
