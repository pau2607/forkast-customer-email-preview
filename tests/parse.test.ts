import { describe, it, expect } from "vitest";
import { parseCsv } from "../src/core/parse";

const HEADER = "recordId,name,email,optIn";

describe("parseCsv", () => {
  it("reads the four columns of a row", () => {
    expect(parseCsv(`${HEADER}\nc3,Luis,luis@example.com,true`)).toEqual([
      {
        recordId: "c3",
        name: "Luis",
        email: "luis@example.com",
        optIn: "true",
      },
    ]);
  });

  it("keeps the padding inside a quoted field", () => {
    const rows = parseCsv(`${HEADER}\nc1,Ana," ana@example.com ",true`);
    expect(rows[0].email).toBe(" ana@example.com ");
  });

  it("reads an empty field as an empty string", () => {
    const rows = parseCsv(`${HEADER}\nc7,Vera,,true`);
    expect(rows[0].email).toBe("");
  });

  it("gives the same rows for Windows and Unix line endings", () => {
    const unix = `${HEADER}\nc3,Luis,luis@example.com,true\n`;
    expect(parseCsv(unix.replace(/\n/g, "\r\n"))).toEqual(parseCsv(unix));
  });

  it("ignores trailing blank lines", () => {
    expect(
      parseCsv(`${HEADER}\nc3,Luis,luis@example.com,true\n\n`),
    ).toHaveLength(1);
  });

  it("refuses a file whose header is not the expected one", () => {
    expect(() => parseCsv("a,b,c,d\n1,2,3,4")).toThrow(/Unexpected CSV header/);
  });
});
