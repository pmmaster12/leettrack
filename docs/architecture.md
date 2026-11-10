# Architecture

## Overview

LeetTrack is a serverless-first Chrome Extension using Manifest V3. The extension runs in Chrome and calls the Google Sheets API directly. There is no hosted Python, Node.js, or other application backend.

## Components

- **Content script:** Runs on LeetCode problem pages. Starts accepted-submission observation and mounts the manual capture control.
- **LeetCode adapter:** Extracts canonical problem URL, title, difficulty, and topic labels from the current page DOM.
- **Submission observer:** Detects Accepted submission results, extracts the submission ID from the submission URL, and guards against duplicate capture.
- **Remark modal:** Renders inside a Shadow DOM host to isolate its styles from LeetCode. Collects revision notes, topic edits, and the destination tab for a new problem.
- **Manual capture control:** Opens the same remark workflow without requiring a newly accepted submission.
- **Popup:** Stores spreadsheet settings, starts Google authorization, and offers manual synchronization.
- **Background service worker:** Handles messages, obtains a cached OAuth token through Chrome Identity, lists spreadsheet tabs, and reads/writes values through the Sheets API.

## Data flow

1. The content script detects an Accepted submission or the user activates manual capture.
2. The adapter provides problem metadata.
3. The modal loads the existing local record and spreadsheet tab names.
4. On save, the modal updates the local problem record and records the submission ID as processed.
5. The modal asks the background service worker to synchronize records.
6. The service worker groups records by their assigned tab and updates/appends rows by canonical problem URL.

## Local record model

A problem record is keyed by canonical problem URL and contains:

- `problemUrl`
- `title`
- `difficulty`
- `topics` (topic name and slug)
- `originalSolveDate`
- `remarks` (text, date, and submission ID per entry)
- `sheetName` (destination tab; optional for legacy records)

Records created before per-problem sheet assignment do not have `sheetName`; these are treated as belonging to the `LeetTrack` tab.

## Persistence and synchronization

- **Chrome local storage:** Stores problem records, extension settings, processed submission IDs, and the Google-connected UI indicator.
- **Google Sheets:** Receives the problem records in the user-selected spreadsheet and per-problem tab. It is the user's durable, externally accessible copy.
- **OAuth:** Chrome Identity obtains an access token. The extension does not write the token into its own local settings.
- **Tab discovery:** The background worker reads spreadsheet metadata to return the available tab names to the modal.
- **Row matching:** The canonical problem URL in the Problem URL column is the row key within each tab.

## Reliability considerations and limitations

- Manifest V3 service workers can be suspended. The implementation should not rely on long-lived in-memory state for persistence.
- A failed Sheets sync does not undo a successful local save; the user can initiate manual sync from the popup.
- Sync currently processes the local record set and is not a transactional or cross-device conflict-resolution system.
- Google Sheets API writes are sequential within a sync run, but simultaneous sync runs or edits from multiple browser profiles may still race.
- Existing records without a saved tab assignment route to the legacy `LeetTrack` tab.
- Existing problem assignments cannot currently be moved from one tab to another.
- LeetCode DOM selectors are subject to change and may need maintenance.

## Security boundaries

- The extension requests the Chrome `storage` and `identity` permissions.
- It communicates with the Google Sheets API host.
- OAuth is handled through Chrome Identity and the configured OAuth client.
- The Sheets scope allows read/write access to spreadsheets available to the authorized Google account. Use the narrowest practical scope if the implementation later supports it.
- Do not log OAuth tokens or spreadsheet contents in diagnostics.
