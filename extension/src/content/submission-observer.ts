import { extractLeetCodeProblem, type LeetCodeProblemMetadata } from "./leetcode-adapter";

export interface AcceptedSubmission {
  submissionId: string;
  submissionUrl: string;
  problem: LeetCodeProblemMetadata;
}

const SUBMISSION_PATH = /^\/problems\/([^/]+)\/submissions\/(\d+)\/?$/;
const RESULT_SELECTOR = '[data-e2e-locator="submission-result"]';

/**
 * Watches LeetCode's SPA URL and result panel for newly completed submissions.
 * A submission URL contains a unique ID, so repeated submissions of the same
 * problem are treated as separate events.
 */
export function observeAcceptedSubmissions(
  onAccepted: (submission: AcceptedSubmission) => void,
): () => void {
  let lastUrl = window.location.href;
  let lastKnownResultNode = document.querySelector(RESULT_SELECTOR);
  let activeSubmissionId: string | null = null;
  let resultObserver: MutationObserver | null = null;
  const reportedSubmissionIds = new Set<string>();

  const inspectCurrentSubmission = (): void => {
    const url = new URL(window.location.href);
    const match = url.pathname.match(SUBMISSION_PATH);

    if (!match) {
      activeSubmissionId = null;
      resultObserver?.disconnect();
      resultObserver = null;
      return;
    }

    const [, problemSlug, submissionId] = match;

    if (submissionId === activeSubmissionId) {
      return;
    }

    activeSubmissionId = submissionId;
    resultObserver?.disconnect();

    // Compare against the result node observed before navigation. The new
    // panel may already be rendered by the time our URL poll notices navigation.
    const previousResultNode = lastKnownResultNode;

    const checkResult = (): void => {
      const result = document.querySelector<HTMLElement>(RESULT_SELECTOR);
      if (!result || result === previousResultNode || result.textContent?.trim() !== "Accepted") {
        return;
      }

      if (reportedSubmissionIds.has(submissionId)) {
        return;
      }

      const problem = extractLeetCodeProblem();
      if (!problem || !problem.problemUrl.endsWith(`/problems/${problemSlug}/`)) {
        return;
      }

      reportedSubmissionIds.add(submissionId);
      onAccepted({
        submissionId,
        submissionUrl: url.href,
        problem,
      });
      resultObserver?.disconnect();
      resultObserver = null;
    };

    // The URL can update before React renders the new submission result.
    resultObserver = new MutationObserver(checkResult);
    resultObserver.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  };

  const pollForNavigation = (): void => {
    const currentUrl = window.location.href;
    if (currentUrl === lastUrl) {
      lastKnownResultNode = document.querySelector(RESULT_SELECTOR);
      return;
    }

    lastUrl = currentUrl;
    inspectCurrentSubmission();
    lastKnownResultNode = document.querySelector(RESULT_SELECTOR);
  };

  const intervalId = window.setInterval(pollForNavigation, 400);

  // Handle a submission page that was opened directly or refreshed.
  inspectCurrentSubmission();

  return () => {
    window.clearInterval(intervalId);
    resultObserver?.disconnect();
  };
}
