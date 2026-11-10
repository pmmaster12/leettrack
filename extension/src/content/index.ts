/**
 * LeetTrack content-script entry point.
 * LeetCode-specific DOM parsing lives in leetcode-adapter.ts.
 */

import { extractLeetCodeProblem } from "./leetcode-adapter";
import { observeAcceptedSubmissions } from "./submission-observer";
import { openAcceptedRemarkModal } from "./remark-modal";

const LEETTRACK_MARKER = "[LeetTrack]";

function logCurrentProblem(): void {
  const problem = extractLeetCodeProblem();

  if (!problem) {
    console.info(`${LEETTRACK_MARKER} Problem metadata is not available yet.`);
    return;
  }

  console.info(`${LEETTRACK_MARKER} Problem metadata extracted:`, problem);
}

console.info(`${LEETTRACK_MARKER} Content script loaded on`, window.location.href);
logCurrentProblem();

const stopObservingSubmissions = observeAcceptedSubmissions((submission) => {
  console.info(`${LEETTRACK_MARKER} Newly accepted submission detected:`, submission);
  void openAcceptedRemarkModal(submission);
});

// Keep the observer lifecycle explicit for future SPA/navigation cleanup.
window.addEventListener("pagehide", stopObservingSubmissions, { once: true });

chrome.runtime.sendMessage({ type: "LEETTRACK_PING" }, (response) => {
  if (chrome.runtime.lastError) {
    console.warn(
      `${LEETTRACK_MARKER} Background ping failed:`,
      chrome.runtime.lastError.message,
    );
    return;
  }

  if (response?.ok) {
    console.info(`${LEETTRACK_MARKER} Background connection verified.`);
  }
});
