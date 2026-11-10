import { useEffect, useState } from 'react';

export default function App() {
  const [connection, setConnection] = useState<'checking' | 'connected' | 'not-on-leetcode'>('checking');

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (!activeTab?.url?.startsWith('https://leetcode.com/problems/')) {
        setConnection('not-on-leetcode');
        return;
      }

      // The popup is intentionally informational in M1. Content-script
      // detection and the full manual tracking flow are implemented later.
      setConnection('connected');
    });
  }, []);

  return (
    <main className="app-shell">
      <header className="header">
        <div className="brand-mark">L</div>
        <div>
          <h1>LeetTrack</h1>
          <p className="subtitle">Your DSA revision companion</p>
        </div>
      </header>

      <section className="status-card">
        <span className={`status-dot ${connection === 'connected' ? 'is-ready' : ''}`} />
        <div>
          <strong>
            {connection === 'checking' && 'Checking current tab…'}
            {connection === 'connected' && 'LeetCode problem page detected'}
            {connection === 'not-on-leetcode' && 'Open a LeetCode problem'}
          </strong>
          <p>
            {connection === 'connected'
              ? 'LeetTrack is running. Problem tracking arrives in the next milestone.'
              : 'Navigate to leetcode.com/problems/... to use LeetTrack.'}
          </p>
        </div>
      </section>

      <section className="next-card">
        <p className="eyebrow">MILESTONE 1</p>
        <h2>Extension foundation</h2>
        <p>Chrome integration is ready for the next steps: problem extraction, Accepted detection, and your revision modal.</p>
      </section>

      <footer>Local-first · Google Sheets sync planned</footer>
    </main>
  );
}
