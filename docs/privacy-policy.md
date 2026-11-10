# LeetTrack Privacy Policy

**Last updated:** 10 November 2026

LeetTrack is a Chrome extension that helps users save LeetCode problem metadata and personal revision notes to a Google spreadsheet they configure.

## Information handled by the extension

When you use LeetTrack, it may process and store:

- LeetCode problem title, canonical problem URL, difficulty, and topic labels.
- Revision remarks you enter, along with their dates and submission identifiers.
- Your selected spreadsheet destination and tab name.
- Local duplicate-submission markers and extension settings.

LeetTrack does not ask for or collect your LeetCode password.

## Where information is stored

Problem records and extension settings are stored in Chrome's local extension storage on your browser. When synchronization is triggered, LeetTrack sends the relevant problem records to the Google spreadsheet and tab you selected, using the Google Sheets API.

LeetTrack does not operate its own hosted application server or database. The extension does not sell personal information or use it for advertising.

## Google account access

LeetTrack uses Chrome's Identity API to obtain authorization for the Google Sheets API. The current implementation requests the `https://www.googleapis.com/auth/spreadsheets` scope, which permits reading and writing spreadsheets accessible to the authorized Google account. Google handles the sign-in and consent flow. LeetTrack does not store the OAuth access token in its own local settings.

You can disconnect or revoke the extension's Google access through your Google Account security settings. You can also remove locally stored extension data by removing the extension or clearing its storage through Chrome.

## Sharing

LeetTrack does not independently share your revision notes with other users. Information synced to Google Sheets is subject to the sharing settings and access permissions you configure for that spreadsheet. Anyone you grant access to that spreadsheet may be able to see its contents.

## Data retention and deletion

Local records remain in Chrome extension storage until you clear the extension's data or remove the extension. Synced records remain in your Google spreadsheet until you delete them there. Removing the extension does not automatically delete spreadsheet data.



## Chrome Web Store User Data Policy — Limited Use

LeetTrack's use and transfer of information received from Google APIs will adhere to the Chrome Web Store User Data Policy, including the Limited Use requirements. Google OAuth access is used only to read spreadsheet tab names and synchronize the problem records that you choose to save to your selected spreadsheet. LeetTrack does not use Google API data for advertising, creditworthiness, lending, or unrelated purposes.

LeetTrack accesses only LeetCode problem pages to support its problem-capture feature. It processes the current problem URL and relevant problem-page details, and detects Accepted submission events so it can offer to save a problem. This browsing information is used only for the revision-tracking functionality described in the Chrome Web Store listing. It is not collected to build a general browsing history or used for unrelated purposes.

Revision remarks and settings are user-provided content. They remain in Chrome local extension storage unless you choose to sync them to your Google spreadsheet. Google receives synced records as necessary to provide the spreadsheet synchronization feature.

## Changes to this policy

This policy may be updated as the extension changes. The latest version will be published with the LeetTrack source repository.

## Contact

For privacy questions or requests, contact the repository maintainer through the GitHub repository:

https://github.com/pmmaster12/leettrack
