/**
 * The single place where an email address becomes comparable.
 * Used for records and for the suppression list, so both agree by construction.
 */
export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}
