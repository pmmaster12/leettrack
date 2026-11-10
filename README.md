# LeetTrack

A Chrome extension for tracking LeetCode problems, preserving revision notes, and viewing DSA progress in Google Sheets.

> Current milestone: **M1 — project foundation**. Accepted-submission detection, Google authentication, Sheets integration, revision history, and analytics are planned for later milestones.

## Tech stack

- Chrome Extension Manifest V3
- TypeScript
- React
- Vite
- Tailwind CSS (to be introduced with the UI milestone)
- Google Sheets API (planned)

## Repository layout

```text
leettrack/
├── extension/       # Chrome extension application
├── scripts/         # Optional Python development utilities
├── tests/           # Project-level test assets
├── docs/            # Architecture and setup documentation
└── .github/         # GitHub workflows
```

## Prerequisites

- Node.js 20 or newer
- npm
- Google Chrome or Chromium

Python is not required to run the extension. Optional Python utilities may be added for development tasks; there is no hosted backend.

## Install dependencies

```bash
cd extension
npm install
```

## Development build

```bash
npm run dev
```

Vite watches the source and writes an unpacked extension build to `extension/dist`.

## Production build

```bash
npm run build
```

## Load in Chrome

1. Run `npm run build` from `extension/`.
2. Open `chrome://extensions`.
3. Enable **Developer mode**.
4. Select **Load unpacked**.
5. Choose `leettrack/extension/dist`.
6. Open a LeetCode problem page and inspect the extension popup.

After changing source files, rebuild and click **Reload** on the extension card in `chrome://extensions`.

## M1 verification checklist

- [ ] Vite production build completes.
- [ ] `dist/manifest.json` exists.
- [ ] Extension loads without manifest errors.
- [ ] Popup opens from the toolbar.
- [ ] Content script runs on LeetCode problem pages.
- [ ] Content script and service worker exchange a ping/pong message.

## Product requirements

See [`docs/requirements.md`](docs/requirements.md) and [`docs/architecture.md`](docs/architecture.md).
