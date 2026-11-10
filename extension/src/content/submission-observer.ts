import { extractLeetCodeProblem, type LeetCodeProblemMetadata } from "./leetcode-adapter";

export interface AcceptedSubmission {
  submissionId: string;
  submissionUrl: string;
  problem: LeetCodeProblemMetadata;
}

const SUBMISSION_PATH = /^\/problems\/([^/]+)\/submissions\/(\d+)\/?$/;
const RESULT_SELECTOR = '[data-e2e-locator="submission-result"]';

function fallbackProblemMetadata(
  problemSlug: string,
  currentUrl: URL,
): LeetCodeProblemMetadata {
  const titleFromHeading =
    document.querySelector("h1")?.textContent?.trim() ||
    document.title.replace(/\s*[-|]\s*LeetCode.*$/i, "").trim();

  const title =
    titleFromHeading ||
    problemSlug
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

  return {
    title,
    problemUrl: `${currentUrl.origin}/problems/${problemSlug}/`,
    // The submission details page often omits difficulty and topic metadata.
    // Keep the modal usable and let the user add topics manually.
    difficulty: "Unknown" as LeetCodeProblemMetadata["difficulty"],
    topics: [],
  };
}

/**
 * Watches LeetCode's submission URL and result panel. The submission ID in
 * the URL is the primary identity and deduplication key.
 */
export function observeAcceptedSubmissions(
  onAccepted: (submission: AcceptedSubmission) => void,
): () => void {
  let lastUrl = window.location.href;
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
    if (submissionId === activeSubmissionId || reportedSubmissionIds.has(submissionId)) {
      return;
    }

    activeSubmissionId = submissionId;
    resultObserver?.disconnect();

    const checkResult = (): void => {
      const result = document.querySelector<HTMLElement>(RESULT_SELECTOR);
      if (result?.textContent?.trim() !== "Accepted") {
        return;
      }

      if (reportedSubmissionIds.has(submissionId)) {
        resultObserver?.disconnect();
        resultObserver = null;
        return;
      }

      const problem =
        extractLeetCodeProblem() ?? fallbackProblemMetadata(problemSlug, url);

      reportedSubmissionIds.add(submissionId);
      console.info("[LeetTrack] Accepted result matched submission URL:", submissionId);
      onAccepted({
        submissionId,
        submissionUrl: url.href,
        problem,
      });

      resultObserver?.disconnect();
      resultObserver = null;
    };

    // On a full page load, the result may already be present. On SPA navigation,
    // the observer waits until LeetCode renders the result for the new ID.
    checkResult();
    if (!reportedSubmissionIds.has(submissionId)) {
      resultObserver = new MutationObserver(checkResult);
      resultObserver.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }
  };

  const pollForNavigation = (): void => {
    const currentUrl = window.location.href;
    if (currentUrl === lastUrl) return;

    lastUrl = currentUrl;
    inspectCurrentSubmission();
  };

  const intervalId = window.setInterval(pollForNavigation, 300);
  inspectCurrentSubmission();

  return () => {
    window.clearInterval(intervalId);
    resultObserver?.disconnect();
  };
}
