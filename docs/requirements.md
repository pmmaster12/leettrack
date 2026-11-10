# LeetTrack requirements

## Core workflow

1. Detect an Accepted LeetCode submission or allow manual tracking.
2. Extract canonical problem URL, title, exact displayed difficulty, and all displayed topic labels.
3. Show an inline remark modal. Topics are prefilled from LeetCode and can be added to or removed before saving.
4. Store one row per canonical problem URL in Google Sheets.
5. Append dated revision notes to the existing Remark cell; never overwrite previous notes.
6. Preserve the original solve date. Merge the current topic selection according to the user's explicit edits.

## Spreadsheet columns

`Problem | Difficulty | Remark | Date | Topics`

## Dashboard

Unique problem counts, difficulty distribution, revision counts, topic distribution, and recent activity.

## Non-goals for v1

No hosted backend, no LLM-generated notes, no automatic topic classification, and no multi-user synchronization.
