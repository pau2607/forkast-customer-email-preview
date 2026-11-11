import type {
  RawRecord,
  RejectedRecord,
  RejectionReason,
  ValidRecord,
} from "./types";
import { normalizeEmail } from "./normalize";

/** The complete email-format requirement for this exercise. No external library. */
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Only the exact strings "true" and "false" are accepted. Anything else is invalid. */
export function parsePreference(raw: string): boolean | null {
  const value = raw.trim();
  if (value === "true") return true;
  if (value === "false") return false;
  return null;
}

export type ValidationResult =
  | { ok: true; record: ValidRecord }
  | { ok: false; record: RejectedRecord };

function reject(
  raw: RawRecord,
  reason: RejectionReason,
  explanation: string,
): ValidationResult {
  return {
    ok: false,
    record: {
      recordId: raw.recordId,
      name: raw.name.trim(),
      email: raw.email,
      optIn: raw.optIn,
      reason,
      explanation,
    },
  };
}

export function validateRecord(raw: RawRecord): ValidationResult {
  const email = normalizeEmail(raw.email);

  if (email === "") {
    return reject(raw, "MISSING_EMAIL", "The email address is empty.");
  }

  if (!EMAIL_PATTERN.test(email)) {
    return reject(
      raw,
      "INVALID_EMAIL_FORMAT",
      `"${raw.email.trim()}" is not a valid email address.`,
    );
  }

  const optIn = parsePreference(raw.optIn);
  if (optIn === null) {
    return reject(
      raw,
      "INVALID_PREFERENCE",
      `"${raw.optIn.trim()}" is not true or false.`,
    );
  }

  return {
    ok: true,
    record: { recordId: raw.recordId, name: raw.name.trim(), email, optIn },
  };
}
