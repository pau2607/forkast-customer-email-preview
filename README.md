# forkast-customer-email-preview

Which customers of one restaurant are eligible for an email campaign, and
why the other records are not.

- **Live demo:** https://pau2607.github.io/forkast-customer-email-preview/
- **Baseline commit (end of Stage 1):** https://github.com/pau2607/forkast-customer-email-preview/commit/bb047b75f628a8362f79294de351f2ca598ecc1b

## Result on the supplied fixture

|                  |                                                  |
| ---------------- | ------------------------------------------------ |
| Contacts         | 4                                                |
| Eligible         | 1 — Ana                                          |
| Excluded         | 3 — Luis (suppressed), Marta and Sol (opted out) |
| Rejected records | 2 — c6 invalid email format, c7 missing email    |

## Running it

```bash
npm install
npm run report      # reads data/customers.csv, writes public/report.json
npm run dev         # the screen, at /forkast-customer-email-preview/
npm test            # 40 tests
npm run typecheck
npm run build
```

## How it is put together

- `src/core` — pure functions: normalize, validate, group, evaluate,
  suppress. No file access, no React.
- `src/cli/generate-report.ts` — the only file that touches the disk.
- `src/ui` — one screen that reads `report.json` and renders it. It makes no
  eligibility decisions.

Adding records to `data/customers.csv` requires no code change.

## Decisions

**Display name.** When one contact has several names, the longest wins and
ties are broken alphabetically, so `Ana` and `Ana A` display as `Ana A`. It
is deterministic, so reordering the export cannot change what is shown, and
it keeps the most complete name. The trade-off is that a long junk value
would beat a clean short one. Taking the first record's name would be
simpler but would depend on input order.

**Preference values.** A record is accepted only when its preference field
reads exactly `true` or `false`, ignoring surrounding whitespace. `TRUE`,
`yes` and `1` become rejected rows. Whitespace is tolerated deliberately: a
padded `false` is still an opt-out, and rejecting it would drop that
opt-out from the contact's records and could flip the contact to eligible.

**Suppression precedence.** A contact that is both opted out and on the
suppression list is reported as `SUPPRESSED`, because that is the rule the
campaign owner controls and can act on.

**Rejected rows never become contacts.** They leave the pipeline at
validation and are reported separately, so they cannot inflate the contact
count.

## Visual design

Palette and typography follow forkast.me: Anton for headings and the
eligible count, Inter for body text, and the site's teal (`#1B4C53`) and
mint (`#53B2AC`). Dark mode reuses the site's deep teal. Status is always
text, never colour alone, and the layout holds at 390 px with no horizontal
scrolling. Added in #3, after the exercise itself: presentation only, no
change to the processing module or the report format.

## One contact's path

`ana@example.com`, from the file to the screen:

1. `data/customers.csv` holds two rows for her: `c1` with
   `" ana@example.com "` and `c2` with `ANA@EXAMPLE.COM`.
2. `parseCsv` splits both rows and keeps the padding exactly as written.
3. `normalizeEmail` trims and lowercases both to `ana@example.com`.
4. `validateRecord` accepts both: the address matches the pattern and the
   preference is the exact string `true`.
5. `buildReport` groups them under that one key, so they are one contact.
6. `evaluateContact` finds no record with `optIn=false`, marks her eligible,
   and picks `Ana A` as the display name.
7. `applySuppression` finds no match in `data/suppression.json`, so nothing
   changes.
8. The CLI writes her into `public/report.json`.
9. The screen fetches that file and shows
   **Ana A — ana@example.com — Eligible — From records: c1, c2**.

## The test example I added

In `tests/validate.test.ts`, a record whose preference is `TRUE` in uppercase
is rejected. It catches a loose boolean conversion: in JavaScript
`Boolean('false')` is `true`, and `optIn !== 'false'` treats any unreadable
value as consent. Either mistake would silently email someone whose
preference could not be read. The test forces the row to surface as a
rejected record instead.

## Time spent

About 6 hours across two sessions. Most of it went into learning the stack
rather than the problem itself — see the note below.

## Not done

- The CSV reader does not support escaped quotes (`""`) or newlines inside a
  field. The supplied export needs neither.
- No pagination or search; a few thousand contacts would need both.
- The screen itself has no automated tests. The logic is covered; the
  rendering was checked by hand at desktop width and at 390 px.

## AI use

I used Claude throughout: to unpack the brief, to plan the pipeline, and as a
tutor while writing the code — this was my first project in React and
TypeScript. I wrote every file myself and asked for the reasoning behind each
decision rather than for a finished repository.

I checked its output instead of trusting it. The expected counts for both
stages are pinned down by tests, including order-independence and
repeated-row independence, and verified against `npm run report`. I also
posted the Stage 2 prediction in issue #1 **before** implementing it, so the
expected result was on record before the code existed.
