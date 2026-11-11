import { describe, it, expect } from "vitest";
import { validateRecord, parsePreference } from "../src/core/validate";
import type { RawRecord } from "../src/core/types";

/** Builds a valid row, overriding only the field under test. */
function row(overrides: Partial<RawRecord> = {}): RawRecord {
  return {
    recordId: "x1",
    name: "Test",
    email: "test@example.com",
    optIn: "true",
    ...overrides,
  };
}

describe("parsePreference", () => {
  it("turns the exact strings into booleans", () => {
    expect(parsePreference("true")).toBe(true);
    expect(parsePreference("false")).toBe(false);
  });

  it("returns null for anything else", () => {
    expect(parsePreference("yes")).toBeNull();
    expect(parsePreference("1")).toBeNull();
    expect(parsePreference("")).toBeNull();
  });

  it("rejects a differently cased value", () => {
    expect(parsePreference("TRUE")).toBeNull();
  });
});

describe("validateRecord", () => {
  it("accepts a padded address and stores it normalized", () => {
    const result = validateRecord(row({ email: " ana@example.com " }));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.record.email).toBe("ana@example.com");
  });

  it("accepts an uppercase address and stores it normalized", () => {
    const result = validateRecord(row({ email: "ANA@EXAMPLE.COM" }));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.record.email).toBe("ana@example.com");
  });

  it("rejects an address with no @ sign", () => {
    const result = validateRecord(row({ email: "nico.example.com" }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.record.reason).toBe("INVALID_EMAIL_FORMAT");
  });

  it("rejects an empty address", () => {
    const result = validateRecord(row({ email: "" }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.record.reason).toBe("MISSING_EMAIL");
  });

  it("keeps the raw address on a rejected record", () => {
    const result = validateRecord(row({ email: "nico.example.com" }));
    if (!result.ok) expect(result.record.email).toBe("nico.example.com");
  });

  it("turns the preference string into a real boolean", () => {
    const result = validateRecord(row({ optIn: "false" }));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.record.optIn).toBe(false);
  });

  it("rejects a preference that is neither true nor false", () => {
    const result = validateRecord(row({ optIn: "TRUE" }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.record.reason).toBe("INVALID_PREFERENCE");
  });
});
