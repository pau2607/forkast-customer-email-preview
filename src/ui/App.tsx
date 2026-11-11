import { useEffect, useState } from "react";
import type { Contact, RejectedRecord, Report } from "../core/types";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; report: Report };

export function App() {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [onlyEligible, setOnlyEligible] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch(`${import.meta.env.BASE_URL}report.json`)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json() as Promise<Report>;
      })
      .then((report) => {
        if (!cancelled) setState({ status: "ready", report });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setState({
          status: "error",
          message: error instanceof Error ? error.message : "unknown error",
        });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (state.status === "loading") {
    return (
      <main className="page">
        <p className="muted">Loading the report…</p>
      </main>
    );
  }

  if (state.status === "error") {
    return (
      <main className="page">
        <h1>Customer email preview</h1>
        <p className="notice notice--error">
          The report could not be loaded ({state.message}). Generate it with{" "}
          <code>npm run report</code> and reload this page.
        </p>
      </main>
    );
  }

  const { report } = state;
  const visible = onlyEligible
    ? report.contacts.filter((contact) => contact.status === "ELIGIBLE")
    : report.contacts;

  return (
    <main className="page">
      <h1>Customer email preview</h1>

      <p className="summary">
        <strong>{report.counts.eligible}</strong> of {report.counts.contacts}{" "}
        contacts are eligible for this campaign.
      </p>

      <label className="filter">
        <input
          type="checkbox"
          checked={onlyEligible}
          onChange={(event) => setOnlyEligible(event.target.checked)}
        />
        Show only eligible contacts
      </label>

      <section>
        <h2>Contacts ({visible.length})</h2>
        {visible.length === 0 ? (
          <p className="notice">
            No contact is eligible for this campaign. Every record was either
            opted out or could not be read.
          </p>
        ) : (
          <ul className="list">
            {visible.map((contact) => (
              <ContactCard key={contact.email} contact={contact} />
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2>Rejected records ({report.counts.rejectedRecords})</h2>
        {report.rejectedRecords.length === 0 ? (
          <p className="muted">Every record in the export could be read.</p>
        ) : (
          <ul className="list">
            {report.rejectedRecords.map((record) => (
              <RejectedCard key={record.recordId} record={record} />
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function ContactCard({ contact }: { contact: Contact }) {
  const eligible = contact.status === "ELIGIBLE";
  return (
    <li className="card">
      <div className="card__head">
        <span className="card__name">{contact.displayName || "(no name)"}</span>
        <span className={`badge ${eligible ? "badge--ok" : "badge--off"}`}>
          {eligible ? "Eligible" : "Excluded"}
        </span>
      </div>
      <p className="card__email">{contact.email}</p>
      {contact.explanation !== null && (
        <p className="card__why">{contact.explanation}</p>
      )}
      <p className="card__meta">From records: {contact.recordIds.join(", ")}</p>
    </li>
  );
}

function RejectedCard({ record }: { record: RejectedRecord }) {
  return (
    <li className="card">
      <div className="card__head">
        <span className="card__name">{record.name || "(no name)"}</span>
        <span className="badge badge--warn">{record.recordId}</span>
      </div>
      <p className="card__email">{record.email || "(empty email field)"}</p>
      <p className="card__why">{record.explanation}</p>
    </li>
  );
}
