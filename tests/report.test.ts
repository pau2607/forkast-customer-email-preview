import { describe, it, expect } from "vitest";
import { buildReport, chooseDisplayName } from "../src/core/report";
import type { RawRecord } from "../src/core/types";

/** The exercise fixture, as raw rows. */
const FIXTURE: RawRecord[] = [
  { recordId: "c1", name: "Ana", email: " ana@example.com ", optIn: "true" },
  { recordId: "c2", name: "Ana A", email: "ANA@EXAMPLE.COM", optIn: "true" },
  { recordId: "c3", name: "Luis", email: "luis@example.com", optIn: "true" },
  { recordId: "c4", name: "Marta", email: "marta@example.com", optIn: "true" },
  {
    recordId: "c5",
    name: "Marta M",
    email: "MARTA@example.com",
    optIn: "false",
  },
  { recordId: "c6", name: "Nico", email: "nico.example.com", optIn: "true" },
  { recordId: "c7", name: "Vera", email: "", optIn: "true" },
  { recordId: "c8", name: "Sol", email: "sol@example.com", optIn: "false" },
];

const find = (email: string) =>
  buildReport(FIXTURE).contacts.find((c) => c.email === email);

describe("chooseDisplayName", () => {
  it("prefers the longest name", () => {
    expect(chooseDisplayName(["Ana", "Ana A"])).toBe("Ana A");
  });

  it("breaks ties alphabetically", () => {
    expect(chooseDisplayName(["Zoe", "Ana"])).toBe("Ana");
  });

  it("does not depend on the order it receives", () => {
    expect(chooseDisplayName(["Ana A", "Ana"])).toBe(
      chooseDisplayName(["Ana", "Ana A"]),
    );
  });
});

describe("buildReport", () => {
  it("counts four contacts, two eligible, two rejected rows", () => {
    expect(buildReport(FIXTURE).counts).toEqual({
      contacts: 4,
      eligible: 2,
      excluded: 2,
      rejectedRecords: 2,
    });
  });

  it("merges records that share a normalized email into one contact", () => {
    expect(find("ana@example.com")?.recordIds).toEqual(["c1", "c2"]);
  });

  it("keeps a contact eligible when every record opts in", () => {
    expect(find("ana@example.com")?.status).toBe("ELIGIBLE");
  });

  it("excludes a contact when any single record opts out", () => {
    const marta = find("marta@example.com");
    expect(marta?.status).toBe("EXCLUDED");
    expect(marta?.reason).toBe("OPTED_OUT");
    expect(marta?.explanation).toContain("c5");
  });

  it("never turns a rejected row into a contact", () => {
    const emails = buildReport(FIXTURE).contacts.map((c) => c.email);
    expect(emails).not.toContain("");
    expect(emails).not.toContain("nico.example.com");
    expect(emails).toHaveLength(4);
  });

  it("explains every rejected row", () => {
    const rejected = buildReport(FIXTURE).rejectedRecords;
    expect(rejected.map((r) => r.recordId)).toEqual(["c6", "c7"]);
    expect(rejected.every((r) => r.explanation.length > 0)).toBe(true);
  });

  it("produces the same report when the input is reordered", () => {
    expect(buildReport([...FIXTURE].reverse())).toEqual(buildReport(FIXTURE));
  });

  it("produces the same report when a row is repeated", () => {
    expect(buildReport([...FIXTURE, FIXTURE[2]])).toEqual(buildReport(FIXTURE));
  });

  it("produces the same report when an opt-out row is repeated", () => {
    expect(buildReport([...FIXTURE, FIXTURE[4]])).toEqual(buildReport(FIXTURE));
  });

  it("treats a padded opt-out as an opt-out, not as a rejected row", () => {
    const rows: RawRecord[] = [
      {
        recordId: "d1",
        name: "Dana",
        email: "dana@example.com",
        optIn: "true",
      },
      {
        recordId: "d2",
        name: "Dana",
        email: "dana@example.com",
        optIn: " false ",
      },
    ];
    const report = buildReport(rows);
    expect(report.counts.rejectedRecords).toBe(0);
    expect(report.contacts[0].status).toBe("EXCLUDED");
  });
});
