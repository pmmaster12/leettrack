# Setup & Documentation Guide

This guide covers building LeetTrack from source, configuring Google Sheets access, and understanding how capture and synchronization work.

## 1. Requirements

- Google Chrome with Manifest V3 support
- A Google account
- A Google spreadsheet you can edit
- Node.js and npm

## 2. Build and install locally

```bash
git clone https://github.com/pmmaster12/leettrack.git
cd leettrack/extension
npm install
npm run build
```

The build output is created in `extension/dist`.

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Select **Load unpacked** and choose `extension/dist`.
4. Open the LeetTrack toolbar popup.
5. Enter your Google Spreadsheet URL and default tab name, then save settings.
6. Connect your Google account and complete the Google authorization flow.
7. Open a LeetCode problem page and test automatic or manual capture.

After changing source code, rebuild and click **Reload** on the extension card.

## 3. Google Cloud and OAuth setup

LeetTrack uses Chrome Identity for Google authorization and the Google Sheets API for spreadsheet access.

For a development build:

1. Create or select a project in [Google Cloud Console](https://console.cloud.google.com/).
2. Enable **Google Sheets API**.
3. Configure the OAuth consent screen. If the app is in testing mode, add your Google account as a test user.
4. Create an OAuth client with application type **Chrome Extension**.
5. Use the extension ID shown on `chrome://extensions` for your unpacked extension.
6. Set the OAuth client ID in `extension/public/manifest.json`.
7. Build and load the extension, then authorize it from the popup.

The requested scope is:

```text
https://www.googleapis.com/auth/spreadsheets
```

This scope allows read/write access to spreadsheets available to the authorized Google account. Only authorize an account and spreadsheet you are comfortable using with LeetTrack.

### Development and production builds

Run commands from `extension/`.

| Command | Purpose |
| --- | --- |
| `npm run build` | Type-check and build with the development OAuth client |
| `npm run build:dev` | Explicit development build |
| `npm run build:prod` | Production build using the production OAuth client |
| `npm run typecheck` | Run TypeScript checks |
| `npm run dev` | Run Vite in watch mode |

For a production package, run `npm run build:prod`, then verify the generated `dist/manifest.json` contains the production OAuth client ID before packaging. The source manifest retains the development configuration. Public distribution may require Google OAuth verification for the Sheets scope.

## 4. Using LeetTrack

1. Open a LeetCode problem.
2. Solve it and submit. When LeetCode reports **Accepted**, LeetTrack opens the capture dialog.
3. To capture without a new Accepted submission, use the floating **Save to LeetTrack** control.
4. Add a remark about your approach, mistake, insight, complexity, or what to revise.
5. Review the extracted topics and edit them if needed.
6. For a new problem, choose an existing destination tab and save.

When you revisit a problem, a new dated remark is appended to its existing record. The original solve date and earlier remarks are retained.

## 5. Google Sheets structure

A blank destination tab is initialized with these columns:

| Column | Description |
| --- | --- |
| Problem | Problem title |
| Problem URL | Canonical LeetCode URL; used to identify the problem |
| Difficulty | Captured difficulty |
| Remark | Dated revision notes |
| Date | Original solve date |
| Topics | Aggregated topic labels |

Create destination tabs in Google Sheets before selecting them in LeetTrack. LeetTrack lists existing tabs; it does not create new tabs.

Each problem is assigned to a tab when first saved. Revisions remain in that tab. Changing the popup's default tab affects new problems only. Older records without an assignment default to the `LeetTrack` tab.

## 6. Architecture overview

LeetTrack is a Manifest V3 Chrome extension built with TypeScript, React, and Vite. It has no hosted application backend.

- **Content scripts:** Run on LeetCode problem pages and coordinate capture.
- **LeetCode adapter:** Extracts the current problem title, URL, difficulty, and available topics.
- **Submission observer:** Detects Accepted results and identifies submissions for duplicate protection.
- **Capture dialog:** Runs inside a Shadow DOM host to isolate its UI from LeetCode styles; collects remarks, topic edits, and destination tab.
- **Popup:** Stores spreadsheet settings, starts Google authorization, and offers manual synchronization.
- **Background service worker:** Handles extension messages, Chrome Identity token access, spreadsheet tab discovery, and Google Sheets API reads and writes.

## 7. Permissions and data handling

- **`storage`:** Stores problem records, revision notes, settings, and processed-submission markers in Chrome local extension storage.
- **`identity`:** Obtains Google authorization through Chrome's identity flow.
- **Google Sheets API host access:** Reads spreadsheet metadata and reads/writes values in the configured spreadsheet.

Problem records are saved locally before a sync is attempted. A failed sync does not undo a local save; use manual sync from the popup to retry. The OAuth access token is handled through Chrome Identity and is not stored in LeetTrack's own settings.

See the [Privacy Policy](privacy-policy.md) for data handling, retention, and sharing details.

## 8. Current limitations

- Records sync from Chrome local storage to Google Sheets; they are not imported from a spreadsheet into a new browser profile.
- Changes made directly in Google Sheets are not synced back into LeetTrack.
- Existing problem tab assignments cannot currently be moved.
- A destination tab must already exist.
- Sync is not a transactional, cross-device conflict-resolution system. Concurrent edits or syncs from multiple browser profiles can conflict.
- LeetCode may change its page structure, which can affect metadata extraction or submission detection.

## 9. Troubleshooting

**The spreadsheet tab list is empty**
- Check that the spreadsheet URL is saved and the connected Google account can access it.
- Confirm Google Sheets API is enabled in the Cloud project.
- Reconnect Google and reload the extension.

**Sync reports that a tab does not exist**
- Create the tab in Google Sheets, then reopen the capture dialog to refresh the list.

**A tab reports invalid headers**
- Use a blank tab, or make sure its first six columns match the schema above.

**Automatic capture does not appear**
- Confirm the submission result is Accepted on a LeetCode problem submission page.
- Use the manual **Save to LeetTrack** control as a fallback.

## 10. Support

Report bugs or request features through [GitHub Issues](https://github.com/pmmaster12/leettrack/issues). Include reproduction steps, Chrome version, and relevant console errors. Never include OAuth tokens, private spreadsheet contents, or personal revision notes.
