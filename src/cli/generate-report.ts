import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { parseCsv } from "../core/parse";
import { buildReport } from "../core/report";

const INPUT = resolve("data/customers.csv");
const OUTPUT = resolve("public/report.json");

const report = buildReport(parseCsv(readFileSync(INPUT, "utf8")));

mkdirSync(dirname(OUTPUT), { recursive: true });
writeFileSync(OUTPUT, `${JSON.stringify(report, null, 2)}\n`, "utf8");

console.log(
  `Wrote ${OUTPUT}\n` +
    `  contacts: ${report.counts.contacts}\n` +
    `  eligible: ${report.counts.eligible}\n` +
    `  excluded: ${report.counts.excluded}\n` +
    `  rejected rows: ${report.counts.rejectedRecords}`,
);
