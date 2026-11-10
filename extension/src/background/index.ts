interface SavedRemark {
  text: string;
  date: string;
  submissionId: string;
}

interface LeetCodeTopic {
  name: string;
  slug: string;
}

interface LocalProblemRecord {
  problemUrl: string;
  title: string;
  difficulty: string;
  topics: LeetCodeTopic[];
  originalSolveDate: string;
  remarks: SavedRemark[];
}

interface LeetTrackSettings {
  spreadsheetUrl: string;
  sheetName: string;
}

const RECORDS_KEY = "leettrack.problemRecords";
const SETTINGS_KEY = "leettrack.settings";
const HEADERS = ["Problem", "Problem URL", "Difficulty", "Remark", "Date", "Topics"];

chrome.runtime.onInstalled.addListener(() => {
  console.info("[LeetTrack] Extension installed.");
});

function getSpreadsheetId(url: string): string {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  if (!match) throw new Error("Invalid Google Sheets URL. Check your saved settings.");
  return match[1];
}

function getAccessToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: false }, (token) => {
      const error = chrome.runtime.lastError;
      if (error || !token) {
        reject(new Error(error?.message ?? "Google authorization expired. Reconnect your Google account."));
        return;
      }
      resolve(token);
    });
  });
}

async function sheetsRequest<T>(
  token: string,
  url: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Google Sheets API error (${response.status}): ${detail.slice(0, 500)}`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

function quoteSheetName(name: string): string {
  return `'${name.replace(/'/g, "''")}'`;
}

function formatRemarks(remarks: SavedRemark[]): string {
  return remarks
    .map((remark) => {
      const date = new Date(remark.date);
      const dateLabel = Number.isNaN(date.getTime())
        ? remark.date
        : date.toLocaleDateString("en-CA");
      return `[${dateLabel}] ${remark.text}`;
    })
    .join("\n");
}

async function syncRecords(): Promise<{ synced: number }> {
  const stored = await chrome.storage.local.get([RECORDS_KEY, SETTINGS_KEY]);
  const records = (stored[RECORDS_KEY] ?? {}) as Record<string, LocalProblemRecord>;
  const settings = stored[SETTINGS_KEY] as LeetTrackSettings | undefined;
  if (!settings?.spreadsheetUrl || !settings.sheetName?.trim()) {
    throw new Error("Add your Google Sheet URL and tab name in LeetTrack settings first.");
  }

  const spreadsheetId = getSpreadsheetId(settings.spreadsheetUrl);
  const sheet = quoteSheetName(settings.sheetName.trim());
  const baseUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values`;
  const token = await getAccessToken();

  const existing = await sheetsRequest<{ values?: string[][] }>(
    token,
    `${baseUrl}/${encodeURIComponent(sheet + "!A:F")}?majorDimension=ROWS`,
  );
  const rows = existing.values ?? [];

  if (!rows.length) {
    await sheetsRequest(
      token,
      `${baseUrl}/${encodeURIComponent(sheet + "!A1:F1")}?valueInputOption=RAW`,
      {
        method: "PUT",
        body: JSON.stringify({ values: [HEADERS] }),
      },
    );
    rows.push(HEADERS);
  } else if (rows[0].slice(0, HEADERS.length).join("|") !== HEADERS.join("|")) {
    throw new Error(`The first row of "${settings.sheetName}" must contain: ${HEADERS.join(" | ")}. Please use a blank tab or add these headers.`);
  }

  const rowByUrl = new Map<string, number>();
  rows.slice(1).forEach((row, index) => {
    const url = row[1];
    if (url) rowByUrl.set(url, index + 2);
  });

  let synced = 0;
  for (const record of Object.values(records)) {
    const row = [
      record.title,
      record.problemUrl,
      record.difficulty,
      formatRemarks(record.remarks ?? []),
      record.originalSolveDate,
      (record.topics ?? []).map((topic) => topic.name).join(", "),
    ];
    const existingRow = rowByUrl.get(record.problemUrl);
    const range = existingRow
      ? `${sheet}!A${existingRow}:F${existingRow}`
      : `${sheet}!A:F`;
    const method = existingRow ? "PUT" : "POST";
    const endpoint = existingRow
      ? `${baseUrl}/${encodeURIComponent(range)}?valueInputOption=RAW`
      : `${baseUrl}/${encodeURIComponent(range)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`;

    await sheetsRequest(token, endpoint, {
      method,
      body: JSON.stringify({ values: [row] }),
    });
    synced += 1;
  }

  return { synced };
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "LEETTRACK_PING") {
    sendResponse({
      type: "LEETTRACK_PONG",
      ok: true,
      message: "Background service worker is available.",
    });
    return false;
  }

  if (message?.type === "LEETTRACK_SYNC_ALL") {
    syncRecords()
      .then((result) => sendResponse({ ok: true, ...result }))
      .catch((error: unknown) => {
        const messageText = error instanceof Error ? error.message : "Unknown sync error.";
        console.error("[LeetTrack] Google Sheets sync failed:", error);
        sendResponse({ ok: false, error: messageText });
      });
    return true;
  }

  return false;
});
