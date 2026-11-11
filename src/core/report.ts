import type {
  Contact,
  RawRecord,
  RejectedRecord,
  Report,
  ValidRecord,
} from "./types";
import { validateRecord } from "./validate";

/** Deterministic string order. Avoids localeCompare, whose result varies by machine. */
function compare(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/**
 * Display-name rule: the longest name wins, ties broken alphabetically.
 * Deterministic, so input order cannot change it, and it keeps the most
 * complete name. Trade-off: a long junk value would beat a clean short one.
 */
export function chooseDisplayName(names: string[]): string {
  if (names.length === 0) return "";
  return [...names].sort((a, b) => b.length - a.length || compare(a, b))[0];
}

function evaluateContact(email: string, records: ValidRecord[]): Contact {
  const displayName = chooseDisplayName(records.map((r) => r.name));
  const recordIds = [...new Set(records.map((r) => r.recordId))].sort(compare);
  const optedOut = records
    .filter((r) => !r.optIn)
    .map((r) => r.recordId)
    .sort(compare);

  if (optedOut.length > 0) {
    const label = optedOut.length === 1 ? "Record" : "Records";
    return {
      email,
      displayName,
      recordIds,
      status: "EXCLUDED",
      reason: "OPTED_OUT",
      explanation: `${label} ${optedOut.join(", ")} set the preference to false.`,
    };
  }

  return {
    email,
    displayName,
    recordIds,
    status: "ELIGIBLE",
    reason: null,
    explanation: null,
  };
}

export function buildReport(rawRecords: RawRecord[]): Report {
  const validRecords: ValidRecord[] = [];
  const rejectedRecords: RejectedRecord[] = [];

  for (const raw of rawRecords) {
    const result = validateRecord(raw);
    if (result.ok) validRecords.push(result.record);
    else rejectedRecords.push(result.record);
  }

  const groups = new Map<string, ValidRecord[]>();
  for (const record of validRecords) {
    const bucket = groups.get(record.email);
    if (bucket) bucket.push(record);
    else groups.set(record.email, [record]);
  }

  const contacts = [...groups.entries()]
    .map(([email, records]) => evaluateContact(email, records))
    .sort((a, b) => compare(a.email, b.email));

  rejectedRecords.sort((a, b) => compare(a.recordId, b.recordId));

  return {
    counts: {
      contacts: contacts.length,
      eligible: contacts.filter((c) => c.status === "ELIGIBLE").length,
      excluded: contacts.filter((c) => c.status === "EXCLUDED").length,
      rejectedRecords: rejectedRecords.length,
    },
    contacts,
    rejectedRecords,
  };
}
