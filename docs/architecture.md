# Architecture

LeetTrack is a serverless-first Chrome Manifest V3 extension. It runs in the browser and calls Google Sheets directly using an OAuth token obtained through Chrome Identity. Google Sheets is the persistent source of truth.

- **Content script:** observes LeetCode pages and extracts page metadata. LeetCode-specific selectors stay isolated in an adapter.
- **React UI:** inline Shadow DOM modal, toolbar popup, dashboard, and settings.
- **Background service worker:** message orchestration, authentication, and API coordination. It must tolerate suspension and must not rely on in-memory queues.
- **Services:** problem, revision, topic, analytics, and Sheets logic.
- **Repository:** encapsulates Sheets reads/writes and duplicate detection.
- **Local storage:** settings, deduplication hints, and pending operations only; not the source of truth for problem history.

No always-on Python or Node backend is required. Optional Python scripts may support development and validation only.
