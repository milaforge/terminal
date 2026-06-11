export const BLOG_COMMENTS_SCRIPT_SRC = "https://utteranc.es/client.js";
export const BLOG_COMMENTS_REPO = "failuresmith/terminal";

export const BLOG_COMMENTS_ATTRIBUTES = {
  repo: BLOG_COMMENTS_REPO,
  "issue-term": "pathname",
  label: "blog-comment",
  theme: "github-light",
} as const;

export function getUtterancesScriptAttributes() {
  return {
    src: BLOG_COMMENTS_SCRIPT_SRC,
    crossorigin: "anonymous",
    async: "true",
    ...BLOG_COMMENTS_ATTRIBUTES,
  } as const;
}
