import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { parseCsv } from "../core/parse";
import { buildReport } from "../core/report";

const INPUT = resolve("data/customers.csv");
const SUPPRESSION = resolve("data/suppression.json");
const OUTPUT = resolve("public/report.json");

/** Reads the suppression list, failing loudly if the file is not a list of addresses. */
function readSuppressionList(path: string): string[] {
  const parsed: unknown = JSON.parse(readFileSync(path, "utf8"));
  if (
    !Array.isArray(parsed) ||
    parsed.some((entry) => typeof entry !== "string")
  ) {
    throw new Error(`${path} must contain an array of strings.`);
  }
  return parsed as string[];
}

const report = buildReport(
  parseCsv(readFileSync(INPUT, "utf8")),
  readSuppressionList(SUPPRESSION),
);

mkdirSync(dirname(OUTPUT), { recursive: true });
writeFileSync(OUTPUT, `${JSON.stringify(report, null, 2)}\n`, "utf8");

console.log(
  `Wrote ${OUTPUT}\n` +
    `  contacts: ${report.counts.contacts}\n` +
    `  eligible: ${report.counts.eligible}\n` +
    `  excluded: ${report.counts.excluded}\n` +
    `  rejected rows: ${report.counts.rejectedRecords}`,
);
