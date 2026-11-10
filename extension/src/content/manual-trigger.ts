import { extractLeetCodeProblem } from "./leetcode-adapter";
import type { AcceptedSubmission } from "./submission-observer";

const HOST_ID = "leettrack-manual-trigger-host";
const PROBLEM_PATH = /^\/problems\/([^/]+)\/?$/;

function isProblemPage(): boolean {
  return PROBLEM_PATH.test(window.location.pathname);
}

/**
 * Adds a small floating capture button on problem pages. A manual capture gets
 * its own synthetic ID so it can coexist with Accepted submission revisions.
 */
export function mountManualCaptureButton(
  onCapture: (submission: AcceptedSubmission) => void,
): () => void {
  const host = document.createElement("div");
  host.id = HOST_ID;
  const shadow = host.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = `
    :host { all: initial; }
    .button {
      position: fixed; right: 24px; bottom: 24px; z-index: 2147483646;
      display: inline-flex; align-items: center; gap: 8px;
      padding: 12px 16px; border: 0; border-radius: 999px;
      background: #4f46e5; color: #fff; cursor: pointer;
      box-shadow: 0 8px 24px rgba(30, 27, 75, .28);
      font: 650 13px/1.2 Inter, ui-sans-serif, system-ui, sans-serif;
      transition: transform .15s ease, background .15s ease;
    }
    .button:hover { background: #4338ca; transform: translateY(-2px); }
    .button:focus-visible { outline: 3px solid #a5b4fc; outline-offset: 3px; }
    .button:disabled { opacity: .6; cursor: not-allowed; transform: none; }
    .mark { display:grid; place-items:center; width:19px; height:19px; border-radius:50%; background:rgba(255,255,255,.18); font-size:16px; }
  `;

  const button = document.createElement("button");
  button.className = "button";
  button.type = "button";
  button.innerHTML = '<span class="mark" aria-hidden="true">+</span><span>Save to LeetTrack</span>';
  button.setAttribute("aria-label", "Manually add this problem to LeetTrack");

  button.addEventListener("click", () => {
    const problem = extractLeetCodeProblem();
    if (!problem) {
      button.disabled = true;
      button.setAttribute("aria-label", "Problem details are still loading");
      window.setTimeout(() => {
        button.disabled = false;
        button.setAttribute("aria-label", "Manually add this problem to LeetTrack");
      }, 1200);
      return;
    }

    onCapture({
      submissionId: `manual-${crypto.randomUUID()}`,
      submissionUrl: problem.problemUrl,
      problem,
    });
  });

  shadow.append(style, button);
  document.documentElement.append(host);

  let lastUrl = window.location.href;
  const syncVisibility = (): void => {
    const visible = isProblemPage();
    host.style.display = visible ? "block" : "none";
  };
  syncVisibility();

  const intervalId = window.setInterval(() => {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      syncVisibility();
    }
  }, 300);

  return () => {
    window.clearInterval(intervalId);
    host.remove();
  };
}
