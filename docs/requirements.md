# Product requirements

## Product goal

LeetTrack is a focused revision-note companion for LeetCode. It captures problems and personal learning notes, then stores them in Google Sheets. It intentionally does not duplicate LeetCode's progress dashboard.

## Core workflows

1. Detect a newly Accepted LeetCode submission on its submission page.
2. Provide a manual capture action on LeetCode problem pages.
3. Extract the canonical problem URL, title, displayed difficulty, and available topic labels.
4. Open an inline remark dialog for the user to record what they learned, missed, or want to remember.
5. Allow topics to be edited before saving.
6. Allow the user to select an existing Google Sheets tab for a new problem.
7. Save one record per canonical problem URL in Chrome local storage and sync it to the assigned spreadsheet tab.
8. On later accepted submissions for that problem, append a dated remark to the existing record and update its existing row in the same tab.
9. Preserve the original solve date and retain prior remarks.
10. Prevent the same LeetCode submission ID from being captured more than once.

## Google Sheets schema

A blank destination tab is initialized with these six columns:

| Column | Meaning |
| --- | --- |
| Problem | Problem title |
| Problem URL | Canonical URL and unique key |
| Difficulty | Captured difficulty |
| Remark | Dated revision notes |
| Date | Original solve date |
| Topics | Aggregated topic labels |

## Sheet assignment rules

- The popup's configured sheet name is the default destination for new problems.
- The remark dialog lists the existing tabs in the configured spreadsheet.
- A new problem is assigned to the selected tab when it is first saved.
- Revisions remain in the originally assigned tab.
- Existing records created before sheet assignment was implemented default to the `LeetTrack` tab.
- Changing the popup's default sheet affects new problems, not existing assignments.
- Moving an existing problem between tabs is not currently supported.
- A destination tab must already exist. LeetTrack can initialize its headers when the tab is blank.

## Data and synchronization

- Chrome local storage is the local record store and supports capture when a Sheets sync fails.
- Google Sheets is the external persistence destination.
- A save triggers a sync attempt; the popup also provides a manual sync action.
- Sync updates an existing row by canonical problem URL within the assigned tab, or appends a row when no matching URL is found.
- Topic labels are merged across revisions by topic slug.
- The extension does not currently import records from Google Sheets into local storage or synchronize changes made manually in Sheets back into the extension.

## Non-goals

- Dashboard or analytics UI.
- Hosted backend or database.
- AI-generated remarks or automatic topic classification.
- Multi-user collaboration.
- Automatic migration of existing problem assignments between tabs.
- Spaced-repetition scheduling.

## Release acceptance checklist

- [ ] Production build and TypeScript checks pass.
- [ ] Automatic accepted-submission capture works.
- [ ] Manual capture works.
- [ ] Duplicate submission IDs are ignored.
- [ ] New problems can be assigned to different existing tabs.
- [ ] Revisions update only the problem's assigned tab.
- [ ] Original solve date and previous remarks are preserved.
- [ ] Topic tags merge without duplicates.
- [ ] Blank tabs receive the expected headers.
- [ ] Sync failure leaves the local record available for manual retry.
