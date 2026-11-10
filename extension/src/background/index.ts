/**
 * LeetTrack background service worker.
 * M1 responsibility: prove that the content script can reach the worker.
 * Later milestones will add auth, persistence, and save orchestration here.
 */

chrome.runtime.onInstalled.addListener(() => {
  console.info('[LeetTrack] Extension installed.');
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === 'LEETTRACK_PING') {
    sendResponse({
      type: 'LEETTRACK_PONG',
      ok: true,
      message: 'Background service worker is available.',
    });
  }

  return false;
});
