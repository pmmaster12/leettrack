# LeetTrack

**A lightweight Chrome extension for capturing LeetCode solutions and building a personal DSA revision log in Google Sheets.**

LeetTrack detects accepted submissions, lets you record what you learned, and keeps revision notes attached to each problem. You can also capture a problem manually and choose which Google Sheets tab should store it.

> **Release status:** Feature-complete beta. The development build has been tested locally. A production Google OAuth client and Chrome Web Store review are still required before public release.

## Features

- **Automatic capture:** Detects an Accepted submission on a LeetCode problem submission page.
- **Manual capture:** Use the floating **Save to LeetTrack** control on a problem page.
- **Revision history:** Keep one record per problem and append dated notes for later attempts.
- **Problem metadata:** Capture the problem title, canonical URL, difficulty, and LeetCode topics.
- **Editable topics:** Add or remove topic tags before saving. Tags are merged into the problem's topic history.
- **Per-problem sheet assignment:** Choose an existing Google Sheets tab when saving a new problem. Revisions stay in the problem's assigned tab.
- **Duplicate protection:** Reopening the same submission does not create another revision.
- **Local-first capture:** Notes are saved in Chrome local storage before Google Sheets sync is attempted.
- **No hosted backend:** The extension communicates directly with Google Sheets using Chrome Identity and the Sheets API.

## How it works

1. Solve a problem on [LeetCode](https://leetcode.com/).
2. After an Accepted submission, LeetTrack opens an inline remark dialog. Or use **Save to LeetTrack** to capture a problem manually.
3. Add your learning, mistake, or revision note.
4. Select the destination tab in **Save to sheet**.
5. Save. LeetTrack stores the record locally and syncs it to the selected Google Sheets tab.
6. When you solve the same problem again, the new dated remark is appended to the existing row in that tab.

Each problem is assigned to one sheet tab when it is first saved. Revisions keep that assignment. Existing records created before per-problem assignment are treated as belonging to the `LeetTrack` tab.

## Google Sheets format

LeetTrack creates the following header row in a blank destination tab:

| Column | Description |
| --- | --- |
| Problem | Problem title |
| Problem URL | Canonical LeetCode problem URL; used as the unique key |
| Difficulty | Easy, Medium, Hard, or the available page value |
| Remark | Dated revision notes, appended over time |
| Date | Original solve date |
| Topics | Comma-separated topic labels |

Create the spreadsheet tabs you want to use before saving problems. The tab dropdown is populated from the spreadsheet's existing tabs. A blank tab is initialized with the expected headers on its first sync.

## Installation

### Requirements

- Google Chrome (Manifest V3 support)
- A Google account
- A Google spreadsheet you can edit
- Node.js and npm (for building from source)

### Configure Google Cloud for a development build

LeetTrack uses Google OAuth through the Chrome Identity API and the Google Sheets API.

1. Create or select a project in [Google Cloud Console](https://console.cloud.google.com/).
2. Enable **Google Sheets API**.
3. Configure the OAuth consent screen. During development, use the appropriate testing audience and add your Google account as a test user.
4. Create an OAuth client of type **Chrome Extension**.
5. Use the extension ID shown on `chrome://extensions` for your unpacked extension.
6. Set the OAuth client ID and Sheets scope in `extension/public/manifest.json`:
   - Scope: `https://www.googleapis.com/auth/spreadsheets`
7. Build and load the extension, then connect your Google account in the LeetTrack popup.

The OAuth client ID currently in the repository is for the maintainer's development setup. **Do not use that development OAuth client for a public Chrome Web Store release.** A production OAuth client must be configured for the final Web Store extension ID, and Google OAuth verification may be required for public use of the Sheets scope.

### Build from source

```bash
git clone https://github.com/pmmaster12/leettrack.git
cd leettrack/extension
npm install
npm run build
```

The unpacked extension is generated in `extension/dist`.

### Load the unpacked extension

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select the repository's `extension/dist` directory.
5. Open the LeetTrack toolbar popup.
6. Enter your Google spreadsheet URL and the default tab name.
7. Click **Save settings**, connect your Google account, and authorize access.
8. Open a LeetCode problem page and test capture.

After changing source files, run `npm run build` again and click **Reload** on the extension card.

## Development commands

Run these commands from `extension/`:

| Command | Purpose |
| --- | --- |
| `npm install` | Install dependencies |
| `npm run build` | Type-check and create the production build |
| `npm run typecheck` | Run TypeScript checks |
| `npm run dev` | Run Vite in watch mode |

## Permissions and data

LeetTrack requests the following Chrome permissions:

- `storage`: save problem records, revision notes, settings, and duplicate-submission markers locally.
- `identity`: obtain a Google OAuth access token so the extension can access the spreadsheet.
- Google Sheets API host access: communicate with `sheets.googleapis.com`.

The extension stores captured problem records and notes in Chrome's local extension storage, then writes them to the Google spreadsheet you configure. Google authorization is handled by Chrome Identity; the extension does not store the OAuth access token in its own settings. LeetTrack does not require a LeetCode password, a hosted application server, or an API key entered by the user.

Only connect a spreadsheet you own or are authorized to edit. Review the [privacy policy](docs/privacy-policy.md) before installing or publishing.

## Known limitations

- Problem records are stored locally in the browser and synced outward to Google Sheets. LeetTrack does not currently import spreadsheet records back into a new browser profile.
- A problem's sheet assignment is fixed after its first save. Moving an existing problem between tabs is not currently supported.
- Existing records created before this feature default to the `LeetTrack` tab.
- Google Sheets is not a transactional database. Concurrent edits from multiple browser profiles may cause conflicts.
- LeetCode may change its page structure, which can affect metadata extraction or accepted-submission detection.
- The public release requires a production OAuth configuration; the development OAuth client in this repository is not intended for public distribution.

## Troubleshooting

**The sheet dropdown is empty or does not load**
- Confirm the spreadsheet URL is saved in the popup.
- Confirm the Google account is connected and has access to the spreadsheet.
- Confirm the Google Sheets API is enabled in the Cloud project.
- Reconnect your Google account and reload the extension.

**A sync reports that a tab does not exist**
- Create the tab in Google Sheets first.
- Refresh/reopen the remark dialog so the dropdown fetches the current tab list.

**A tab reports an invalid header**
- Use a blank tab, or make sure its first six columns match the header row documented above.

**A problem appears in the wrong tab**
- Revisions use the sheet assignment saved with the problem. Existing records created before this feature default to `LeetTrack`.

**The extension does not detect an accepted submission**
- Confirm you are on a LeetCode problem submission page and that the submission result is Accepted.
- Try the manual **Save to LeetTrack** control as a fallback.

## Contributing

Issues and pull requests are welcome. Please include reproduction steps, browser version, and relevant console errors when reporting a bug. Do not include OAuth access tokens, private spreadsheet contents, or personal revision notes in issue reports.

## License

No license has been added yet. Until a license file is included, all rights are reserved by the repository owner; do not assume the code is available for reuse under an open-source license.
