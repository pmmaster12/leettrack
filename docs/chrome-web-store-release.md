# Chrome Web Store release checklist

This checklist is for the first public release. The repository currently contains a development OAuth client, so do not submit the current build as a public production release until the production OAuth setup is complete.

## 1. Code and build

- [ ] Confirm the intended release version in both `extension/package.json` and `extension/public/manifest.json`.
- [ ] Run `npm ci` from `extension/`.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm run build`.
- [ ] Load `extension/dist` as an unpacked extension in a clean Chrome profile.
- [ ] Test automatic Accepted capture, manual capture, duplicate protection, remark revisions, topic merging, and per-problem tab assignment.
- [ ] Test an empty destination tab and a tab containing existing LeetTrack rows.
- [ ] Confirm local save remains available when Google Sheets sync fails.
- [ ] Inspect the built `dist/manifest.json`; do not package development-only credentials.

## 2. Production Google OAuth

- [ ] Publish/prepare the Chrome Web Store listing and obtain the final extension ID.
- [ ] Create a separate Google OAuth client of type **Chrome Extension** using that final extension ID.
- [ ] Update the OAuth client ID in the production manifest source.
- [ ] Configure the OAuth consent screen, app name, support email, developer contact information, and privacy policy.
- [ ] Add required test users while the consent screen is in testing mode.
- [ ] Determine and complete Google's verification requirements for the requested Sheets scope before broad public availability.
- [ ] Test sign-in and spreadsheet access using the production OAuth client and a clean Chrome profile.

## 3. Privacy and store listing

- [ ] Host the privacy policy at a stable public URL and use that URL in the Web Store listing.
- [ ] Ensure the privacy policy and Chrome Web Store privacy disclosures accurately describe local storage, Google Sheets sync, and OAuth access.
- [ ] Provide a clear single-purpose description: capturing LeetCode problem revision notes into a user-selected Google spreadsheet.
- [ ] Prepare a concise description, detailed description, category, support contact, and screenshots.
- [ ] Prepare store artwork and screenshots that show the real extension UI. Do not use mock functionality.
- [ ] Confirm the extension name and branding do not imply affiliation with LeetCode.

## 4. Package

- [ ] Build from a clean checkout using the production OAuth configuration.
- [ ] Zip the contents of `extension/dist` (the files inside the folder, not the parent repository).
- [ ] Confirm the ZIP contains `manifest.json`, `index.html`, and generated assets at the archive root.
- [ ] Do not include `node_modules`, source maps unless intentionally required, local credentials, development notes, or unrelated repository files.
- [ ] Keep the exact submitted ZIP and release commit for reproducibility.

## 5. Submit and maintain

- [ ] Complete the Chrome Web Store developer account registration and any required identity/payment steps.
- [ ] Complete the store's privacy, data-use, permission, and single-purpose declarations truthfully.
- [ ] Submit the package for review.
- [ ] Address reviewer feedback and re-test any changed build.
- [ ] Tag the approved source commit and publish release notes.
- [ ] Monitor user feedback and compatibility with LeetCode DOM changes.

## Release blockers for the current development build

1. The manifest currently points to a development OAuth client. Replace it with the production client tied to the final Web Store extension ID.
2. The privacy policy must be hosted at a stable public URL before it can be entered in the store listing.
3. The repository does not yet include store screenshots or finalized listing artwork.
4. Public availability may require Google OAuth verification for the Sheets scope. Confirm the current requirement with Google before release.
