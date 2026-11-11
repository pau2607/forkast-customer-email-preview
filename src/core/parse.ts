import type { RawRecord } from "./types";

const EXPECTED_HEADER = ["recordId", "name", "email", "optIn"];

/** Splits one CSV line, honouring double quotes around a field. */
function splitLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === "," && !inQuotes) {
      fields.push(current);
      current = "";
      continue;
    }
    current += char;
  }

  fields.push(current);
  return fields;
}

/**
 * Minimal CSV reader for this export's shape. It removes the quotes around a
 * field but keeps the text inside them exactly as written, padding included:
 * trimming is normalization's job, not the parser's.
 *
 * Not supported, and not needed here: escaped quotes ("") and newlines inside
 * a field.
 */
export function parseCsv(text: string): RawRecord[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "");
  if (lines.length === 0) return [];

  const header = splitLine(lines[0]).map((field) => field.trim());
  if (header.join(",") !== EXPECTED_HEADER.join(",")) {
    throw new Error(`Unexpected CSV header: ${header.join(",")}`);
  }

  return lines.slice(1).map((line) => {
    const [recordId = "", name = "", email = "", optIn = ""] = splitLine(line);
    return { recordId, name, email, optIn };
  });
}
