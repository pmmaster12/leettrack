export type LeetCodeDifficulty = "Easy" | "Medium" | "Hard";

export interface LeetCodeTopic {
  name: string;
  slug: string;
}

export interface LeetCodeProblemMetadata {
  title: string;
  problemUrl: string;
  difficulty: LeetCodeDifficulty;
  topics: LeetCodeTopic[];
}

const DIFFICULTY_BY_CLASS: Record<string, LeetCodeDifficulty> = {
  "text-difficulty-easy": "Easy",
  "text-difficulty-medium": "Medium",
  "text-difficulty-hard": "Hard",
};

/**
 * Extract metadata for the problem currently open in LeetCode.
 *
 * Keep LeetCode-specific DOM selectors in this adapter so UI changes can be
 * handled here without spreading selectors across the extension.
 */
export function extractLeetCodeProblem(
  doc: Document = document,
  currentUrl: string = window.location.href,
): LeetCodeProblemMetadata | null {
  const parsedUrl = new URL(currentUrl);
  const problemMatch = parsedUrl.pathname.match(/^\/problems\/([^/]+)\/?/);

  if (!problemMatch) {
    return null;
  }

  const problemSlug = problemMatch[1];
  const problemUrl = `${parsedUrl.origin}/problems/${problemSlug}/`;

  // LeetCode's document title currently follows: "<title> - LeetCode".
  const title = doc.title.replace(/\s*-\s*LeetCode\s*$/, "").trim();

  if (!title) {
    return null;
  }

  const difficultyElement = [...doc.querySelectorAll<HTMLElement>(
    'div[class*="text-difficulty-"]',
  )].find((element) => {
    const text = element.textContent?.trim();
    return text === "Easy" || text === "Medium" || text === "Hard";
  });

  const difficultyClass = difficultyElement
    ? Object.keys(DIFFICULTY_BY_CLASS).find((className) =>
        difficultyElement.className.includes(className),
      )
    : undefined;

  const difficulty = difficultyClass
    ? DIFFICULTY_BY_CLASS[difficultyClass]
    : undefined;

  if (!difficulty) {
    return null;
  }

  // The problem's Topics section contains /tag/<slug>/ links. Contest links
  // use /contest/ and labels such as "Senior" are not anchors, so they are
  // naturally excluded.
  const topicsSection = [...doc.querySelectorAll<HTMLElement>("div.flex.flex-col")]
    .find((element) => element.firstElementChild?.textContent?.trim() === "Topics");

  const firstTopicLink = topicsSection?.querySelector<HTMLAnchorElement>(
    'a[href^="/tag/"]',
  );
  const topicContainer = firstTopicLink?.parentElement;

  const topics: LeetCodeTopic[] = topicContainer
    ? [...topicContainer.querySelectorAll<HTMLAnchorElement>('a[href^="/tag/"]')]
        .map((anchor) => {
          const name = anchor.textContent?.trim() ?? "";
          const href = anchor.getAttribute("href") ?? "";
          const slug = href.replace(/^\/tag\//, "").replace(/\/$/, "");

          return { name, slug };
        })
        .filter((topic) => topic.name.length > 0 && topic.slug.length > 0)
    : [];

  return {
    title,
    problemUrl,
    difficulty,
    topics,
  };
}
