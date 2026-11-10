import { useEffect, useState } from 'react';

const SETTINGS_KEY = 'leettrack.settings';
const CONNECTION_KEY = 'leettrack.googleConnected';

interface Settings {
  spreadsheetUrl: string;
  sheetName: string;
}

const DEFAULT_SETTINGS: Settings = {
  spreadsheetUrl: '',
  sheetName: 'LeetTrack',
};

export default function App() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [connection, setConnection] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    chrome.storage.local.get([SETTINGS_KEY, CONNECTION_KEY], (stored) => {
      setSettings({ ...DEFAULT_SETTINGS, ...(stored[SETTINGS_KEY] as Partial<Settings> | undefined) });
      setConnection(stored[CONNECTION_KEY] ? 'connected' : 'disconnected');
    });
  }, []);

  const updateSetting = (field: keyof Settings, value: string) => {
    setSettings((current) => ({ ...current, [field]: value }));
  };

  const saveSettings = async () => {
    const trimmedUrl = settings.spreadsheetUrl.trim();
    if (trimmedUrl && !/^https:\/\/docs\.google\.com\/spreadsheets\/d\/[a-zA-Z0-9_-]+/.test(trimmedUrl)) {
      setMessage('Enter a valid Google Sheets URL.');
      return;
    }
    if (!settings.sheetName.trim()) {
      setMessage('Enter the sheet tab name (for example, LeetTrack).');
      return;
    }

    setSaving(true);
    try {
      const nextSettings = { spreadsheetUrl: trimmedUrl, sheetName: settings.sheetName.trim() };
      await chrome.storage.local.set({ [SETTINGS_KEY]: nextSettings });
      setSettings(nextSettings);
      setMessage('Settings saved on this browser.');
    } catch {
      setMessage('Could not save settings. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const syncNow = () => {
    setMessage('Syncing saved problems to Google Sheets…');
    chrome.runtime.sendMessage({ type: 'LEETTRACK_SYNC_ALL' }, (response) => {
      const error = chrome.runtime.lastError;
      if (error) {
        setMessage(error.message ?? 'Could not start Google Sheets sync.');
        return;
      }
      setMessage(response?.ok
        ? `Sync complete: ${response.synced} problem record(s) uploaded.`
        : response?.error ?? 'Sync failed. Please try again.');
    });
  };

  const connectGoogle = () => {
    setMessage('Opening Google sign-in…');
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      const error = chrome.runtime.lastError;
      if (error || !token) {
        setConnection('disconnected');
        setMessage(error?.message ?? 'Google sign-in did not return an access token.');
        return;
      }
      chrome.storage.local.set({ [CONNECTION_KEY]: true }, () => {
        setConnection('connected');
        setMessage('Google account authorized. Sheet sync will be enabled in the next step.');
      });
    });
  };

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
          <strong>{connection === 'checking' ? 'Checking Google connection…' : connection === 'connected' ? 'Google account authorized' : 'Google account not connected'}</strong>
          <p>Connect your Google account to authorize LeetTrack to access your spreadsheet.</p>
        </div>
      </section>

      <section className="settings-card">
        <p className="eyebrow">GOOGLE SHEETS</p>
        <h2>Sync destination</h2>
        <label htmlFor="spreadsheet-url">Google Sheet URL</label>
        <input
          id="spreadsheet-url"
          type="url"
          placeholder="https://docs.google.com/spreadsheets/d/…"
          value={settings.spreadsheetUrl}
          onChange={(event) => updateSetting('spreadsheetUrl', event.target.value)}
        />
        <label htmlFor="sheet-name">Sheet tab name</label>
        <input
          id="sheet-name"
          type="text"
          placeholder="LeetTrack"
          value={settings.sheetName}
          onChange={(event) => updateSetting('sheetName', event.target.value)}
        />
        <button className="secondary-button" onClick={saveSettings} disabled={saving}>
          {saving ? 'Saving…' : 'Save settings'}
        </button>
        <button className="primary-button" onClick={connectGoogle}>
          {connection === 'connected' ? 'Reconnect Google account' : 'Connect Google account'}
        </button>
        <button className="secondary-button" onClick={syncNow} disabled={connection !== 'connected'}>
          Sync saved problems now
        </button>
        {message && <p className="message" role="status">{message}</p>}
      </section>

      <footer>Local-first · Your revision notes remain saved on this browser</footer>
    </main>
  );
}
