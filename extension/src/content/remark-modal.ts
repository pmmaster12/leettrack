import type { AcceptedSubmission } from "./submission-observer";
import type { LeetCodeTopic } from "./leetcode-adapter";

interface SavedRemark {
  text: string;
  date: string;
  submissionId: string;
}

interface LocalProblemRecord {
  problemUrl: string;
  title: string;
  difficulty: string;
  topics: LeetCodeTopic[];
  originalSolveDate: string;
  remarks: SavedRemark[];
}

const STORAGE_KEY = "leettrack.problemRecords";
const HOST_ID = "leettrack-modal-host";

function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

export async function openAcceptedRemarkModal(
  submission: AcceptedSubmission,
): Promise<void> {
  document.getElementById(HOST_ID)?.remove();

  const host = createElement("div");
  host.id = HOST_ID;
  const shadow = host.attachShadow({ mode: "open" });

  const style = createElement("style");
  style.textContent = `
    :host { all: initial; }
    * { box-sizing: border-box; }
    .backdrop {
      position: fixed; inset: 0; z-index: 2147483647;
      display: grid; place-items: center; padding: 20px;
      background: rgba(15, 23, 42, .58);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    .modal {
      width: min(520px, 100%); max-height: min(760px, 92vh); overflow: auto;
      padding: 24px; border: 1px solid #e2e8f0; border-radius: 18px;
      background: #fff; color: #0f172a; box-shadow: 0 24px 80px rgba(0,0,0,.28);
    }
    .top { display:flex; justify-content:space-between; align-items:flex-start; gap:16px; }
    .eyebrow { color:#64748b; font-size:11px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; }
    h2 { margin:6px 0 4px; font-size:21px; line-height:1.3; font-weight:750; }
    .subtitle { margin:0; color:#64748b; font-size:13px; }
    .close { border:0; background:transparent; color:#64748b; font-size:24px; cursor:pointer; line-height:1; padding:0 2px; }
    .success { display:flex; align-items:center; gap:8px; margin:20px 0; padding:11px 12px; border-radius:10px; background:#ecfdf5; color:#047857; font-size:13px; font-weight:650; }
    .label { display:block; margin:18px 0 8px; color:#334155; font-size:13px; font-weight:650; }
    textarea { width:100%; min-height:132px; resize:vertical; padding:12px; border:1px solid #cbd5e1; border-radius:10px; outline:none; color:#0f172a; font:14px/1.5 inherit; }
    textarea:focus, input:focus { border-color:#6366f1; box-shadow:0 0 0 3px rgba(99,102,241,.12); }
    .hint { margin:6px 0 0; color:#94a3b8; font-size:11px; }
    .topics { display:flex; flex-wrap:wrap; gap:7px; }
    .topic { display:flex; align-items:center; gap:6px; padding:6px 9px; border:1px solid #c7d2fe; border-radius:999px; background:#eef2ff; color:#3730a3; font-size:12px; }
    .topic button { border:0; padding:0; background:transparent; color:#6366f1; cursor:pointer; font-size:15px; line-height:1; }
    .add-row { display:flex; gap:8px; margin-top:9px; }
    input { min-width:0; flex:1; padding:9px 10px; border:1px solid #cbd5e1; border-radius:8px; outline:none; font-size:13px; }
    .add { padding:0 13px; border:1px solid #cbd5e1; border-radius:8px; background:#fff; color:#334155; cursor:pointer; }
    .actions { display:flex; justify-content:flex-end; gap:9px; margin-top:24px; }
    .btn { padding:10px 15px; border:1px solid #cbd5e1; border-radius:9px; background:#fff; color:#334155; font-size:13px; font-weight:650; cursor:pointer; }
    .primary { border-color:#4f46e5; background:#4f46e5; color:#fff; }
    .primary:disabled { opacity:.55; cursor:wait; }
    .status { min-height:17px; margin-top:10px; color:#64748b; font-size:12px; text-align:right; }
  `;

  const backdrop = createElement("div", "backdrop");
  const modal = createElement("section", "modal");
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-labelledby", "leettrack-title");

  const header = createElement("div", "top");
  const heading = createElement("div");
  heading.append(
    createElement("div", "eyebrow", "Accepted submission"),
    Object.assign(createElement("h2"), { id: "leettrack-title", textContent: submission.problem.title }),
    createElement("p", "subtitle", submission.problem.difficulty),
  );
  const close = createElement("button", "close", "×");
  close.type = "button";
  close.setAttribute("aria-label", "Close");
  header.append(heading, close);

  const success = createElement("div", "success", "✓  Nice work! Capture what you learned while it's fresh.");
  const remarkLabel = createElement("label", "label", "Revision remark");
  const textarea = createElement("textarea");
  textarea.placeholder = "What was the key insight? What did you miss? What should you remember next time?";
  textarea.maxLength = 10000;
  remarkLabel.htmlFor = "leettrack-remark";
  textarea.id = "leettrack-remark";

  const topicsLabel = createElement("div", "label", "Topics");
  const topicsContainer = createElement("div", "topics");
  let topics = [...submission.problem.topics];

  const renderTopics = (): void => {
    topicsContainer.replaceChildren();
    topics.forEach((topic) => {
      const chip = createElement("span", "topic", topic.name);
      const remove = createElement("button", undefined, "×");
      remove.type = "button";
      remove.setAttribute("aria-label", `Remove ${topic.name}`);
      remove.addEventListener("click", () => {
        topics = topics.filter((item) => item.slug !== topic.slug);
        renderTopics();
      });
      chip.append(remove);
      topicsContainer.append(chip);
    });
  };
  renderTopics();

  const addRow = createElement("div", "add-row");
  const topicInput = createElement("input");
  topicInput.placeholder = "Add a topic";
  topicInput.setAttribute("aria-label", "New topic");
  const addButton = createElement("button", "add", "Add");
  addButton.type = "button";
  const addTopic = (): void => {
    const name = topicInput.value.trim();
    if (!name) return;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    if (!topics.some((topic) => topic.slug === slug)) {
      topics = [...topics, { name, slug }];
      renderTopics();
    }
    topicInput.value = "";
  };
  addButton.addEventListener("click", addTopic);
  topicInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addTopic();
    }
  });
  addRow.append(topicInput, addButton);

  const hint = createElement("p", "hint", "You can edit these tags before saving.");
  const actions = createElement("div", "actions");
  const cancel = createElement("button", "btn", "Not now");
  cancel.type = "button";
  const save = createElement("button", "btn primary", "Save remark");
  save.type = "button";
  const status = createElement("div", "status");

  const closeModal = (): void => host.remove();
  close.addEventListener("click", closeModal);
  cancel.addEventListener("click", closeModal);
  backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop) closeModal();
  });
  shadow.addEventListener("keydown", (event: KeyboardEvent) => {
    if (event.key === "Escape") closeModal();
  });

  save.addEventListener("click", async () => {
    const remark = textarea.value.trim();
    if (!remark) {
      status.textContent = "Add a remark before saving.";
      textarea.focus();
      return;
    }

    save.disabled = true;
    status.textContent = "Saving locally…";

    try {
      const stored = await chrome.storage.local.get(STORAGE_KEY);
      const records = (stored[STORAGE_KEY] ?? {}) as Record<string, LocalProblemRecord>;
      const key = submission.problem.problemUrl;
      const existing = records[key];
      const now = new Date().toISOString();

      records[key] = {
        problemUrl: key,
        title: submission.problem.title,
        difficulty: submission.problem.difficulty,
        topics,
        originalSolveDate: existing?.originalSolveDate ?? now,
        remarks: [
          ...(existing?.remarks ?? []),
          { text: remark, date: now, submissionId: submission.submissionId },
        ],
      };

      await chrome.storage.local.set({ [STORAGE_KEY]: records });
      status.textContent = "Saved on this browser. Google Sheets sync comes next.";
      save.textContent = "Saved";
      window.setTimeout(closeModal, 1100);
    } catch (error) {
      console.error("[LeetTrack] Failed to save remark locally:", error);
      status.textContent = "Couldn't save. Please try again.";
      save.disabled = false;
    }
  });

  actions.append(cancel, save);
  modal.append(header, success, remarkLabel, textarea, topicsLabel, topicsContainer, addRow, hint, actions, status);
  backdrop.append(modal);
  shadow.append(style, backdrop);
  document.documentElement.append(host);
  textarea.focus();
}
