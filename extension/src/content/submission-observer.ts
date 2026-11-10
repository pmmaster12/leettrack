import { extractLeetCodeProblem, type LeetCodeProblemMetadata } from "./leetcode-adapter";

export interface AcceptedSubmission {
  submissionId: string;
  submissionUrl: string;
  problem: LeetCodeProblemMetadata;
}

const SUBMISSION_PATH = /^\/problems\/([^/]+)\/submissions\/(\d+)\/?$/;
const RESULT_SELECTOR = '[data-e2e-locator="submission-result"]';
const PROCESSED_SUBMISSIONS_KEY = "leettrack.processedSubmissionIds";
const PROBLEM_RECORDS_KEY = "leettrack.problemRecords";

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
    difficulty: "Unknown" as LeetCodeProblemMetadata["difficulty"],
    topics: [],
  };
}

/**
 * Watches LeetCode's submission URL and result panel. Submission IDs are
 * checked against persistent local storage so revisiting an old submission
 * does not reopen the remark modal after a page reload or browser restart.
 */
export function observeAcceptedSubmissions(
  onAccepted: (submission: AcceptedSubmission) => void,
): () => void {
  let lastUrl = window.location.href;
  let activeSubmissionId: string | null = null;
  let resultObserver: MutationObserver | null = null;
  const reportedSubmissionIds = new Set<string>();
  const checkingSubmissionIds = new Set<string>();

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
    if (
      submissionId === activeSubmissionId ||
      reportedSubmissionIds.has(submissionId) ||
      checkingSubmissionIds.has(submissionId)
    ) {
      return;
    }

    activeSubmissionId = submissionId;
    resultObserver?.disconnect();

    const checkResult = async (): Promise<void> => {
      const result = document.querySelector<HTMLElement>(RESULT_SELECTOR);
      if (result?.textContent?.trim() !== "Accepted") return;

      if (
        reportedSubmissionIds.has(submissionId) ||
        checkingSubmissionIds.has(submissionId)
      ) {
        resultObserver?.disconnect();
        resultObserver = null;
        return;
      }

      checkingSubmissionIds.add(submissionId);
      try {
        const stored = await chrome.storage.local.get([
          PROCESSED_SUBMISSIONS_KEY,
          PROBLEM_RECORDS_KEY,
        ]);
        const processedIds = (stored[PROCESSED_SUBMISSIONS_KEY] ?? []) as string[];
        const records = (stored[PROBLEM_RECORDS_KEY] ?? {}) as Record<
          string,
          { remarks?: Array<{ submissionId?: string }> }
        >;
        const alreadySaved =
          processedIds.includes(submissionId) ||
          Object.values(records).some((record) =>
            record.remarks?.some((remark) => remark.submissionId === submissionId),
          );

        if (alreadySaved) {
          reportedSubmissionIds.add(submissionId);
          console.info("[LeetTrack] Submission already saved; skipping duplicate:", submissionId);
          resultObserver?.disconnect();
          resultObserver = null;
          return;
        }
      } catch (error) {
        // Do not block capture if storage lookup fails; the save handler will
        // surface any storage error to the user.
        console.warn("[LeetTrack] Could not check saved submission IDs:", error);
      } finally {
        checkingSubmissionIds.delete(submissionId);
      }

      if (reportedSubmissionIds.has(submissionId)) return;

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
    void checkResult();
    if (!reportedSubmissionIds.has(submissionId)) {
      resultObserver = new MutationObserver(() => void checkResult());
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
