import { describe, it, expect } from "vitest";
import { buildReport } from "../src/core/report";
import type { RawRecord } from "../src/core/types";

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

/** The list exactly as the brief supplies it: padded and uppercase. */
const LIST = [" LUIS@EXAMPLE.COM ", "nobody@example.com"];

const contactFor = (email: string, list: string[]) =>
  buildReport(FIXTURE, list).contacts.find((c) => c.email === email);

describe("suppression list", () => {
  it("excludes a listed contact even when every record opted in", () => {
    const luis = contactFor("luis@example.com", LIST);
    expect(luis?.status).toBe("EXCLUDED");
    expect(luis?.reason).toBe("SUPPRESSED");
    expect(luis?.explanation).toMatch(/suppression list/i);
  });

  it("matches a padded, uppercase entry against a normalized address", () => {
    expect(contactFor("luis@example.com", [" LUIS@EXAMPLE.COM "])?.status).toBe(
      "EXCLUDED",
    );
  });

  it("does not create a contact for an address that is not in the export", () => {
    const report = buildReport(FIXTURE, LIST);
    expect(report.contacts.map((c) => c.email)).not.toContain(
      "nobody@example.com",
    );
    expect(report.counts.contacts).toBe(4);
  });

  it("leaves the Stage 1 result untouched when the list is empty", () => {
    expect(buildReport(FIXTURE, [])).toEqual(buildReport(FIXTURE));
  });

  it("leaves opted-out contacts on their original reason", () => {
    expect(contactFor("marta@example.com", LIST)?.reason).toBe("OPTED_OUT");
  });

  it("prefers the suppression reason when a contact is also opted out", () => {
    expect(contactFor("sol@example.com", ["sol@example.com"])?.reason).toBe(
      "SUPPRESSED",
    );
  });

  it("reports one eligible contact of four", () => {
    expect(buildReport(FIXTURE, LIST).counts).toEqual({
      contacts: 4,
      eligible: 1,
      excluded: 3,
      rejectedRecords: 2,
    });
  });

  it("is still unaffected by input order", () => {
    expect(buildReport([...FIXTURE].reverse(), LIST)).toEqual(
      buildReport(FIXTURE, LIST),
    );
  });
});
