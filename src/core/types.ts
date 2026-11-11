/** A row exactly as it came out of the CSV. Every field is still text. */
export type RawRecord = {
  recordId: string;
  name: string;
  email: string;
  optIn: string;
};

/** A row that passed validation: email normalized, preference a real boolean. */
export type ValidRecord = {
  recordId: string;
  name: string;
  email: string;
  optIn: boolean;
};

export type RejectionReason =
  | "MISSING_EMAIL"
  | "INVALID_EMAIL_FORMAT"
  | "INVALID_PREFERENCE";

/** A row that failed validation. It never becomes a contact. */
export type RejectedRecord = {
  recordId: string;
  name: string;
  email: string;
  optIn: string;
  reason: RejectionReason;
  explanation: string;
};

export type ExclusionReason = "OPTED_OUT" | "SUPPRESSED";

export type ContactStatus = "ELIGIBLE" | "EXCLUDED";

/** One person. Every valid record sharing a normalized email collapses here. */
export type Contact = {
  email: string;
  displayName: string;
  recordIds: string[];
  status: ContactStatus;
  reason: ExclusionReason | null;
  explanation: string | null;
};

export type Report = {
  counts: {
    contacts: number;
    eligible: number;
    excluded: number;
    rejectedRecords: number;
  };
  contacts: Contact[];
  rejectedRecords: RejectedRecord[];
};
