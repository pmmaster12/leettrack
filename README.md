# LeetTrack — DSA Revision Tracker

**A Chrome extension that turns accepted LeetCode submissions into a personal, searchable revision log in Google Sheets.**

LeetCode already shows which problems you have solved. What it does not capture is *why you struggled, what you learned, what you would do differently, and what you need to remember when you revisit a problem.*

That is the problem LeetTrack solves.

When a submission is accepted, LeetTrack detects the result and opens a small note-taking dialog. Record your approach, mistake, key insight, or follow-up task. LeetTrack keeps those notes with the problem, appends a dated entry when you revisit it, and syncs the record to a Google Sheets tab you choose. You can also capture a problem manually without submitting a solution.

LeetTrack is designed to complement LeetCode, not replace its progress statistics or problem-solving interface.

## At a glance

- **Capture:** Automatically detect newly Accepted submissions or save a problem manually.
- **Remember:** Keep dated revision notes attached to one problem record.
- **Organize:** Capture difficulty and topics, edit topic labels, and assign each new problem to an existing spreadsheet tab.
- **Own your data:** Save locally in Chrome and sync directly to your Google Sheet.
- **No LeetTrack server:** No hosted application backend or LeetTrack account is required.

## How it works

1. Open a problem on [LeetCode](https://leetcode.com/) and solve it.
2. After an Accepted submission, LeetTrack detects the submission and opens its note dialog. Alternatively, use the **Save to LeetTrack** button on a problem page.
3. Add a note about your approach, mistake, insight, complexity, or what to review later.
4. Review or edit the extracted topics and choose a destination tab for a new problem.
5. Save. The record is stored in Chrome and a sync to your configured Google Sheet is attempted.
6. When you revisit the same problem and submit again, LeetTrack appends a dated revision note to that problem's existing record. It does not create a second problem row.

## What gets recorded

Each problem is represented by one record, identified by its canonical LeetCode problem URL.

| Field | What it contains |
| --- | --- |
| Problem | Problem title |
| Problem URL | Canonical LeetCode URL; used to match the problem row |
| Difficulty | Captured difficulty, when available |
| Remark | Dated revision notes, appended over time |
| Date | Original solve date |
| Topics | Aggregated topic labels |

A blank destination tab is initialized with these six column headers on its first sync. The destination tab must already exist in the spreadsheet.

### Revision and organization rules

- Each accepted submission ID is processed at most once, preventing the same submission from creating duplicate notes.
- Later notes are appended; earlier notes and the original solve date are preserved.
- Topic labels are merged across revisions by topic slug.
- A new problem can be assigned to any existing tab listed in the configured spreadsheet.
- Once assigned, a problem's revisions remain in that tab. Moving an existing problem to another tab is not currently supported.
- Older records without a saved tab assignment use the `LeetTrack` tab.

## Setup

### What you need

- Google Chrome with Manifest V3 support
- A Google account
- A Google spreadsheet that you own or have permission to edit
- Node.js and npm (only if building from source)

### Install from the Chrome Web Store

The public listing is currently **pending review**. Once approved and published, this section will link to the store listing.

### Build and load from source

Clone the repository and build the extension:

```bash
git clone https://github.com/pmmaster12/leettrack.git
cd leettrack/extension
npm install
npm run build
```

The unpacked extension is generated in `extension/dist`.

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Select **Load unpacked** and choose the `extension/dist` directory.
4. Open the LeetTrack toolbar popup.
5. Enter the URL of your Google spreadsheet and the default tab name, then save the settings.
6. Select **Connect Google account** and complete Google's authorization flow.
7. Open a LeetCode problem page and try automatic or manual capture.

After changing source files, rebuild and click **Reload** on the extension card.

### Google Cloud and OAuth configuration

LeetTrack uses Chrome Identity for Google authorization and the Google Sheets API for spreadsheet access. To build and run your own development copy:

1. Create or select a project in [Google Cloud Console](https://console.cloud.google.com/).
2. Enable the **Google Sheets API**.
3. Configure the OAuth consent screen. During development, add your Google account as a test user if the consent screen is in testing mode.
4. Create an OAuth client with application type **Chrome Extension** and use the ID of your unpacked extension from `chrome://extensions`.
5. Set that client ID in `extension/public/manifest.json` for your local development build.
6. Build the extension and authorize it through the popup.

The repository's source manifest is configured for the maintainer's development OAuth client. The production build command applies the production OAuth client to the generated package; do not replace your local development client with a Web Store ID.

**Production packaging:** use `npm run build:prod`, not `npm run build`. The production command type-checks, builds, and writes the production OAuth client ID into `dist/manifest.json`. Verify the generated manifest before packaging. Public distribution may require Google OAuth verification for the requested Sheets scope.

## Development

Run commands from `extension/`.

| Command | Purpose |
| --- | --- |
| `npm install` | Install dependencies |
| `npm run build` | Type-check and build with the development OAuth client |
| `npm run build:dev` | Explicit development build |
| `npm run build:prod` | Production build with the production OAuth client |
| `npm run typecheck` | Run TypeScript checks |
| `npm run dev` | Run Vite in watch mode |

### Architecture

LeetTrack is a Manifest V3 browser extension built with TypeScript, React, and Vite.

- **Content scripts** run on LeetCode problem pages and coordinate capture.
- **LeetCode adapter** reads the current problem title, canonical URL, difficulty, and available topics from the page.
- **Submission observer** detects Accepted results and identifies submissions for duplicate protection.
- **Capture dialog** runs inside a Shadow DOM host to isolate its UI from LeetCode's page styles. It collects remarks, topic edits, and a destination tab for new problems.
- **Popup** stores spreadsheet settings, starts Google authorization, and offers manual synchronization.
- **Background service worker** handles extension messages, Chrome Identity token access, spreadsheet tab discovery, and Google Sheets API reads and writes.

There is no hosted LeetTrack application server or database. The extension communicates with Google Sheets directly.

## Data, permissions, and privacy

LeetTrack requests these Chrome permissions:

- **`storage`:** stores problem records, revision notes, settings, and processed-submission markers in Chrome local extension storage.
- **`identity`:** obtains Google authorization through Chrome's identity flow.
- **Google Sheets API host access:** reads spreadsheet metadata and reads/writes values in the configured spreadsheet.

The extension extracts problem-page information from Leetcode pages where it runs. Records are stored locally first and are sent to Google Sheets when synchronization is triggered. The extension does not ask for your LeetCode password and does not operate a hosted application backend. The OAuth access token is handled through Chrome Identity and is not stored in LeetTrack's own settings.

The requested Sheets scope is `https://www.googleapis.com/auth/spreadsheets`. It grants read/write access to spreadsheets available to the authorized Google account. Only connect an account and spreadsheet you are comfortable using with the extension.

Read the [Privacy Policy](docs/privacy-policy.md) for details about data handling, retention, and sharing.

## Current limitations

- Local Chrome storage is the source used by the extension during capture. Records are synced outward to Google Sheets; records are not imported from a spreadsheet into a new browser profile.
- Changes made directly in Google Sheets are not synchronized back into LeetTrack's local records.
- A problem's spreadsheet tab assignment is fixed after its first save; moving it is not supported.
- A destination tab must already exist. LeetTrack adds headers to a blank tab but does not create tabs.
- A failed sync does not undo a local save. Use manual sync from the popup to retry.
- Sync is not a transactional, cross-device conflict-resolution system. Simultaneous edits or syncs from multiple browser profiles can conflict.
- LeetCode may change its page structure, which can affect metadata extraction or submission detection.

## Troubleshooting

**The spreadsheet tab list is empty or fails to load**
- Check that the spreadsheet URL is saved and that the connected Google account can access it.
- Confirm the Google Sheets API is enabled in the OAuth project's Google Cloud configuration.
- Reconnect Google and reload the extension.

**Sync reports that a tab does not exist**
- Create the tab in Google Sheets first, then reopen the capture dialog to refresh the tab list.

**A tab reports invalid headers**
- Use a blank tab, or ensure its first six columns match the schema documented above.

**A problem is saved to an unexpected tab**
- Revisions use the tab assignment saved with the problem. Older records without an assignment default to `LeetTrack`.

**Automatic capture does not appear**
- Confirm the submission result is Accepted on a LeetCode problem submission page.
- Use the manual **Save to LeetTrack** control as a fallback.

## Support and contributions

Found a bug or have a feature request? [Open a GitHub issue](https://github.com/pmmaster12/leettrack/issues). When reporting a problem, include reproduction steps, Chrome version, and relevant console errors. Do not include OAuth tokens, private spreadsheet contents, or personal revision notes.

Pull requests are welcome. Please discuss larger changes in an issue first.

## License

No license has been added yet. Until a license is published in this repository, the code is not granted an open-source reuse license; all rights are reserved by the repository owner.
