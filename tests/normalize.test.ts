import { describe, it, expect } from "vitest";
import { normalizeEmail } from "../src/core/normalize";

describe("normalizeEmail", () => {
  it("trims surrounding whitespace", () => {
    expect(normalizeEmail(" ana@example.com ")).toBe("ana@example.com");
  });

  it("lowercases the address", () => {
    expect(normalizeEmail("ANA@EXAMPLE.COM")).toBe("ana@example.com");
  });

  it("maps padded and uppercase variants of one address to the same key", () => {
    expect(normalizeEmail(" ana@example.com ")).toBe(
      normalizeEmail("ANA@EXAMPLE.COM"),
    );
  });

  it("leaves an already normalized address untouched", () => {
    expect(normalizeEmail("luis@example.com")).toBe("luis@example.com");
  });

  it("returns an empty string for an empty field", () => {
    expect(normalizeEmail("")).toBe("");
  });
});
