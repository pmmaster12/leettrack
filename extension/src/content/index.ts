/**
 * LeetTrack content-script entry point.
 * This file intentionally has no imports so Vite can emit a self-contained
 * classic content script for Chrome. LeetCode parsing arrives in M2.
 */

const LEETTRACK_MARKER = '[LeetTrack]';

console.info(`${LEETTRACK_MARKER} Content script loaded on`, window.location.href);

chrome.runtime.sendMessage({ type: 'LEETTRACK_PING' }, (response) => {
  if (chrome.runtime.lastError) {
    console.warn(`${LEETTRACK_MARKER} Background ping failed:`, chrome.runtime.lastError.message);
    return;
  }

  if (response?.ok) {
    console.info(`${LEETTRACK_MARKER} Background connection verified.`);
  }
});
